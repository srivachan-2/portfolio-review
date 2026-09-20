import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Globe,
  FileText,
  Briefcase,
  AlertTriangle,
  Sliders,
  ChevronDown,
  ChevronUp
} from '../components/icons';
import { analyzePortfolio, formatAIErrorMessage } from '../services/ai';
import { saveAnalysis } from '../services/storage';
import { DEMO_PORTFOLIO_RAW, DEMO_ANALYSIS_RESULT } from '../services/demoData';

const TARGET_ROLES = [
  'Software Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'AI/ML Engineer',
  'Data Scientist',
  'DevOps Engineer'
];

export default function Analyze() {
  const navigate = useNavigate();

  // Form states
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');

  // Structured optional info
  const [showStructured, setShowStructured] = useState(false);
  const [name, setName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [skills, setSkills] = useState('');
  const [projectsText, setProjectsText] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [education, setEducation] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Processing & Error states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [corsWarning, setCorsWarning] = useState(null);

  const loadingSteps = [
    'Parsing portfolio structure and content...',
    'Evaluating technical depth & stack alignment...',
    'Auditing 10 core dimensions against standards...',
    'Generating structured improvements & recruiter feedback...'
  ];

  const handleLoadDemo = () => {
    setName(DEMO_PORTFOLIO_RAW.name);
    setCurrentRole(DEMO_PORTFOLIO_RAW.role);
    setUrl(DEMO_PORTFOLIO_RAW.url);
    setTargetRole(DEMO_PORTFOLIO_RAW.targetRole);
    setSkills(DEMO_PORTFOLIO_RAW.skills.join(', '));
    setContent(`${DEMO_PORTFOLIO_RAW.summary}\n\nHERO: ${DEMO_PORTFOLIO_RAW.sections.hero}\n\nABOUT: ${DEMO_PORTFOLIO_RAW.sections.about}`);
    setProjectsText(DEMO_PORTFOLIO_RAW.projects.map(p => `${p.name} (${p.tech})\n${p.description}\nImpact: ${p.impact}`).join('\n\n'));
    setExperienceText(DEMO_PORTFOLIO_RAW.experience.map(e => `${e.company} - ${e.role} (${e.period})\n${e.description}`).join('\n\n'));
    setEducation(DEMO_PORTFOLIO_RAW.sections.education);
    setGithub('https://github.com/alexrivera');
    setLinkedin('https://linkedin.com/in/alexrivera-dev');
    setShowStructured(true);
    setCorsWarning(null);
    setError(null);
  };

  const handleInstantDemoReview = () => {
    saveAnalysis(DEMO_ANALYSIS_RESULT);
    navigate('/review?id=demo_analysis_sample');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCorsWarning(null);

    // Validate that at least something is provided
    const hasUrl = url && url.trim().length > 0;
    const hasContent = content && content.trim().length > 0;
    const hasStructured = name || skills || projectsText || experienceText;

    if (!hasUrl && !hasContent && !hasStructured) {
      setError('Please provide a portfolio URL, paste your portfolio text, or fill in the structured fields.');
      return;
    }

    let fetchedUrlContent = '';
    let urlFetchFailed = false;

    // If a URL was provided, attempt a direct browser fetch
    if (hasUrl) {
      try {
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(cleanUrl, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const bodyText = doc.body.innerText || '';
          fetchedUrlContent = bodyText.slice(0, 5000);
        } else {
          urlFetchFailed = true;
        }
      } catch (fetchErr) {
        urlFetchFailed = true;
      }

      if (urlFetchFailed) {
        // CASE 1: PORTFOLIO URL CORS FAILURE
        const corsNotice = "Some websites block direct browser access through CORS. If we can't read this portfolio automatically, paste the portfolio content below and we'll analyze it.";
        setCorsWarning(corsNotice);

        // If no other content or structured info was provided, stop here so user can paste text.
        // DO NOT show a fatal "Analysis Request Failed" error for CORS.
        if (!hasContent && !hasStructured) {
          return;
        }
      }
    }

    // Build payload
    const structuredInfo = {
      name: name.trim(),
      role: currentRole.trim(),
      skills: skills.trim(),
      projects: projectsText.trim(),
      experience: experienceText.trim(),
      education: education.trim(),
      github: github.trim(),
      linkedin: linkedin.trim(),
    };

    const combinedContent = [
      content.trim(),
      fetchedUrlContent ? `[CONTENT FETCHED FROM URL]:\n${fetchedUrlContent}` : '',
    ].filter(Boolean).join('\n\n');

    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const result = await analyzePortfolio({
        content: combinedContent,
        url: url.trim(),
        structuredInfo,
        targetRole,
      });

      clearInterval(stepInterval);
      const saved = saveAnalysis(result);
      navigate(`/review?id=${saved.id}`);
    } catch (err) {
      clearInterval(stepInterval);
      setLoading(false);
      // CASE 2: AI SERVER/API FAILURE
      // Display accurate AI-specific failure message (never CORS message)
      setError(formatAIErrorMessage(err));
    }
  };

  return (
    <div className="analyze-page">
      <div className="page-header text-center">
        <div className="badge-pill mb-2">
          <Sparkles size={14} />
          <span>AI Portfolio Audit</span>
        </div>
        <h1>Analyze Your Portfolio</h1>
        <p className="page-header-subtitle">
          Provide your portfolio URL, paste your text, or add structured project details. Get an instant 10-dimension audit.
        </p>
      </div>

      {/* Quick demo action bar */}
      <div className="demo-action-bar">
        <div className="demo-action-text">
          <Zap size={16} className="text-amber-400" />
          <span>Explore pre-computed sample portfolio review (DEMO DATA):</span>
        </div>
        <div className="demo-action-buttons">
          <button type="button" onClick={handleLoadDemo} className="btn btn-sm btn-outline">
            Fill Form with Demo
          </button>
          <button type="button" onClick={handleInstantDemoReview} className="btn btn-sm btn-primary">
            Instant Demo Review ⚡
          </button>
        </div>
      </div>

      {/* CASE 2: AI Server/API Failure Alert */}
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={20} />
          <div className="alert-content">
            <strong>Analysis Request Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* CASE 1: External URL CORS / Direct Fetch Notice */}
      {corsWarning && (
        <div className="alert alert-warning" role="alert">
          <AlertTriangle size={18} />
          <div className="alert-content">
            <strong>External Website Access Notice</strong>
            <p>{corsWarning}</p>
          </div>
        </div>
      )}

      {/* Main Analysis Form */}
      <form onSubmit={handleSubmit} className="card analyze-form-card">
        {/* Target Role Selector */}
        <div className="form-group">
          <label className="form-label">
            <Briefcase size={16} />
            <span>Target Role (What role should AI evaluate you for?)</span>
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="form-select"
            disabled={loading}
          >
            {TARGET_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <span className="form-hint">
            The AI benchmarks your technical depth, project complexity, and keywords against this specific role.
          </span>
        </div>

        {/* Input Option A: URL */}
        <div className="form-group">
          <label className="form-label">
            <Globe size={16} />
            <span>Portfolio URL (Optional)</span>
          </label>
          <input
            type="url"
            placeholder="https://myportfolio.vercel.app"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="form-input"
            disabled={loading}
          />
        </div>

        {/* Input Option B: Paste Content */}
        <div className="form-group">
          <label className="form-label">
            <FileText size={16} />
            <span>Paste Portfolio Content / Bio / Resume Text</span>
          </label>
          <textarea
            rows={6}
            placeholder="Paste your hero tagline, about me text, project summaries, or entire portfolio copy here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-textarea"
            disabled={loading}
          />
          <span className="form-hint">
            Tip: You can paste Markdown, raw website text, or resume sections.
          </span>
        </div>

        {/* Input Option C: Structured Fields (Accordion) */}
        <div className="collapsible-section">
          <button
            type="button"
            className="collapsible-header"
            onClick={() => setShowStructured(!showStructured)}
          >
            <div className="collapsible-title">
              <Sliders size={16} />
              <span>Optional Structured Information (Name, Skills, Projects, Links)</span>
            </div>
            {showStructured ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showStructured && (
            <div className="collapsible-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Role / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Node.js, Docker, PostgreSQL, Gemini API..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Projects & Tech Stacks</label>
                <textarea
                  rows={3}
                  placeholder="Project 1: PulseAI (React, Gemini) - Real-time code review tool with 1,200 teams..."
                  value={projectsText}
                  onChange={(e) => setProjectsText(e.target.value)}
                  className="form-textarea"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Experience</label>
                <textarea
                  rows={3}
                  placeholder="Company, Role, timeline, and key contributions/metrics..."
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  className="form-textarea"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/yourhandle"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourhandle"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="form-submit-container">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-large btn-block"
          >
            {loading ? (
              <>
                <div className="spinner-small" />
                <span>Running AI Audit...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>✨ Analyze Portfolio with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Live Loading Stepper */}
        {loading && (
          <div className="loading-stepper">
            <div className="stepper-progress-bar">
              <div
                className="stepper-progress-fill"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
            <p className="loading-step-text">{loadingSteps[loadingStep]}</p>
          </div>
        )}
      </form>
    </div>
  );
}
