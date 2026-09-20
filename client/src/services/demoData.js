// =========================================================
// DEMONSTRATION DATA ONLY
// This file contains sample fictional data used for testing
// and previewing product workflows without calling the live API.
// =========================================================

export const DEMO_PORTFOLIO_RAW = {
  isDemo: true,
  name: "Alex Rivera (Sample Profile)",
  role: "Full Stack & AI Engineer",
  url: "https://alexrivera-dev.vercel.app",
  targetRole: "Full Stack Developer",
  summary: "Sample portfolio text: Software Engineer with 3+ years building scalable React & Node.js web applications, generative AI workflows, and cloud-native microservices.",
  skills: [
    "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL",
    "Tailwind CSS", "Docker", "AWS (S3, Lambda)", "Python", "LangChain", "GraphQL", "Redis"
  ],
  experience: [
    {
      company: "Nexus Labs (Demo)",
      role: "Full Stack Engineer",
      period: "2023 - Present",
      description: "Led development of real-time collaborative workspace used by 45,000+ monthly active users. Reduced client-side bundle size by 38% and integrated Gemini LLM for automated ticket summaries."
    },
    {
      company: "Crest Software (Demo)",
      role: "Frontend Developer",
      period: "2021 - 2023",
      description: "Engineered high-throughput fintech dashboard components in React and TypeScript. Improved accessibility score to 98% and maintained 90%+ unit test coverage with Vitest."
    }
  ],
  projects: [
    {
      name: "PulseAI - Automated Code Review Assistant (Demo Project)",
      tech: "React, Node.js, Gemini API, Redis, Docker",
      description: "Developer tool that integrates with GitHub Webhooks to perform semantic code analysis, detect security vulnerabilities, and generate pull request summaries.",
      impact: "Adopted by 1,200+ developer teams; processed 140,000+ pull requests with 99.4% uptime.",
      link: "https://github.com/alexrivera/pulse-ai"
    },
    {
      name: "CloudMetrics - Distributed Telemetry Dashboard (Demo Project)",
      tech: "Next.js 14, TypeScript, TimescaleDB, Tailwind CSS",
      description: "Real-time infrastructure observability dashboard tracking server CPU, memory, and database connection pools with customizable alert thresholds.",
      impact: "Sub-50ms query response time across 10M+ daily telemetry events.",
      link: "https://github.com/alexrivera/cloud-metrics"
    },
    {
      name: "HyperCart - Serverless E-Commerce Platform (Demo Project)",
      tech: "React, Stripe, Express, PostgreSQL, Redis",
      description: "High-performance modular storefront featuring optimistic cart updates, automated tax calculation, and multi-currency checkout.",
      impact: "Demonstrated 1.2s page load speed and handled 5,000 concurrent load test sessions.",
      link: "https://hypercart-demo.vercel.app"
    }
  ],
  sections: {
    hero: "Hey, I'm Alex! I build full stack applications and experiment with AI.",
    about: "I'm a self-motivated developer who loves learning new technologies. I enjoy solving challenging algorithmic problems, optimizing databases, and crafting intuitive user interfaces. When I'm not coding, I contribute to open source.",
    education: "B.S. in Computer Science — University of Washington (2021)",
    contact: "alex.rivera.dev@gmail.com | LinkedIn: linkedin.com/in/alexrivera-dev | GitHub: github.com/alexrivera"
  }
};

