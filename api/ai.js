// =========================================================
// Serverless AI Endpoint for Vercel / Node.js
// Proxies AI requests securely to Google Gemini without
// ever exposing the server-side GEMINI_API_KEY to the browser.
// =========================================================

// In-memory sliding window rate limiter per serverless instance
const ipRequestHistory = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;     // Max 20 requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const history = ipRequestHistory.get(ip) || [];
  
  // Filter out timestamps outside the sliding window
  const validTimestamps = history.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(ip, validTimestamps);
    return true;
  }
  
  validTimestamps.push(now);
  ipRequestHistory.set(ip, validTimestamps);

  // Periodically clean up old entries if map grows large
  if (ipRequestHistory.size > 10000) {
    for (const [key, timestamps] of ipRequestHistory.entries()) {
      if (timestamps.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        ipRequestHistory.delete(key);
      }
    }
  }

  return false;
}

// Clean and safely extract JSON from LLM output
function extractJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty response received from AI engine.');
  }

  let cleaned = text.trim();

  // Strip Markdown code fences if present (```json ... ``` or ``` ...)
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(fenceRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = -1;

  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const endIdx = Math.max(lastBrace, lastBracket);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  return JSON.parse(cleaned);
}

// Call Google Gemini REST API directly with automated model resilience and fallback
async function callGemini(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('SERVER_KEY_NOT_CONFIGURED');
  }

  const userConfiguredModel = (process.env.GEMINI_MODEL || '').trim();
  const candidateModels = [];

  if (
    userConfiguredModel &&
    !userConfiguredModel.includes('1.5') &&
    userConfiguredModel !== 'gemini-2.5-flash' &&
    userConfiguredModel !== 'gemini-2.5-flash-lite' &&
    userConfiguredModel !== 'gemini-2.5-pro'
  ) {
    candidateModels.push(userConfiguredModel);
  }

  // Fallback candidate list in order of reliability and performance
  const defaults = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.8-flash'];
  for (const m of defaults) {
    if (!candidateModels.includes(m)) {
      candidateModels.push(m);
    }
  }

  let lastError = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    const requestPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            ...(systemInstruction ? [{ text: `SYSTEM INSTRUCTIONS:\n${systemInstruction}\n\n` }] : []),
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        responseMimeType: 'application/json',
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 48000);

    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AI Serverless] Invoking Gemini model: ${model}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let parsedErr = {};
        try { parsedErr = JSON.parse(errorText); } catch (_) {}

        const errorStatus = parsedErr?.error?.status || '';
        const errorMsg = parsedErr?.error?.message || errorText;

        if (process.env.NODE_ENV !== 'production') {
          console.error(`[AI Serverless] ${model} HTTP ${response.status} (${errorStatus}):`, errorMsg);
        }

        // If high demand spike (503) or model unavailable (404), seamlessly fallback to next model
        if ((response.status === 503 || response.status === 404) && i < candidateModels.length - 1) {
          lastError = new Error(`Gemini ${model} error (${response.status}): ${errorMsg}`);
          continue;
        }

        if (response.status === 404 || errorStatus === 'NOT_FOUND') {
          const err = new Error(`Gemini model or endpoint not found (${model}).`);
          err.statusCode = 404;
          throw err;
        }

        if (response.status === 429 || errorStatus === 'RESOURCE_EXHAUSTED' || errorMsg.toLowerCase().includes('quota')) {
          const err = new Error('AI usage is temporarily busy. Please try again in a moment.');
          err.statusCode = 429;
          throw err;
        }

        if (response.status === 401 || response.status === 403 || errorStatus === 'PERMISSION_DENIED' || errorStatus === 'UNAUTHENTICATED') {
          const err = new Error('Gemini authentication/configuration error. Please verify GEMINI_API_KEY.');
          err.statusCode = 401;
          throw err;
        }

        if (response.status === 400 || errorStatus === 'INVALID_ARGUMENT') {
          const err = new Error(`Gemini request rejected: ${errorMsg}`);
          err.statusCode = 400;
          throw err;
        }

        const err = new Error(`Gemini service error (${response.status}): ${errorMsg}`);
        err.statusCode = response.status >= 500 ? 503 : response.status;
        throw err;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const textPart = candidate?.content?.parts?.[0]?.text;

      if (!textPart) {
        throw new Error('No generated text returned from AI model.');
      }

      return extractJSON(textPart);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutErr = new Error('The AI request timed out. Please try again.');
        timeoutErr.statusCode = 504;
        throw timeoutErr;
      }
      if (i === candidateModels.length - 1) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model candidates failed.');
}

