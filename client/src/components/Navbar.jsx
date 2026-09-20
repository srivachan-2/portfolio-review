import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, PenTool, BarChart2, Zap, History, Settings, Target, Github, Menu, X } from './icons';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/analyze', label: 'Analyze', icon: Sparkles },
    { path: '/review', label: 'Review', icon: BarChart2 },
    { path: '/writer', label: 'AI Writer', icon: PenTool },
    { path: '/improver', label: 'Improve Project', icon: Zap },
    { path: '/recruiter', label: 'Recruiter Mode', icon: Target },
    { path: '/history', label: 'History', icon: History },
  ];

  const isActive = (path) => {
    if (path === '/review') {
      return location.pathname.startsWith('/review');
    }
    return location.pathname === path;
  };

  return (
    <header className="navbar-container">
      <nav className="navbar">
        <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-logo-glow">
            <Sparkles size={18} className="brand-icon" />
          </div>
          <span className="brand-text">
            Portfolio<span className="brand-accent">AI</span>
          </span>
          <span className="brand-badge">Writer</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="nav-actions desktop-only">
          <Link to="/settings" className="nav-btn-icon" title="Settings & API Key">
            <Settings size={18} />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn-github"
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle-btn mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu mobile-only">
          <div className="mobile-links">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-link ${active ? 'mobile-link-active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="mobile-divider" />
            <Link
              to="/settings"
              className="mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings size={18} />
              <span>Settings & API Key</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
