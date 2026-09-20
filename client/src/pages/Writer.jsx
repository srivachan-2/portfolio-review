import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  PenTool,
  Copy,
  Check,
  RefreshCw,
  FileText,
  CheckCircle,
  AlertTriangle
} from '../components/icons';
import { rewriteSection, formatAIErrorMessage } from '../services/ai';
import { saveDraft, getDrafts } from '../services/storage';

const SECTIONS = [
  'Hero Tagline & Headline',
  'About Me Narrative',
  'Project Description',
  'Experience Bullet Points',
  'Skills Presentation',
  'GitHub README Bio',
  'LinkedIn Summary',
  'Resume Summary'
];

const TONES = [
  'Recruiter-Optimized',
  'Confident & Direct',
  'Technical & Deep',
  'Impact & Metric Driven',
  'Story-Driven'
];

export default function Writer() {
  const location = useLocation();

  // Navigation state passed from review screen (if any)
  const navState = location.state || {};

  const [sectionType, setSectionType] = useState(navState.sectionType || SECTIONS[1]);
  const [tone, setTone] = useState(TONES[0]);
  const [targetRole, setTargetRole] = useState(navState.targetRole || 'Full Stack Developer');
  const [instructions, setInstructions] = useState('');
  const [currentContent, setCurrentContent] = useState(navState.currentContent || '');

  // AI output state
  const [aiSuggestion, setAiSuggestion] = useState(navState.suggestedContent || '');
  const [alternatives, setAlternatives] = useState([]);
  const [keyImprovements, setKeyImprovements] = useState([]);

  // UI states
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [acceptedToast, setAcceptedToast] = useState(false);

  // Saved drafts history
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    setIsEditingAi(false);

    try {
      const result = await rewriteSection({
        sectionType,
        currentContent,
        targetRole,
        instructions,
        tone,
      });

      const primary = result.primarySuggestion || '';
      setAiSuggestion(primary);
      setEditedContent(primary);
      setAlternatives(result.alternativeSuggestions || []);
      setKeyImprovements(result.keyImprovementsMade || []);
    } catch (err) {
      setError(formatAIErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (textToCopy) => {
    const text = textToCopy || (isEditingAi ? editedContent : aiSuggestion);
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccept = () => {
    const finalContent = isEditingAi ? editedContent : aiSuggestion;
    if (!finalContent) return;

    saveDraft({
      sectionType,
      targetRole,
      content: finalContent,
      tone,
    });

    setDrafts(getDrafts());
    setAcceptedToast(true);
    setTimeout(() => setAcceptedToast(false), 3000);
  };

  const handleDismiss = () => {
    setAiSuggestion('');
    setEditedContent('');
    setAlternatives([]);
    setKeyImprovements([]);
    setIsEditingAi(false);
  };

  const handleSelectAlternative = (altText) => {
    setAiSuggestion(altText);
    setEditedContent(altText);
    setIsEditingAi(false);
  };

  return (
    <div className="writer-page">
      <div className="page-header text-center">
        <div className="badge-pill mb-2">
          <PenTool size={14} />
          <span>AI Content Polisher</span>
        </div>
        <h1>AI Portfolio Writer</h1>
        <p className="page-header-subtitle">
          Transform weak sections, passive sentences, and generic bullets into compelling, high-converting portfolio copy.
        </p>
      </div>

      {acceptedToast && (
        <div className="toast-banner">
          <CheckCircle size={18} className="text-emerald-400" />
          <span>Section accepted and saved to local drafts!</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <AlertTriangle size={18} />
          <div className="alert-content">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Control Configuration Bar */}
      <div className="writer-controls-card card">
        <div className="controls-grid">
          <div className="control-group">
            <label className="control-label">Section to Polish</label>
            <select
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value)}
              className="form-select"
            >
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Writing Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="form-select"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="form-input"
              placeholder="e.g. Full Stack Developer"
            />
          </div>
        </div>

        <div className="instructions-group mt-3">
          <label className="control-label">Specific Instructions or Highlights (Optional)</label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="form-input"
            placeholder="e.g. Emphasize performance optimization, TypeScript, and open source leadership..."
          />
        </div>
      </div>

      {/* Side-by-Side Editor & Suggestion Layout */}
      <div className="writer-comparison-container">
        {/* Left Column: Current Version */}
        <div className="writer-col card">
          <div className="writer-col-header">
            <div className="col-title">
              <FileText size={16} />
              <span>CURRENT VERSION</span>
            </div>
            <span className="col-subtitle">Your original draft or raw notes</span>
          </div>

          <textarea
            rows={12}
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            placeholder={`Enter or paste your current ${sectionType} content here...\n\nExample:\n"I am a developer who builds websites and uses React and Node.js. Looking for opportunities."`}
            className="writer-textarea"
          />

          <div className="writer-col-footer">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn btn-primary btn-block"
            >
              {loading ? (
                <>
                  <div className="spinner-small" />
                  <span>Rewriting with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>✨ Generate AI Rewrite</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Suggestion */}
        <div className="writer-col card border-indigo-accent">
          <div className="writer-col-header">
            <div className="col-title text-indigo-400">
              <Sparkles size={16} />
              <span>AI SUGGESTION</span>
            </div>
            {aiSuggestion && (
              <button
                onClick={() => setIsEditingAi(!isEditingAi)}
                className="btn-text-toggle"
              >
                {isEditingAi ? 'Done Editing' : '✏️ Edit Text'}
              </button>
            )}
          </div>

          {aiSuggestion ? (
            <div className="ai-output-container">
              {isEditingAi ? (
                <textarea
                  rows={10}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="writer-textarea editing-active"
                />
              ) : (
                <div className="ai-suggestion-text-box">
                  {aiSuggestion}
                </div>
              )}

              {/* Action Buttons for AI Suggestion */}
              <div className="ai-suggestion-actions-row">
                <button onClick={handleAccept} className="btn btn-sm btn-success">
                  <Check size={14} />
                  <span>Accept Draft</span>
                </button>
                <button onClick={() => handleCopy()} className="btn btn-sm btn-secondary">
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button onClick={handleGenerate} disabled={loading} className="btn btn-sm btn-outline">
                  <RefreshCw size={14} />
                  <span>Regenerate</span>
                </button>
                <button onClick={handleDismiss} className="btn btn-sm btn-ghost text-rose-400">
                  <span>Dismiss</span>
                </button>
              </div>

              {/* Key Improvements Made */}
              {keyImprovements.length > 0 && (
                <div className="improvements-list-box">
                  <span className="improvements-title">Key Improvements Made:</span>
                  <ul>
                    {keyImprovements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative Suggestions Tabs */}
              {alternatives.length > 0 && (
                <div className="alternatives-box">
                  <span className="alternatives-title">Alternative Variations:</span>
                  <div className="alternatives-grid">
                    {alternatives.map((alt, i) => (
                      <div key={i} className="alternative-card">
                        <div className="alternative-card-header">
                          <span className="alt-label">{alt.label}</span>
                          <button
                            onClick={() => handleSelectAlternative(alt.content)}
                            className="btn btn-xs btn-outline"
                          >
                            Use This
                          </button>
                        </div>
                        <p className="alt-text">{alt.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ai-output-empty">
              <Sparkles size={36} className="text-muted mb-2" />
              <p>Click "Generate AI Rewrite" to create high-impact variations.</p>
              <span className="text-muted-sm">Never silently overwrites your original text.</span>
            </div>
          )}
        </div>
      </div>

      {/* Saved Drafts Drawer */}
      {drafts.length > 0 && (
        <section className="saved-drafts-section mt-8">
          <div className="section-header">
            <h3>Saved Drafts & Iterations ({drafts.length})</h3>
            <p className="section-subtitle">Local history of accepted AI rewrites.</p>
          </div>
          <div className="drafts-grid">
            {drafts.slice(0, 6).map((draft) => (
              <div key={draft.id} className="draft-card card">
                <div className="draft-card-header">
                  <span className="draft-section-tag">{draft.sectionType}</span>
                  <button
                    onClick={() => handleCopy(draft.content)}
                    className="btn btn-xs btn-ghost"
                    title="Copy content"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <p className="draft-preview-text">{draft.content}</p>
                <div className="draft-card-footer">
                  <span className="draft-tone-pill">{draft.tone || 'Standard'}</span>
                  <span className="draft-date">{new Date(draft.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
