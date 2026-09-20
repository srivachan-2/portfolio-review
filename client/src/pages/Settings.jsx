import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  Check,
  Sliders
} from '../components/icons';
import {
  clearHistory,
  exportAllData,
  importData
} from '../services/storage';

export default function Settings() {
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = () => {
    const jsonStr = exportAllData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `portfolio-review-writer-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const result = importData(content);
      if (result.success) {
        setImportStatus({ success: true, message: `Successfully imported ${result.count} portfolio analyses!` });
      } else {
        setImportStatus({ success: false, message: `Import failed: ${result.error}` });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Clear all local analysis history and drafts from this browser?')) {
      clearHistory();
      alert('All local history cleared.');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header text-center">
        <div className="badge-pill mb-2">
          <SettingsIcon size={14} />
          <span>Application Settings</span>
        </div>
        <h1>Settings & AI Architecture</h1>
        <p className="page-header-subtitle">
          PortfolioAI runs on a serverless architecture with local-first browser history persistence.
        </p>
      </div>

      {/* Privacy Notice Card */}
      <div className="privacy-notice-card card border-emerald mb-6">
        <div className="notice-icon">
          <Shield size={24} className="text-emerald-400" />
        </div>
        <div className="notice-body">
          <h4>Privacy & Security Architecture</h4>
          <p>
            AI requests are securely processed through the PortfolioAI serverless API. Your Gemini credentials are never exposed to the browser.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="settings-form-container">
        {/* Section 1: AI Engine Overview */}
        <div className="card settings-section-card">
          <div className="settings-card-header">
            <Zap size={18} className="text-indigo-400" />
            <h3>AI Engine</h3>
          </div>

          <div className="engine-status-box">
            <div className="engine-status-row">
              <span className="engine-label">Provider:</span>
              <span className="engine-value font-bold">Google Gemini</span>
            </div>
            <div className="engine-status-row">
              <span className="engine-label">Architecture:</span>
              <span className="engine-value">Vercel Serverless Function Proxy</span>
            </div>
            <div className="engine-status-row">
              <span className="engine-label">Security:</span>
              <span className="engine-value text-emerald-400">Credential isolation (Server-side environment variables)</span>
            </div>
          </div>

          <p className="settings-section-text mt-3">
            Visitors do not need to provide or configure an API key. All analyses are handled through the unified serverless backend endpoint with built-in request validation and abuse protection.
          </p>
        </div>

        {/* Section 2: Local Data Management */}
        <div className="card settings-section-card">
          <div className="settings-card-header">
            <Sliders size={18} className="text-purple-400" />
            <h3>Local Storage & Backup</h3>
          </div>

          <p className="settings-section-text">
            Export your complete portfolio audit history, section drafts, and customized rewrites to a JSON file for safe local backup, or import a previous backup.
          </p>

          <div className="backup-actions-grid">
            <div className="backup-item">
              <label className="btn btn-outline btn-block cursor-pointer">
                <Upload size={16} />
                <span>Import Data (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="backup-item">
              <button
                type="button"
                onClick={handleExport}
                className="btn btn-outline btn-block"
              >
                <Download size={16} />
                <span>Export Data (JSON)</span>
              </button>
            </div>
          </div>

          {importStatus && (
            <div
              className={`test-result-alert ${
                importStatus.success ? 'alert-success' : 'alert-error'
              }`}
            >
              {importStatus.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{importStatus.message}</span>
            </div>
          )}

          <div className="danger-zone-divider" />

          <div className="danger-zone-row">
            <div>
              <span className="danger-zone-title">Clear Local Analysis History</span>
              <p className="danger-zone-desc">Removes all audits and accepted drafts stored in this browser.</p>
            </div>
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="btn btn-sm btn-ghost text-rose-400"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
