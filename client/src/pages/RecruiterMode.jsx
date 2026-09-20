import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Briefcase,
  Layers,
  Code
} from '../components/icons';
import { generateRecruiterReview, formatAIErrorMessage } from '../services/ai';
import { DEMO_PORTFOLIO_RAW } from '../services/demoData';

const ROLES = [
  'Software Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'AI/ML Engineer',
  'Data Scientist',
  'DevOps Engineer'
];

export default function RecruiterMode() {
  const [targetRole, setTargetRole] = useState(ROLES[1]);
  const [portfolioContent, setPortfolioContent] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDemoText, setIsDemoText] = useState(false);

  const handleLoadDemoText = () => {
    const text = `
NAME: ${DEMO_PORTFOLIO_RAW.name}
ROLE: ${DEMO_PORTFOLIO_RAW.role}
SUMMARY: ${DEMO_PORTFOLIO_RAW.summary}
SKILLS: ${DEMO_PORTFOLIO_RAW.skills.join(', ')}

PROJECTS:
${DEMO_PORTFOLIO_RAW.projects.map(p => `- ${p.name}: ${p.description} (Tech: ${p.tech}). Impact: ${p.impact}`).join('\n')}

EXPERIENCE:
${DEMO_PORTFOLIO_RAW.experience.map(e => `- ${e.company} (${e.role}, ${e.period}): ${e.description}`).join('\n')}
    `.trim();

    setPortfolioContent(text);
    setIsDemoText(true);
  };

  const handleAudit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!portfolioContent.trim()) {
      setError('Please paste your portfolio text or click "Load Demo Portfolio Text" below.');
      return;
    }

    setLoading(true);

    try {
      const data = await generateRecruiterReview({
        portfolioContent,
        targetRole,
      });

      setResults(data);
    } catch (err) {
      setError(formatAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyVerdict = () => {
    if (!results) return;
    const text = `
=== AI RECRUITER SIMULATION: ${results.targetRole} ===
Screening Alignment: ${results.passFilter ? 'Positive Initial Alignment' : 'Opportunities for Better Alignment'} (Score: ${results.matchScore || 80}%)

First Impression (Simulation):
${results.firstImpression}

Technical Signal:
${results.technicalSignal}

Project Signal:
${results.projectSignal}

Missing Keywords / Signals:
${(results.missingKeywords || []).join(', ')}

Recommended Changes:
${(results.keyRecommendations || []).map(r => `• ${r}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="recruiter-page">
      <div className="page-header text-center">
        <div className="badge-pill mb-2">
          <Target size={14} />
          <span>AI Recruiter Simulation</span>
        </div>
        <h1>AI Recruiter Simulation</h1>
        <p className="page-header-subtitle">
          Simulate how a technical recruiter or hiring manager reviews key competencies, technical depth, and keywords for target roles.
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <AlertTriangle size={18} />
          <div className="alert-content">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAudit} className="recruiter-input-card card">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <Briefcase size={16} />
              <span>Target Engineering Role</span>
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="form-select"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group align-end">
            <button
              type="button"
              onClick={handleLoadDemoText}
              className="btn btn-sm btn-outline"
            >
              ⚡ Load Demo Portfolio Text (DEMO DATA)
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Portfolio Content / Bio / Projects</label>
          <textarea
            rows={6}
            placeholder="Paste your resume summary, project descriptions, skills, or portfolio text to simulate a recruiter screening..."
            value={portfolioContent}
            onChange={(e) => {
              setPortfolioContent(e.target.value);
              setIsDemoText(false);
            }}
            className="form-textarea"
          />
          {isDemoText && <span className="form-hint text-amber-400">Currently populated with sample DEMO DATA.</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-large btn-block"
        >
          {loading ? (
            <>
              <div className="spinner-small" />
              <span>Simulating Recruiter 6-Second Screen...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Simulate Recruiter Review for {targetRole}</span>
            </>
          )}
        </button>
      </form>

      {/* Audit Results */}
      {results && (
        <div className="recruiter-results-container mt-8">
          {/* Top Score Bar */}
          <div className="recruiter-score-banner card">
            <div className="score-banner-left">
              <div className="pass-pill-container">
                {results.passFilter ? (
                  <span className="badge-pass">
                    <CheckCircle size={16} />
                    <span>Strong Initial Alignment</span>
                  </span>
                ) : (
                  <span className="badge-flagged">
                    <XCircle size={16} />
                    <span>Needs Additional Role Signals</span>
                  </span>
                )}
              </div>
              <h2>Target Role: {results.targetRole}</h2>
              <p className="recruiter-summary-line">{results.firstImpression}</p>
            </div>

            <div className="score-banner-right">
              <div className="recruiter-match-gauge">
                <span className="match-score-value">{results.matchScore || 85}%</span>
                <span className="match-score-label">Role Alignment Heuristic</span>
              </div>
              <button onClick={handleCopyVerdict} className="btn btn-sm btn-secondary mt-2">
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Verdict'}</span>
              </button>
            </div>
          </div>

          {/* Detailed Signal Columns */}
          <div className="recruiter-signals-grid mt-4">
            {/* Technical Signal */}
            <div className="signal-card card">
              <div className="signal-header text-indigo-400">
                <Code size={18} />
                <h3>Technical Depth Assessment</h3>
              </div>
              <p className="signal-body">{results.technicalSignal}</p>
            </div>

            {/* Project Signal */}
            <div className="signal-card card">
              <div className="signal-header text-purple-400">
                <Layers size={18} />
                <h3>Project Complexity Assessment</h3>
              </div>
              <p className="signal-body">{results.projectSignal}</p>
            </div>
          </div>

          {/* Missing Keywords & Red Flags */}
          <div className="recruiter-warnings-grid mt-4">
            {/* Missing Keywords */}
            <div className="warning-card card border-amber">
              <div className="warning-header text-amber-400">
                <AlertTriangle size={18} />
                <h3>Recommended Keywords / Technologies for {results.targetRole}</h3>
              </div>
              <div className="keyword-tags">
                {(results.missingKeywords || ['CI/CD', 'Automated Tests', 'System Architecture']).map((kw, i) => (
                  <span key={i} className="keyword-tag">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="warning-card card border-rose">
              <div className="warning-header text-rose-400">
                <XCircle size={18} />
                <h3>Friction Points to Clarify</h3>
              </div>
              <ul className="recruiter-bullet-list">
                {(results.redFlags || ['Ensure personal bio emphasizes engineering focus.']).map((rf, i) => (
                  <li key={i}>{rf}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Changes & Talking Points */}
          <div className="recruiter-changes-grid mt-4">
            <div className="changes-card card">
              <h3>Recommended Strategic Changes</h3>
              <ul className="recruiter-bullet-list">
                {(results.keyRecommendations || []).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="changes-card card">
              <h3>Suggested Interview Talking Points</h3>
              <ul className="recruiter-bullet-list">
                {(results.interviewTalkingPoints || []).map((tp, i) => (
                  <li key={i}>{tp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
