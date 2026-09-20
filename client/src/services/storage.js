// =========================================================
// Storage service for local-first persistence (localStorage)
// Preserves review history, saved drafts, and UI preferences.
// No API keys are stored in localStorage or the browser.
// =========================================================

const SETTINGS_KEY = 'ai_portfolio_writer_settings_v2';
const HISTORY_KEY = 'ai_portfolio_writer_history_v2';
const DRAFTS_KEY = 'ai_portfolio_writer_drafts_v2';

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  autoSaveHistory: true,
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.warn('Failed to parse settings from localStorage', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
    return settings;
  }
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load history', err);
    return [];
  }
}

export function getAnalysis(id) {
  const history = getHistory();
  return history.find((item) => item.id === id) || null;
}

export function saveAnalysis(analysisData) {
  try {
    const history = getHistory();
    const id = analysisData.id || `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const record = {
      id,
      createdAt: analysisData.createdAt || new Date().toISOString(),
      name: analysisData.name || 'Untitled Portfolio',
      url: analysisData.url || '',
      targetRole: analysisData.targetRole || 'Software Developer',
      overallScore: analysisData.overallScore ?? analysisData.overall?.score ?? 0,
      summary: analysisData.summary || analysisData.overall?.summary || '',
      isDemo: Boolean(analysisData.isDemo),
      data: analysisData,
    };

    // Remove if existing with same id, then prepend
    const filtered = history.filter((item) => item.id !== id);
    const updated = [record, ...filtered].slice(0, 50); // Keep last 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return record;
  } catch (err) {
    console.error('Failed to save analysis', err);
    return null;
  }
}

export function deleteAnalysis(id) {
  try {
    const history = getHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to delete analysis', err);
    return false;
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear history', err);
    return false;
  }
}

export function getDrafts() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function saveDraft(draft) {
  try {
    const drafts = getDrafts();
    const id = draft.id || `draft_${Date.now()}`;
    const newDraft = { ...draft, id, updatedAt: new Date().toISOString() };
    const filtered = drafts.filter((d) => d.id !== id);
    const updated = [newDraft, ...filtered].slice(0, 50);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    return newDraft;
  } catch (err) {
    console.error('Failed to save draft', err);
    return null;
  }
}

export function exportAllData() {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    history: getHistory(),
    drafts: getDrafts(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON structure');

    if (Array.isArray(parsed.history)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(parsed.history));
    }
    if (Array.isArray(parsed.drafts)) {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(parsed.drafts));
    }
    return { success: true, count: parsed.history?.length || 0 };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
