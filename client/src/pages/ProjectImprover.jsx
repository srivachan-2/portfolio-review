import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  Copy,
  Check,
  Code,
  FileText,
  AlertTriangle,
  HelpCircle,
  Briefcase
} from '../components/icons';
import { improveProject, formatAIErrorMessage } from '../services/ai';

export default function ProjectImprover() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [features, setFeatures] = useState('');
  const [contribution, setContribution] = useState('');
  const [impact, setImpact] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');

  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);

  const handleLoadSample = () => {
    setProjectName('PulseAI - Code Review Bot (Demo)');
    setDescription('A bot that connects to GitHub and checks code for errors and security bugs using AI.');
    setTechStack('React, Node.js, Express, Google Gemini API, Redis, Docker');
    setProblemSolved('Manual pull request reviews take hours and frequently miss edge-case vulnerabilities.');
    setFeatures('GitHub Webhook listener, semantic AST parsing, automated vulnerability warnings, PR summary generation.');
    setContribution('Built the backend API, rate-limiting queue using Redis, and integrated the Gemini LLM pipeline.');
    setImpact('Sample demo metrics: 1,200+ developer teams, processed over 140,000 PRs with 99.4% uptime.');
    setTargetRole('Full Stack Developer');
    setIsSampleLoaded(true);
    setError(null);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!projectName.trim() && !description.trim()) {
      setError('Please provide at least a project name and a brief description.');
      return;
    }

    setLoading(true);

    try {
      const result = await improveProject({
        projectName,
        description,
        techStack,
        problemSolved,
        features,
        contribution,
        impact,
        targetRole,
      });

      setOutput(result);
    } catch (err) {
      setError(formatAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, keyName) => {
    if (!text) return;
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="improver-page">
      <div className="page-header text-center">
        <div className="badge-pill mb-2">
          <Zap size={14} />
          <span>Project Impact Multiplier</span>
        </div>
        <h1>Improve My Project</h1>
        <p className="page-header-subtitle">
          Turn project notes into structured summaries, technical breakdowns, and metric-driven resume bullets.
        </p>
      </div>

      <div className="improver-sample-bar">
        <button type="button" onClick={handleLoadSample} className="btn btn-sm btn-outline">
          ⚡ Pre-fill with Sample Project (DEMO DATA)
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <AlertTriangle size={18} />
          <div className="alert-content">
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="improver-grid">
        {/* Left Form: SOURCE DATA */}
        <form onSubmit={handleGenerate} className="improver-form card">
          <div className="form-section-tag mb-3">
            <span className="source-data-badge">SOURCE DATA (User Input)</span>
            {isSampleLoaded && <span className="demo-badge-inline">DEMO SAMPLE</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              placeholder="e.g. PulseAI or CloudMetrics"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Original / Current Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Made an AI chatbot using Python and React..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technologies & Frameworks</label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, Gemini API, Redis, Docker"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Problem Solved</label>
            <input
              type="text"
              placeholder="e.g. Developers spend too much time reviewing repetitive code..."
              value={problemSolved}
              onChange={(e) => setProblemSolved(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Features & Technical Challenges</label>
            <textarea
              rows={2}
              placeholder="e.g. Real-time webhook listener, cache invalidation, rate limiting..."
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">My Contribution / Role</label>
            <input
              type="text"
              placeholder="e.g. Solo builder / Lead backend engineer"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Results, Metrics & Impact</label>
            <input
              type="text"
              placeholder="e.g. 1,200 active users, sub-50ms latency, 99.4% uptime..."
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-large mt-2"
          >
            {loading ? (
              <>
                <div className="spinner-small" />
                <span>Generating Multi-Format Transformation...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Transform Project with AI</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output Formats: AI INFERENCE */}
        <div className="improver-output-column">
          {output ? (
            <div className="improver-results-container">
              <div className="form-section-tag mb-3">
                <span className="ai-inference-badge">AI INFERENCE & SUGGESTIONS</span>
              </div>

              {/* 1. Recruiter Description */}
              <div className="result-card card">
                <div className="result-header">
                  <div className="result-title text-indigo-400">
                    <Briefcase size={16} />
                    <span>Recruiter-Friendly Summary</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(output.recruiterDescription, 'recruiter')}
                    className="btn btn-xs btn-outline"
                  >
                    {copiedKey === 'recruiter' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'recruiter' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="result-text">{output.recruiterDescription}</p>
              </div>

              {/* 2. Technical Deep-Dive */}
              <div className="result-card card">
                <div className="result-header">
                  <div className="result-title text-purple-400">
                    <Code size={16} />
                    <span>Technical Architecture & Deep-Dive</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(output.technicalDeepDive, 'tech')}
                    className="btn btn-xs btn-outline"
                  >
                    {copiedKey === 'tech' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'tech' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="result-text">{output.technicalDeepDive}</p>
              </div>

              {/* 3. Resume Bullet Points */}
              <div className="result-card card">
                <div className="result-header">
                  <div className="result-title text-emerald-400">
                    <Check size={16} />
                    <span>Resume Bullet Points (Action + Metric)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard((output.resumeBullets || []).map(b => `• ${b}`).join('\n'), 'resume')}
                    className="btn btn-xs btn-outline"
                  >
                    {copiedKey === 'resume' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'resume' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <ul className="resume-bullets-list">
                  {(output.resumeBullets || []).map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Elevator Pitch & GitHub README */}
              <div className="result-card card">
                <div className="result-header">
                  <div className="result-title text-cyan-400">
                    <FileText size={16} />
                    <span>Elevator Pitch (1-2 Sentences)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(output.shortPitch, 'pitch')}
                    className="btn btn-xs btn-outline"
                  >
                    {copiedKey === 'pitch' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'pitch' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="result-text">{output.shortPitch}</p>
              </div>

              {/* 5. Potential Interview Questions */}
              {output.interviewQuestions && output.interviewQuestions.length > 0 && (
                <div className="result-card card border-amber">
                  <div className="result-header">
                    <div className="result-title text-amber-400">
                      <HelpCircle size={16} />
                      <span>Likely Interview Discussion Points</span>
                    </div>
                  </div>
                  <ul className="interview-questions-list">
                    {output.interviewQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="improver-empty-card card">
              <Sparkles size={40} className="text-muted mb-2" />
              <h3>Ready to Transform Your Project</h3>
              <p>
                Fill in the details on the left or load a sample project to generate 5 tailored formats.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
