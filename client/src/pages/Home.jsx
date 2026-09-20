import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  PenTool,
  Shield,
  Zap,
  CheckCircle,
  BarChart2,
  Target,
  ArrowRight,
  Github,
  Code,
  Layers
} from '../components/icons';
import { DEMO_ANALYSIS_RESULT } from '../services/demoData';
import { saveAnalysis } from '../services/storage';

export default function Home() {
  const navigate = useNavigate();

  const handleLaunchDemo = () => {
    saveAnalysis(DEMO_ANALYSIS_RESULT);
    navigate('/review?id=demo_analysis_sample');
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-badge-icon" />
          <span>Open-Source AI Portfolio Platform</span>
          <span className="hero-badge-pill">v2.0</span>
        </div>

        <h1 className="hero-title">
          Your portfolio has 10 seconds<br />
          <span className="text-gradient">to make an impression.</span>
        </h1>

        <p className="hero-subtitle">
          PortfolioAI analyzes your portfolio across 10 dimensions and turns your weak spots into actionable improvements.
        </p>

        {/* CTAs */}
        <div className="hero-actions">
          <Link to="/analyze" className="btn btn-primary btn-large">
            <Sparkles size={18} />
            <span>✨ Review My Portfolio</span>
          </Link>

          <Link to="/writer" className="btn btn-secondary btn-large">
            <PenTool size={18} />
            <span>✍️ AI Portfolio Writer</span>
          </Link>
        </div>

        {/* Demo trigger banner */}
        <div className="hero-demo-trigger">
          <button onClick={handleLaunchDemo} className="btn-demo-pill">
            <Zap size={14} className="text-amber-400" />
            <span>Want to test first? <strong>Explore Live Demo Review</strong> (DEMO DATA)</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="hero-trust-grid">
          <div className="trust-item">
            <Shield size={16} className="text-emerald-400" />
            <span>Serverless AI (Zero Credentials Exposed)</span>
          </div>
          <div className="trust-item">
            <Code size={16} className="text-indigo-400" />
            <span>Open Source & Free</span>
          </div>
          <div className="trust-item">
            <Zap size={16} className="text-amber-400" />
            <span>Powered by Google Gemini</span>
          </div>
          <div className="trust-item">
            <CheckCircle size={16} className="text-cyan-400" />
            <span>No Account or Setup Needed</span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Matrix */}
      <section className="features-section">
        <div className="section-header text-center">
          <h2 className="section-title">Engineered for High-Growth Developers</h2>
          <p className="section-description">
            Everything you need to audit, evaluate, and rewrite your portfolio to present your strongest technical abilities.
          </p>
        </div>

        <div className="features-grid">
          {/* Card 1: 10-Category Deep Audit */}
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-indigo">
              <BarChart2 size={24} />
            </div>
            <h3 className="feature-card-title">10-Category Audit</h3>
            <p className="feature-card-text">
              Comprehensive scoring across Content Quality, Technical Positioning, UX, Visual Impact, and Recruiter Readiness.
            </p>
            <ul className="feature-list">
              <li>0–100 granular category benchmarks</li>
              <li>Priority weakness detection</li>
              <li>Actionable engineering recommendations</li>
            </ul>
          </div>

          {/* Card 2: AI Portfolio Writer */}
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-purple">
              <PenTool size={24} />
            </div>
            <h3 className="feature-card-title">Section AI Rewriter</h3>
            <p className="feature-card-text">
              Transform passive bios and vague bullet points into crisp, metric-backed developer copy.
            </p>
            <ul className="feature-list">
              <li>Side-by-side comparison view</li>
              <li>Tailored tones (Recruiter, Deep Technical, Punchy)</li>
              <li>One-click Accept, Edit, or Copy</li>
            </ul>
          </div>

          {/* Card 3: Project Improver */}
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-cyan">
              <Layers size={24} />
            </div>
            <h3 className="feature-card-title">Project Improver</h3>
            <p className="feature-card-text">
              Turn basic project descriptions into structured case studies with architecture highlights.
            </p>
            <ul className="feature-list">
              <li>Recruiter summary vs Technical deep-dive</li>
              <li>GitHub README snippets & badges</li>
              <li>Impact-driven resume bullet points</li>
            </ul>
          </div>

          {/* Card 4: Recruiter Simulation Mode */}
          <div className="feature-card">
            <div className="feature-icon-wrapper icon-emerald">
              <Target size={24} />
            </div>
            <h3 className="feature-card-title">Recruiter Simulation</h3>
            <p className="feature-card-text">
              Simulate how hiring managers and technical recruiters review your profile for specific engineering roles.
            </p>
            <ul className="feature-list">
              <li>Role-specific screening checks</li>
              <li>Identifies missing keywords & red flags</li>
              <li>Generates interview talking points</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="workflow-section">
        <div className="section-header text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-description">A seamless 4-step workflow from analysis to polished portfolio.</p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step">
            <div className="step-number">01</div>
            <h4>Input Portfolio</h4>
            <p>Paste your portfolio content, bio, or provide your live portfolio URL.</p>
          </div>
          <div className="workflow-step">
            <div className="step-number">02</div>
            <h4>AI Deep Audit</h4>
            <p>Gemini evaluates technical signal, clarity, and presentation across 10 dimensions.</p>
          </div>
          <div className="workflow-step">
            <div className="step-number">03</div>
            <h4>Review & Rewrite</h4>
            <p>Inspect weak sections and generate elevated copy side-by-side.</p>
          </div>
          <div className="workflow-step">
            <div className="step-number">04</div>
            <h4>Copy & Apply</h4>
            <p>Accept the improved content and update your live portfolio or resume.</p>
          </div>
        </div>
      </section>

      {/* Privacy & Architecture Banner */}
      <section className="privacy-banner">
        <div className="privacy-content">
          <div className="privacy-icon">
            <Shield size={32} className="text-emerald-400" />
          </div>
          <div className="privacy-text">
            <h3>Serverless AI Architecture. Local-First Storage.</h3>
            <p>
              AI requests are securely processed through the PortfolioAI serverless API. Your Gemini credentials are never exposed to the browser.
            </p>
          </div>
        </div>
        <div className="privacy-action">
          <Link to="/analyze" className="btn btn-secondary">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-logo-glow">
              <Sparkles size={16} />
            </div>
            <span>PortfolioAI Writer</span>
          </div>
          <p className="footer-text">
            Open-source developer tool. Built with React, Vite & Google Gemini.
          </p>
          <div className="footer-links">
            <Link to="/analyze">Analyze</Link>
            <Link to="/writer">AI Writer</Link>
            <Link to="/improver">Improve Project</Link>
            <Link to="/settings">Settings</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
