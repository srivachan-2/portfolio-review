import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Sparkles,
  Trash2,
  ExternalLink,
  Download,
  Search,
  Globe,
  Briefcase,
  Layers,
  ArrowRight
} from '../components/icons';
import { getHistory, deleteAnalysis, clearHistory, exportAllData } from '../services/storage';

export default function History() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    setHistoryList(getHistory());
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved portfolio audit?')) {
      deleteAnalysis(id);
      setHistoryList(getHistory());
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all local analysis history? This action cannot be undone.')) {
      clearHistory();
      setHistoryList([]);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportAllData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `portfolio-analyses-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredHistory = historyList.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.targetRole || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'All' || item.targetRole === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getScoreColorClass = (score) => {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
  };

  return (
    <div className="history-page">
      <div className="page-header flex-between">
        <div>
          <div className="badge-pill mb-2">
            <HistoryIcon size={14} />
            <span>Local Browser Storage</span>
          </div>
          <h1>Analysis History</h1>
          <p className="page-header-subtitle">
            All your portfolio audits stored 100% locally in your browser. Never uploaded to external servers.
          </p>
        </div>

        {historyList.length > 0 && (
          <div className="history-top-actions">
            <button onClick={handleExportJSON} className="btn btn-sm btn-outline">
              <Download size={14} />
              <span>Export All (JSON)</span>
            </button>
            <button onClick={handleClearAll} className="btn btn-sm btn-ghost text-rose-400">
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      {historyList.length > 0 && (
        <div className="history-search-card card mb-6">
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by candidate name, target role, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      )}

      {/* History Items List */}
      {filteredHistory.length > 0 ? (
        <div className="history-grid">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="history-card card cursor-pointer"
              onClick={() => navigate(`/review?id=${item.id}`)}
            >
              <div className="history-card-top">
                <div className="history-card-meta">
                  <h3 className="history-candidate-name">{item.name || 'Untitled Portfolio'}</h3>
                  <div className="history-tags-row">
                    <span className="badge-role">{item.targetRole || 'Software Developer'}</span>
                    <span className="history-date-text">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className={`history-score-badge ${getScoreColorClass(item.overallScore || 80)}`}>
                  <span>{item.overallScore || 80}</span>
                  <span className="history-score-sub">/100</span>
                </div>
              </div>

              {item.url && (
                <div className="history-url-row">
                  <Globe size={13} />
                  <span>{item.url.replace(/^https?:\/\//, '')}</span>
                </div>
              )}

              <p className="history-summary-snippet">
                {item.summary || 'Click to view the complete 10-category breakdown, recruiter analysis, and section rewrites.'}
              </p>

              <div className="history-card-footer">
                <span className="btn-link-action">
                  <span>Open Audit</span>
                  <ArrowRight size={14} />
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="btn-icon-delete"
                  title="Delete this analysis"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="history-empty-card card text-center">
          <HistoryIcon size={48} className="text-muted mb-2" />
          <h3>No Analysis History Found</h3>
          <p>
            {historyList.length === 0
              ? 'Run an AI audit on your portfolio to save your first review locally.'
              : 'No analyses matched your search filters.'}
          </p>
          <div className="mt-4">
            <Link to="/analyze" className="btn btn-primary">
              <Sparkles size={16} />
              <span>Audit New Portfolio</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