// -------------------------------------------------------------
// OPERATION PROMPT BUILDERS
// -------------------------------------------------------------

function buildAnalyzePrompt(payload) {
  const { content = '', url = '', structuredInfo = {}, targetRole = 'Software Developer' } = payload;
  
  const combinedContext = `
TARGET ROLE: ${targetRole}
PORTFOLIO URL: ${url || 'Not provided'}
CANDIDATE NAME: ${structuredInfo.name || 'Developer'}
CURRENT ROLE / TITLE: ${structuredInfo.role || 'Software Engineer'}
SKILLS: ${Array.isArray(structuredInfo.skills) ? structuredInfo.skills.join(', ') : (structuredInfo.skills || 'Not specified')}
PROJECTS: ${JSON.stringify(structuredInfo.projects || [])}
EXPERIENCE: ${JSON.stringify(structuredInfo.experience || [])}
EDUCATION: ${structuredInfo.education || 'Not specified'}
LINKS: GitHub: ${structuredInfo.github || 'N/A'}, LinkedIn: ${structuredInfo.linkedin || 'N/A'}

RAW / PASTED PORTFOLIO CONTENT:
${content || '(No additional raw content provided)'}
`;

  const systemInstruction = `You are an expert Technical Portfolio Reviewer and Staff Software Architect evaluating developer portfolios.
Your job is to provide rigorous, constructive, and evidence-based portfolio reviews.

STRICT TONE & CREDIBILITY GUIDELINES:
1. EVIDENCE-BASED SEPARATION:
   - OBSERVED: Ground every observation strictly in what is explicitly present in the submitted portfolio.
   - INFERENCE: When making reasonable interpretations, frame them clearly as inferences rather than objective facts.
   - RECOMMENDATION: Frame improvements as constructive opportunities, not mandatory absolutes.
2. NO SPECULATIVE RECRUITER PREDICTIONS AS FACT:
   - NEVER make absolute claims about recruiter actions (e.g. NEVER say "causing immediate recruiter bounce", "will cause recruiter drop-off", "will get rejected", "will get hired", "recruiters will definitely", "guaranteed", "top X%", "better than X%").
   - Use appropriately qualified, professional language:
     * "may increase the likelihood of an early drop-off during an initial portfolio scan"
     * "may make it harder to communicate technical depth during a brief initial review"
     * "may leave reviewers without clear evidence of production complexity"
3. DO NOT INVENT SENIORITY LEVELS:
   - Evaluate specifically for the target role: "${targetRole}".
   - Do NOT assume or append "Junior", "Mid-level", "Senior", "Lead", or "Mid-to-Senior" unless explicitly provided in the candidate's input.
   - Refer to the role simply as "For ${targetRole} roles..." or the exact title provided.
4. STRICT JSON OUTPUT:
   - You MUST output strictly valid JSON matching the schema with zero markdown wrapping.`;

  const prompt = `
Evaluate the developer portfolio provided below for the target role "${targetRole}".
Analyze it across all 10 core dimensions and return a single valid JSON object.

Portfolio Data:
${combinedContext}

Return a valid JSON object strictly matching this schema:
{
  "name": "Candidate Name or inferred name",
  "targetRole": "${targetRole}",
  "url": "${url}",
  "overallScore": 82,
  "benchmark": "Recruiter Readiness: 82/100",
  "summary": "2-3 sentences neutral, evidence-based assessment of portfolio presentation, technical depth, and alignment for ${targetRole} roles.",
  "categories": [
    {
      "category": "Content Quality",
      "score": 85,
      "summary": "1-2 sentence overview grounded in observed content",
      "strengths": ["Observed strength 1", "Observed strength 2"],
      "weaknesses": ["Area that could be clearer or more detailed 1"],
      "recommendations": ["Actionable recommendation 1 using qualified phrasing"]
    },
    { "category": "Project Quality", "score": 88, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] },
    { "category": "Technical Positioning", "score": 80, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] },
    { "category": "Visual / UX", "score": 75, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] },
    { "category": "Recruiter Readiness", "score": 82, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] },
    { "category": "Personal Branding", "score": 80, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] },
    { "category": "Clarity", "score": 85, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] },
    { "category": "Impact", "score": 78, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] },
    { "category": "Completeness", "score": 80, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] },
    { "category": "Overall", "score": 82, "summary": "...", "strengths": [], "weaknesses": [], "recommendations": [] }
  ],
  "topStrengths": [
    "Most prominent observed strength 1",
    "Most prominent observed strength 2",
    "Most prominent observed strength 3"
  ],
  "priorityImprovements": [
    {
      "area": "Section name (e.g. Hero Headline)",
      "urgency": "High",
      "issue": "Specific explanation of what could be improved, avoiding absolute predictions",
      "solution": "Direct actionable fix with sample text"
    },
    {
      "area": "Section name (e.g. Project Impact)",
      "urgency": "High",
      "issue": "...",
      "solution": "..."
    },
    {
      "area": "Section name (e.g. Skills Grouping)",
      "urgency": "Medium",
      "issue": "...",
      "solution": "..."
    }
  ],
  "sectionsReview": [
    {
      "section": "Hero",
      "score": 75,
      "status": "Needs Polish",
      "whatWorks": "What works well based on observed content",
      "whatDoesnt": "What is lacking or could be clearer",
      "howToImprove": "Clear, constructive guidance",
      "originalContent": "Brief snippet or inferred original content",
      "aiRewrite": "A high-converting, polished improved version ready to copy"
    },
    {
      "section": "About",
      "score": 78,
      "status": "Good",
      "whatWorks": "...",
      "whatDoesnt": "...",
      "howToImprove": "...",
      "originalContent": "...",
      "aiRewrite": "..."
    },
    {
      "section": "Projects",
      "score": 85,
      "status": "Strong",
      "whatWorks": "...",
      "whatDoesnt": "...",
      "howToImprove": "...",
      "originalContent": "...",
      "aiRewrite": "..."
    },
    {
      "section": "Skills",
      "score": 80,
      "status": "Good",
      "whatWorks": "...",
      "whatDoesnt": "...",
      "howToImprove": "...",
      "originalContent": "...",
      "aiRewrite": "..."
    },
    {
      "section": "Experience",
      "score": 82,
      "status": "Good",
      "whatWorks": "...",
      "whatDoesnt": "...",
      "howToImprove": "...",
      "originalContent": "...",
      "aiRewrite": "..."
    },
    {
      "section": "Recruiter CTA & Contact",
      "score": 80,
      "status": "Good",
      "whatWorks": "...",
      "whatDoesnt": "...",
      "howToImprove": "...",
      "originalContent": "...",
      "aiRewrite": "..."
    }
  ],
  "recruiterPerspective": {
    "firstImpression": "Simulated initial scan impression using qualified language",
    "technicalSignal": "Assessment of technical stack depth and coherence",
    "projectSignal": "Assessment of project scope and execution",
    "missingEvidence": "Key artifacts, tests, or metrics that could strengthen the profile",
    "recommendedChanges": [
      "Suggested change 1",
      "Suggested change 2",
      "Suggested change 3"
    ],
    "interviewTalkingPoints": [
      "Point 1 to highlight in conversation",
      "Point 2 to prepare for",
      "Point 3 technical deep dive"
    ]
  }
}
`;

  return { prompt, systemInstruction };
}

