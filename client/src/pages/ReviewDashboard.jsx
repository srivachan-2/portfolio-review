import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  PenTool,
  Copy,
  Check,
  Download,
  Globe,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from '../components/icons';
import { getAnalysis, getHistory, saveAnalysis } from '../services/storage';
import { DEMO_ANALYSIS_RESULT } from '../services/demoData';

export default function ReviewDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      if (id === 'demo_analysis_sample') {
        setAnalysis(DEMO_ANALYSIS_RESULT);
        return;
      }
      const found = getAnalysis(id);
      if (found) {
        setAnalysis(found.data || found);
        return;
      }
    }

    // Fallback: load most recent from history or demo data
    const history = getHistory();
    if (history.length > 0) {
      const latest = history[0];
      setAnalysis(latest.data || latest);
    } else {
      setAnalysis(DEMO_ANALYSIS_RESULT);
    }
  }, [searchParams]);

  if (!analysis) {
    return (
      <div className="empty-state-container">
        <BarChart2 size={48} className="text-indigo-400" />
        <h2>No Portfolio Analysis Found</h2>
        <p>Run a fresh analysis or view our sample developer review.</p>
        <div className="empty-state-actions">
          <Link to="/analyze" className="btn btn-primary">
            Analyze New Portfolio
          </Link>
          <button
            onClick={() => {
              saveAnalysis(DEMO_ANALYSIS_RESULT);
              setAnalysis(DEMO_ANALYSIS_RESULT);
            }}
            className="btn btn-secondary"
          >
            Load Demo Review
          </button>
        </div>
      </div>
    );
  }

  const isDemo = Boolean(analysis.isDemo || searchParams.get('id') === 'demo_analysis_sample');

  const toggleSection = (idx) => {
    setExpandedSections((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopySummary = () => {
    const text = `
=== PORTFOLIO AI AUDIT SUMMARY ===
Candidate: ${analysis.name || 'Developer'}
Target Role: ${analysis.targetRole || 'Software Engineer'}
Overall Score: ${analysis.overallScore || 80}/100

Summary:
${analysis.summary}

Top Strengths:
${(analysis.topStrengths || []).map((s) => `• ${s}`).join('\n')}

Priority Fixes:
${(analysis.priorityImprovements || []).map((p) => `• [${p.area}] ${p.issue} -> ${p.solution}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `portfolio-review-${analysis.name ? analysis.name.toLowerCase().replace(/\s+/g, '-') : 'audit'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getScoreColorClass = (score) => {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
  };

  const categories = analysis.categories || [];
  const sectionsReview = analysis.sectionsReview || [];
  const recruiter = analysis.recruiterPerspective || {};

  return (
    <div className="dashboard-page">
      {/* Demo Banner if demo profile */}
      {isDemo && (
        <div className="demo-notice-strip">
          <span className="demo-badge-tag">DEMO DATA</span>
          <span>This review is pre-computed demonstration data for a sample developer profile.</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="dashboard-header-card card">
        <div className="dashboard-header-left">
          <div className="dashboard-title-row">
            <h1>{analysis.name || 'Developer'}</h1>
            <span className="badge-role">{analysis.targetRole || 'Software Developer'}</span>
            {isDemo && <span className="demo-badge-inline">DEMO DATA</span>}
            {analysis.url && (
              <a
                href={analysis.url.startsWith('http') ? analysis.url : `https://${analysis.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-link-badge"
              >
                <Globe size={13} />
                <span>{analysis.url.replace(/^https?:\/\//, '')}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          <p className="dashboard-summary-text">{analysis.summary}</p>
        </div>

        {/* Big Overall Score Ring */}
        <div className="dashboard-header-right">
          <div className={`score-ring-container ${getScoreColorClass(analysis.overallScore || 80)}`}>
            <div className="score-ring-inner">
              <span className="score-number">{analysis.overallScore ?? 80}</span>
              <span className="score-denominator">/ 100</span>
            </div>
          </div>
          <span className="benchmark-pill">
            {analysis.benchmark || `Recruiter Readiness: ${analysis.overallScore || 80}/100`}
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="dashboard-actions-toolbar">
        <div className="toolbar-left">
          <Link to="/analyze" className="btn btn-sm btn-outline">
            <RefreshCw size={14} />
            <span>New Analysis</span>
          </Link>
          <Link to="/writer" className="btn btn-sm btn-primary">
            <PenTool size={14} />
            <span>Open AI Writer</span>
          </Link>
        </div>
        <div className="toolbar-right">
          <button onClick={handleCopySummary} className="btn btn-sm btn-secondary">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
          </button>
          <button onClick={handleExportJSON} className="btn btn-sm btn-outline" title="Export as JSON">
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Top Highlights Grid (Strengths & Priority Fixes) */}
      <div className="highlights-grid">
        {/* Top Strengths */}
        <div className="highlight-card card border-emerald">
          <div className="highlight-header text-emerald-400">
            <CheckCircle size={18} />
            <h3>Top Strengths</h3>
          </div>
          <ul className="highlight-list">
            {(analysis.topStrengths || [
              'Clear technical positioning with modern tools.',
              'Quantified metrics present in key project descriptions.'
            ]).map((strength, idx) => (
              <li key={idx}>
                <span className="bullet-emerald">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Improvements */}
        <div className="highlight-card card border-amber">
          <div className="highlight-header text-amber-400">
            <AlertTriangle size={18} />
            <h3>Priority Improvements</h3>
          </div>
          <div className="priority-items">
            {(analysis.priorityImprovements || []).map((item, idx) => (
              <div key={idx} className="priority-item">
                <div className="priority-item-header">
                  <span className="priority-area">{item.area}</span>
                  <span className={`priority-urgency urgency-${(item.urgency || 'Medium').toLowerCase()}`}>
                    {item.urgency || 'High'} Urgency
                  </span>
                </div>
                <p className="priority-issue">{item.issue}</p>
                <p className="priority-solution">
                  <strong>Fix:</strong> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown (10 Dimensions) */}
      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>10-Category Deep Audit</h2>
            <p className="section-subtitle">Granular scoring and recommendations across every core dimension.</p>
          </div>
        </div>

        <div className="category-cards-grid">
          {categories.map((cat, idx) => {
            const scoreClass = getScoreColorClass(cat.score);
            return (
              <div key={idx} className="category-card card">
                <div className="category-card-header">
                  <span className="category-name">{cat.category}</span>
                  <span className={`category-score-badge ${scoreClass}`}>{cat.score}</span>
                </div>

                <div className="category-bar-track">
                  <div
                    className={`category-bar-fill ${scoreClass}`}
                    style={{ width: `${Math.max(5, Math.min(100, cat.score))}%` }}
                  />
                </div>

                <p className="category-summary">{cat.summary}</p>

                {cat.strengths && cat.strengths.length > 0 && (
                  <div className="category-detail-item">
                    <span className="detail-label text-emerald-400">Strength:</span>
                    <span className="detail-text">{cat.strengths[0]}</span>
                  </div>
                )}

                {cat.weaknesses && cat.weaknesses.length > 0 && (
                  <div className="category-detail-item">
                    <span className="detail-label text-amber-400">Weakness:</span>
                    <span className="detail-text">{cat.weaknesses[0]}</span>
                  </div>
                )}

                {cat.recommendations && cat.recommendations.length > 0 && (
                  <div className="category-recommendation-box">
                    <strong>Action:</strong> {cat.recommendations[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section-by-Section Review & AI Rewrite Launchers */}
      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>Section-by-Section Review</h2>
            <p className="section-subtitle">Detailed critique of individual portfolio components with instant AI rewrites.</p>
          </div>
        </div>

        <div className="sections-review-list">
          {sectionsReview.map((sec, idx) => {
            const isExpanded = expandedSections[idx] !== false; // Default open
            const scoreClass = getScoreColorClass(sec.score);

            return (
              <div key={idx} className="section-review-card card">
                <div className="section-review-header" onClick={() => toggleSection(idx)}>
                  <div className="section-review-title-group">
                    <h3>{sec.section}</h3>
                    <span className={`status-badge status-${(sec.status || 'Good').toLowerCase().replace(/\s+/g, '-')}`}>
                      {sec.status || 'Good'}
                    </span>
                  </div>

                  <div className="section-review-score-group">
                    <span className={`section-score-pill ${scoreClass}`}>{sec.score}/100</span>
                    <button className="icon-btn-toggle" aria-label="Toggle section details">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="section-review-body">
                    <div className="review-comparison-grid">
                      <div className="review-critique-col">
                        <div className="critique-item">
                          <span className="critique-label text-emerald-400">What Works:</span>
                          <p>{sec.whatWorks}</p>
                        </div>
                        <div className="critique-item">
                          <span className="critique-label text-rose-400">What Doesn't:</span>
                          <p>{sec.whatDoesnt}</p>
                        </div>
                        <div className="critique-item">
                          <span className="critique-label text-indigo-400">How to Improve:</span>
                          <p>{sec.howToImprove}</p>
                        </div>
                      </div>

                      {sec.aiRewrite && (
                        <div className="ai-rewrite-preview-col">
                          <div className="ai-rewrite-header">
                            <Sparkles size={14} className="text-indigo-400" />
                            <span>AI Suggested Rewrite</span>
                          </div>
                          <div className="ai-rewrite-content">
                            {sec.aiRewrite}
                          </div>
                          <div className="ai-rewrite-actions">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(sec.aiRewrite);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="btn btn-xs btn-outline"
                            >
                              <Copy size={12} />
                              <span>Copy Rewrite</span>
                            </button>
                            <button
                              onClick={() => {
                                navigate('/writer', {
                                  state: {
                                    sectionType: sec.section,
                                    currentContent: sec.originalContent || '',
                                    suggestedContent: sec.aiRewrite,
                                    targetRole: analysis.targetRole,
                                  },
                                });
                              }}
                              className="btn btn-xs btn-primary"
                            >
                              <Sparkles size={12} />
                              <span>Open in AI Writer</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recruiter Perspective Module */}
      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>AI Recruiter Simulation Verdict</h2>
            <p className="section-subtitle">Simulated 6-second scan perspective and talking points.</p>
          </div>
        </div>

        <div className="recruiter-verdict-card card">
          <div className="recruiter-grid">
            <div className="recruiter-col">
              <h4>First Impression (Simulation)</h4>
              <p>{recruiter.firstImpression || 'Simulated scan feedback unavailable.'}</p>

              <h4>Technical Signal</h4>
              <p>{recruiter.technicalSignal || 'Technical depth overview.'}</p>

              <h4>Project Signal</h4>
              <p>{recruiter.projectSignal || 'Project complexity overview.'}</p>
            </div>

            <div className="recruiter-col">
              <h4>Missing Evidence / Opportunities</h4>
              <p className="text-amber-300">{recruiter.missingEvidence || 'None identified.'}</p>

              <h4>Recommended Changes</h4>
              <ul className="recruiter-bullet-list">
                {(recruiter.recommendedChanges || []).map((ch, i) => (
                  <li key={i}>{ch}</li>
                ))}
              </ul>

              <h4>Interview Talking Points to Prepare</h4>
              <ul className="recruiter-bullet-list">
                {(recruiter.interviewTalkingPoints || []).map((tp, i) => (
                  <li key={i}>{tp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