export const DEMO_ANALYSIS_RESULT = {
  id: "demo_analysis_sample",
  isDemo: true,
  name: "Alex Rivera (Demo Profile)",
  url: "https://alexrivera-dev.vercel.app",
  targetRole: "Full Stack Developer",
  createdAt: new Date().toISOString(),
  overallScore: 84,
  benchmark: "Recruiter Readiness: 84/100",
  summary: "AI assessment: the portfolio demonstrates strong engineering depth, with opportunities to improve presentation and clarity.",

  categories: [
    {
      category: "Content Quality",
      score: 88,
      summary: "Clear, concise project descriptions with strong action verbs and technical specifics.",
      strengths: [
        "Well-structured project summaries with technologies and problem contexts.",
        "Clear quantifiable metrics mentioned across work experience."
      ],
      weaknesses: [
        "About section relies on generic buzzwords ('self-motivated', 'loves learning')."
      ],
      recommendations: [
        "Replace generic personal attributes with specific technical passions (e.g. distributed systems, AI agents)."
      ]
    },
    {
      category: "Project Quality",
      score: 91,
      summary: "Sample projects demonstrate real-world utility, scale, and modern tooling.",
      strengths: [
        "PulseAI shows practical application of GenAI and developer workflows.",
        "CloudMetrics demonstrates handling high-volume timeseries data.",
        "Live links and GitHub repository links are provided."
      ],
      weaknesses: [
        "Missing architecture diagrams or deep-dive technical explanations for system design decisions."
      ],
      recommendations: [
        "Add short architecture diagrams or system trade-off notes to GitHub READMEs."
      ]
    },
    {
      category: "Technical Positioning",
      score: 86,
      summary: "Clearly positioned as a Modern Full Stack Developer with TypeScript and AI competency.",
      strengths: [
        "Cohesive stack (React, Node, TypeScript, Docker, Redis, AI) aligns well with full-stack requirements."
      ],
      weaknesses: [
        "Skills list could group technologies by layer (Frontend, Backend, Cloud & AI) for faster parsing."
      ],
      recommendations: [
        "Group skills into structured categories: Core Languages, Frameworks, Cloud & Infrastructure, AI Tooling."
      ]
    },
    {
      category: "Visual / UX",
      score: 79,
      summary: "Clean layout, but needs stronger visual hierarchy and scannability for fast review.",
      strengths: [
        "Responsive layout with fast load times and clean contrast."
      ],
      weaknesses: [
        "Dense paragraphs in experience section can cause reader fatigue."
      ],
      recommendations: [
        "Convert long experience paragraphs into 2-3 high-impact bullet points."
      ]
    },
    {
      category: "Recruiter Readiness",
      score: 84,
      summary: "High appeal due to direct alignment with in-demand full-stack requirements.",
      strengths: [
        "Target role is easily identified within initial review.",
        "Direct contact channels and resume CTA are easily accessible."
      ],
      weaknesses: [
        "Lack of explicit availability/location status (e.g. 'Open to Remote / Hybrid roles')."
      ],
      recommendations: [
        "Add an availability badge: 'Open to Full-Time Senior / Mid Full Stack roles (Remote/US)'."
      ]
    },
    {
      category: "Personal Branding",
      score: 82,
      summary: "Consistent developer identity across portfolio, GitHub, and projects.",
      strengths: [
        "Distinctive niche at the intersection of full stack web development and AI workflows."
      ],
      weaknesses: [
        "Hero section tagline is slightly too casual ('Hey, I build full stack apps')."
      ],
      recommendations: [
        "Elevate tagline to highlight value proposition and specialty."
      ]
    },
    {
      category: "Clarity",
      score: 90,
      summary: "Direct, articulate communication with minimal jargon ambiguity.",
      strengths: [
        "Crisp terminology and logical flow from intro to experience to projects."
      ],
      weaknesses: [
        "Project descriptions could better clarify personal contribution vs team effort."
      ],
      recommendations: [
        "Explicitly state 'Role: Lead Developer' or 'Solo Builder' on project cards."
      ]
    },
    {
      category: "Impact",
      score: 87,
      summary: "Strong inclusion of numerical evidence across experience sections.",
      strengths: [
        "Measurable performance and business outcomes in work history."
      ],
      weaknesses: [
        "HyperCart project lacks conversion or performance benchmark metrics."
      ],
      recommendations: [
        "Include Lighthouse score (e.g., 99/100 performance) or stress-test metrics on HyperCart."
      ]
    },
    {
      category: "Completeness",
      score: 85,
      summary: "Covers all key portfolio components; minor additions needed in case studies.",
      strengths: [
        "Projects, experience, education, skills, and contact links all present."
      ],
      weaknesses: [
        "No technical writing, blog posts, or case studies attached."
      ],
      recommendations: [
        "Publish a short technical write-up on integrating Gemini with GitHub webhooks."
      ]
    },
    {
      category: "Overall",
      score: 84,
      summary: "A strong portfolio profile demonstrating solid full-stack capability and clear project scope.",
      strengths: [
        "Strong project complexity, clear full-stack capability, and compelling metrics."
      ],
      weaknesses: [
        "Hero headline and About narrative can be sharpened for maximum punch."
      ],
      recommendations: [
        "Use the AI Writer to generate a high-converting hero hook and restructured about narrative."
      ]
    }
  ],

  topStrengths: [
    "Comprehensive projects with clear technical stack and architecture notes.",
    "Quantified engineering impact highlighted throughout work experience.",
    "Modern technical stack combining TypeScript, Node, React, and Generative AI."
  ],

  priorityImprovements: [
    {
      area: "Hero Section",
      urgency: "High",
      issue: "Headline 'Hey, I build full stack apps' is too passive and generic.",
      solution: "Transform into: 'Full Stack Engineer specializing in TypeScript, Cloud Architecture & GenAI Integration — building high-performance systems.'"
    },
    {
      area: "About Me Narrative",
      urgency: "Medium",
      issue: "Relies on generic phrases like 'self-motivated' and 'loves learning'.",
      solution: "Focus on architectural philosophy, distributed systems background, and engineering leadership."
    },
    {
      area: "Project Deep-Dives",
      urgency: "Medium",
      issue: "Lacks explicit breakdown of engineering challenges solved and architecture choices.",
      solution: "Add 'Engineering Highlights' bullet points detailing database indexes, caching strategy, and security safeguards."
    }
  ],

  sectionsReview: [
    {
      section: "Hero",
      score: 72,
      status: "Needs Polish",
      whatWorks: "Friendly tone and direct link to projects.",
      whatDoesnt: "Fails to establish technical specialization in the first glance.",
      howToImprove: "Lead with role title, core tech stack, and primary value proposition.",
      originalContent: "Hey, I'm Alex! I build full stack applications and experiment with AI.",
      aiRewrite: "Full Stack & AI Engineer crafting resilient web platforms and automated intelligent workflows. Transforming complex data into fast, intuitive products."
    },
    {
      section: "About",
      score: 76,
      status: "Needs Polish",
      whatWorks: "Shows enthusiasm and broad range of interests.",
      whatDoesnt: "Uses standard filler phrases without memorable technical stories.",
      howToImprove: "Structure as: 1) Who I am & what I build, 2) Technical depth & architectural focus, 3) Current interests.",
      originalContent: "I'm a self-motivated developer who loves learning new technologies. I enjoy solving challenging algorithmic problems, optimizing databases, and crafting intuitive user interfaces. When I'm not coding, I contribute to open source.",
      aiRewrite: "I am a Full Stack Engineer with 3+ years of experience building high-throughput web applications and AI-integrated developer tools. Specializing in TypeScript, Node.js, and cloud architectures, I focus on system performance, developer experience, and clean UI engineering. Passionate about open source and shipping production software that scales."
    },
    {
      section: "Projects",
      score: 92,
      status: "Strong",
      whatWorks: "Diverse project types, clear tech stacks, real adoption metrics, and live GitHub repositories.",
      whatDoesnt: "Could highlight system design architecture and trade-offs made.",
      howToImprove: "Include a 2-sentence 'Architectural Decision' note on each project.",
      originalContent: "PulseAI, CloudMetrics, and HyperCart with summaries and metrics.",
      aiRewrite: "Feature PulseAI as flagship with architecture diagram; highlight CloudMetrics for backend depth and HyperCart for frontend performance."
    },
    {
      section: "Skills",
      score: 84,
      status: "Good",
      whatWorks: "Comprehensive modern stack without obsolete technologies.",
      whatDoesnt: "Displayed as an unorganized flat list.",
      howToImprove: "Categorize into: Frontend (React, Next.js, Tailwind), Backend (Node.js, PostgreSQL, Redis), Cloud/DevOps (Docker, AWS), and AI Tooling (Gemini, LangChain).",
      originalContent: "TypeScript, React, Next.js, Node.js, PostgreSQL, Tailwind CSS, Docker, AWS, Python, LangChain, GraphQL, Redis",
      aiRewrite: "Frontend: React, Next.js 14, TypeScript, Tailwind CSS\nBackend: Node.js, Express, PostgreSQL, Redis, GraphQL\nCloud & AI: Docker, AWS (S3/Lambda), Gemini API, LangChain, Python"
    },
    {
      section: "Experience",
      score: 89,
      status: "Strong",
      whatWorks: "Includes concrete achievements (38% bundle reduction, 45K MAU, 98% accessibility).",
      whatDoesnt: "Paragraph formatting could be converted into scannable action bullets.",
      howToImprove: "Use Action Verb + Technical Context + Measurable Outcome structure.",
      originalContent: "Nexus Labs (2023-Present) & Crest Software (2021-2023)",
      aiRewrite: "• Architected real-time collaborative workspace serving 45K+ MAU, cutting client bundle size by 38% via dynamic code-splitting and asset optimization.\n• Integrated Gemini LLM pipelines for automated customer triage, accelerating support resolution by 42%.\n• Maintained 90%+ unit and integration test coverage across 60+ micro-components using Vitest and React Testing Library."
    },
    {
      section: "Recruiter CTA & Contact",
      score: 85,
      status: "Good",
      whatWorks: "Direct email, GitHub, and LinkedIn links.",
      whatDoesnt: "Lacks explicit hiring availability and target job titles.",
      howToImprove: "Add 'Open to Full-Stack & Frontend Engineer opportunities (Full-time / Remote)' banner.",
      originalContent: "alex.rivera.dev@gmail.com | LinkedIn: linkedin.com/in/alexrivera-dev | GitHub: github.com/alexrivera",
      aiRewrite: "Let's build something extraordinary together. I am currently open to full-time Full Stack & AI Engineering roles.\nReach out at: alex.rivera.dev@gmail.com | GitHub: @alexrivera | LinkedIn: in/alexrivera-dev"
    }
  ],

  recruiterPerspective: {
    firstImpression: "Simulated review: Immediately conveys technical competence and modern engineering habits.",
    technicalSignal: "Strong full-stack proficiency with TypeScript, database optimization (TimescaleDB, Redis, Postgres), and modern AI API integration.",
    projectSignal: "PulseAI demonstrates solving a tangible problem for developers with structured execution.",
    missingEvidence: "Needs more explicit visibility into system testing strategies, CI/CD pipelines, and cloud deployment infrastructure.",
    recommendedChanges: [
      "Sharpen the headline to focus on seniority and scale.",
      "Break skills into categorized clusters for faster parsing.",
      "Add direct links to live demos alongside GitHub repositories."
    ],
    interviewTalkingPoints: [
      "Approach to reducing React bundle size at Nexus Labs.",
      "Managing concurrency and cache invalidation in CloudMetrics telemetry pipeline.",
      "Handling prompt engineering, rate limits, and latency with the Gemini API in PulseAI."
    ]
  }
};