function buildRewritePrompt(payload) {
  const { sectionType = 'About Me', currentContent = '', targetRole = 'Software Developer', instructions = '', tone = 'Recruiter-Optimized' } = payload;
  
  const systemInstruction = `You are an expert technical resume and portfolio writer.
STRICT GUIDELINES:
- Focus on clarity, strong technical positioning, and quantifiable impact.
- Do NOT invent unstated seniority levels (e.g. Senior or Lead) unless explicitly stated in the source content.
- Refer to target role strictly as "${targetRole}".
- Avoid absolute guarantees about hiring outcomes.
- Output strictly valid JSON.`;

  const prompt = `
Rewrite and elevate the following portfolio section: "${sectionType}" for a candidate targeting the role "${targetRole}".

TONE: ${tone}
ADDITIONAL INSTRUCTIONS: ${instructions || 'Focus on clarity, strong technical positioning, and quantifiable impact.'}

CURRENT CONTENT:
${currentContent || '(No current content provided. Generate an exemplary section from scratch.)'}

Return a valid JSON object strictly matching this schema:
{
  "sectionType": "${sectionType}",
  "tone": "${tone}",
  "primarySuggestion": "The recommended rewritten version",
  "alternativeSuggestions": [
    {
      "label": "Short & Punchy",
      "content": "A concise alternative version"
    },
    {
      "label": "Technical & Deep",
      "content": "A technically comprehensive version"
    }
  ],
  "keyImprovementsMade": [
    "Improvement 1",
    "Improvement 2",
    "Improvement 3"
  ],
  "recruiterAdvice": "Advice on how to present this section on a portfolio or resume"
}
`;

  return { prompt, systemInstruction };
}

