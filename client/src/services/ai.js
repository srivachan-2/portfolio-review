// =========================================================
// Frontend AI Service Client
// Calls the secure serverless API (/api/ai) instead of Gemini directly.
// The Gemini API key remains 100% server-side and is never exposed to the browser.
// =========================================================

export class AIError extends Error {
  constructor(message, type = 'GENERAL_ERROR', details = null) {
    super(message);
    this.name = 'AIError';
    this.type = type;
    this.details = details;
  }
}

export function formatAIErrorMessage(error) {
  if (!error) return 'AI analysis is temporarily unavailable. Please try again in a moment.';

  const msg = (error.message || String(error)).toLowerCase();
  const statusCode = error.statusCode || error.status || 0;

  // Server configuration missing / unconfigured API key
  if (
    msg.includes('not configured') ||
    msg.includes('server_key_not_configured') ||
    msg.includes('api_key') ||
    msg.includes('authentication')
  ) {
    return 'AI service is not configured yet. Please try again later.';
  }

  // Rate limit / Quota exceeded / Busy
  if (
    statusCode === 429 ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests') ||
    msg.includes('busy')
  ) {
    return 'AI usage is temporarily busy. Please try again in a moment.';
  }

  // Request timeout
  if (
    statusCode === 504 ||
    msg.includes('504') ||
    msg.includes('timed out') ||
    msg.includes('timeout') ||
    error.type === 'TIMEOUT'
  ) {
    return 'The AI request timed out. Please try again.';
  }

  // Payload too large
  if (
    statusCode === 413 ||
    msg.includes('413') ||
    msg.includes('payload too large') ||
    msg.includes('too large')
  ) {
    return 'Portfolio content is too large. Please shorten your submission.';
  }

  // Network / Serverless unreachable failure
  if (
    error.type === 'NETWORK_ERROR' ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('econnrefused') ||
    msg.includes('networkerror')
  ) {
    return 'Unable to reach the AI service. Please try again.';
  }

  // Malformed / Unexpected AI output
  if (
    msg.includes('unexpected response') ||
    msg.includes('json') ||
    msg.includes('token') ||
    msg.includes('parse') ||
    msg.includes('syntaxerror') ||
    msg.includes('no generated text') ||
    msg.includes('empty response')
  ) {
    return 'The AI returned an unexpected response. Please try again.';
  }

  // Server error / Gemini unavailable
  if (
    statusCode >= 500 ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('unavailable')
  ) {
    return 'AI analysis is temporarily unavailable. Please try again in a moment.';
  }

  return 'AI analysis is temporarily unavailable. Please try again in a moment.';
}

// Unified client-side dispatcher calling /api/ai
async function callServerlessAI(operation, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        payload,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      const errorMsg = result.error || `Server responded with status ${response.status}`;
      const err = new AIError(errorMsg, response.status === 429 ? 'QUOTA_EXCEEDED' : 'GENERAL_ERROR');
      err.statusCode = response.status;
      throw err;
    }

    return result.data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new AIError('The AI request timed out. Please try again with shorter content.', 'TIMEOUT');
    }
    if (err instanceof AIError) {
      throw err;
    }
    throw new AIError(err.message || 'Failed to communicate with AI serverless service.', 'NETWORK_ERROR');
  }
}

// -------------------------------------------------------------
// PUBLIC METHODS
// -------------------------------------------------------------

/**
 * Perform a full 10-category portfolio review via serverless API
 */
export async function analyzePortfolio({ content = '', url = '', structuredInfo = {}, targetRole = 'Software Developer' }) {
  const data = await callServerlessAI('analyzePortfolio', {
    content,
    url,
    structuredInfo,
    targetRole,
  });

  data.id = data.id || `analysis_${Date.now()}`;
  data.createdAt = data.createdAt || new Date().toISOString();
  data.targetRole = targetRole;
  data.url = url;

  return data;
}

/**
 * Rewrite a specific section via serverless API
 */
export async function rewriteSection({
  sectionType = 'About Me',
  currentContent = '',
  targetRole = 'Software Developer',
  instructions = '',
  tone = 'Recruiter-Optimized',
}) {
  return await callServerlessAI('rewriteSection', {
    sectionType,
    currentContent,
    targetRole,
    instructions,
    tone,
  });
}

/**
 * Transform a software project into 5 multi-format representations via serverless API
 */
export async function improveProject({
  projectName = '',
  description = '',
  techStack = '',
  problemSolved = '',
  features = '',
  contribution = '',
  impact = '',
  targetRole = 'Full Stack Developer',
}) {
  return await callServerlessAI('improveProject', {
    projectName,
    description,
    techStack,
    problemSolved,
    features,
    contribution,
    impact,
    targetRole,
  });
}

/**
 * Perform a simulated recruiter 6-second scan audit via serverless API
 */
export async function generateRecruiterReview({ portfolioContent = '', targetRole = 'Software Developer' }) {
  return await callServerlessAI('generateRecruiterReview', {
    portfolioContent,
    targetRole,
  });
}
