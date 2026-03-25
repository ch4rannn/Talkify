/* ============================================================
   Talkify — Settings Store
   React Context + localStorage for persistent user preferences
   ============================================================ */

import { createContext, useContext, useReducer, useEffect, createElement } from 'react';

const STORAGE_KEY = 'talkify_settings';

const defaultSettings = {
  // Profile
  username: 'You',
  statusMessage: '',
  // Appearance
  theme: 'dark',        // 'dark' | 'light'
  // Chat
  showTimestamps: true,
  enterToSend: true,
  autoScroll: true,
  // Notifications
  notificationsEnabled: true,
  messageSound: true,
  // UI
  settingsOpen: false,
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored), settingsOpen: false };
    }
  } catch (e) { /* ignore */ }
  return { ...defaultSettings };
}

function saveSettings(state) {
  try {
    const { settingsOpen, ...persist } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  } catch (e) { /* ignore */ }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, [action.key]: action.value };
    case 'TOGGLE':
      return { ...state, [action.key]: !state[action.key] };
    case 'OPEN_SETTINGS':
      return { ...state, settingsOpen: true };
    case 'CLOSE_SETTINGS':
      return { ...state, settingsOpen: false };
    case 'CLEAR_HISTORY':
      return state; // handled externally
    default:
      return state;
  }
}

const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadSettings);

  // Persist on every change
  useEffect(() => {
    saveSettings(state);
  }, [state]);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const value = {
    settings: state,
    set: (key, value) => dispatch({ type: 'SET', key, value }),
    toggle: (key) => dispatch({ type: 'TOGGLE', key }),
    openSettings: () => dispatch({ type: 'OPEN_SETTINGS' }),
    closeSettings: () => dispatch({ type: 'CLOSE_SETTINGS' }),
  };

  return createElement(SettingsContext.Provider, { value }, children);
}