function buildImproveProjectPrompt(payload) {
  const {
    projectName = '',
    description = '',
    techStack = '',
    problemSolved = '',
    features = '',
    contribution = '',
    impact = '',
    targetRole = 'Full Stack Developer',
  } = payload;

  const systemInstruction = `You are a Senior Principal Engineer and Technical Hiring Advisor.
STRICT GUIDELINES:
- Present technical achievements and architectural decisions with precision.
- Ground descriptions in verifiable engineering patterns.
- Do NOT invent metrics or unstated seniority levels without basis in the input.
- Output strictly valid JSON.`;

  const prompt = `
Transform this software project into compelling recruiter and engineering portfolio content.

TARGET ROLE: ${targetRole}
PROJECT NAME: ${projectName}
ORIGINAL DESCRIPTION: ${description}
TECHNOLOGIES: ${techStack}
PROBLEM SOLVED: ${problemSolved}
KEY FEATURES: ${features}
MY CONTRIBUTION: ${contribution}
METRICS & IMPACT: ${impact}

Return a valid JSON object strictly matching this schema:
{
  "projectName": "${projectName || 'My Project'}",
  "headline": "A crisp, powerful 1-sentence summary",
  "recruiterDescription": "2-3 sentences explaining the business value, core tech stack, and demonstrable impact.",
  "technicalDeepDive": "An engineering-focused breakdown of system architecture, performance optimizations, database choices, and trade-offs.",
  "shortPitch": "A punchy 1-2 sentence elevator pitch for quick scans.",
  "readmeSnippet": "Markdown formatted GitHub README excerpt with Problem, Solution, Architecture & Tech Stack",
  "resumeBullets": [
    "Action Verb + Tech + Quantified Result (e.g. Architected scalable microservice using React and Node.js, reducing latency by 35%)",
    "Action Verb + System Design highlight",
    "Action Verb + Testing/DevOps/Impact highlight"
  ],
  "interviewQuestions": [
    "Likely technical interview question 1 about this project",
    "Likely technical interview question 2 about this project"
  ]
}
`;

  return { prompt, systemInstruction };
}

function buildRecruiterReviewPrompt(payload) {
  const { portfolioContent = '', targetRole = 'Software Developer' } = payload;
  
  const systemInstruction = `You are a Senior Tech Recruiter evaluating candidate portfolios.
STRICT GUIDELINES:
- Provide simulated, constructive feedback on technical signal, structure, and clarity.
- Do NOT make absolute predictions (e.g. do not say "will reject", "will guarantee an interview", or "will bounce").
- Use cautious, qualified phrasing (e.g. "may make it harder to evaluate...", "could strengthen signal by...").
- Do NOT assume or invent unstated seniority levels.
- Output strictly valid JSON.`;

  const prompt = `
Perform a simulated 6-second recruiter screen on this portfolio for the position of "${targetRole}".

PORTFOLIO CONTENT:
${portfolioContent}

Return a valid JSON object strictly matching this schema:
{
  "targetRole": "${targetRole}",
  "passFilter": true,
  "matchScore": 86,
  "firstImpression": "Detailed simulated 6-second scan feedback using qualified language",
  "technicalSignal": "Analysis of programming languages, depth, architectures based on observed data",
  "projectSignal": "Evaluation of whether projects demonstrate production complexity",
  "redFlags": [
    "Area for improvement or missing signal 1",
    "Area for improvement or missing signal 2"
  ],
  "missingKeywords": [
    "Keyword / Skill 1",
    "Keyword / Skill 2",
    "Keyword / Skill 3"
  ],
  "keyRecommendations": [
    "Actionable change 1",
    "Actionable change 2"
  ],
  "interviewTalkingPoints": [
    "Talking point 1",
    "Talking point 2"
  ]
}
`;

  return { prompt, systemInstruction };
}

// -------------------------------------------------------------
// MAIN SERVERLESS HANDLER
// -------------------------------------------------------------

export default async function handler(req, res) {
  // CORS Headers for API calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.',
    });
  }

  // Rate Limiting Check
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment before trying again.',
    });
  }

  try {
    // Body parsing
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {
        return res.status(400).json({ success: false, error: 'Invalid JSON body.' });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'Missing request body.' });
    }

    const { operation, payload } = body;

    // Allowed operations validation
    const ALLOWED_OPERATIONS = [
      'analyzePortfolio',
      'rewriteSection',
      'improveProject',
      'generateRecruiterReview',
    ];

    if (!operation || !ALLOWED_OPERATIONS.includes(operation)) {
      return res.status(400).json({
        success: false,
        error: `Invalid operation "${operation}". Allowed operations: ${ALLOWED_OPERATIONS.join(', ')}`,
      });
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Missing payload object.' });
    }

    // Size limit check (Max ~35k characters across payload)
    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > 35000) {
      return res.status(413).json({
        success: false,
        error: 'Payload too large. Please submit shorter portfolio content.',
      });
    }

    // Build prompt according to operation
    let promptConfig;
    if (operation === 'analyzePortfolio') {
      promptConfig = buildAnalyzePrompt(payload);
    } else if (operation === 'rewriteSection') {
      promptConfig = buildRewritePrompt(payload);
    } else if (operation === 'improveProject') {
      promptConfig = buildImproveProjectPrompt(payload);
    } else if (operation === 'generateRecruiterReview') {
      promptConfig = buildRecruiterReviewPrompt(payload);
    }

    // Execute call to Google Gemini
    const result = await callGemini(promptConfig.prompt, promptConfig.systemInstruction);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === 'SERVER_KEY_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        error: 'Gemini API is not configured on the server. Please set the GEMINI_API_KEY environment variable.',
      });
    }

    const statusCode = error.statusCode || 500;
    const safeErrorMessage =
      statusCode === 429
        ? 'AI service quota exceeded. Please try again in a moment.'
        : statusCode === 504
        ? 'AI request timed out. Please try again.'
        : error.message || 'An error occurred while processing the AI request.';

    return res.status(statusCode).json({
      success: false,
      error: safeErrorMessage,
    });
  }
}
