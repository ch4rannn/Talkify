import { useSettings } from '../data/settingsStore';
import { useChatStore } from '../data/chatStore';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const { settings, set, toggle, closeSettings } = useSettings();
  const { clearAllHistory } = useChatStore();

  if (!settings.settingsOpen) return null;

  const handleClearHistory = () => {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      if (typeof clearAllHistory === 'function') clearAllHistory();
      closeSettings();
    }
  };

  return (
    <div className="settings-overlay" onClick={closeSettings}>
      <aside className="settings-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="settings-panel__header">
          <h2 className="settings-panel__title">Settings</h2>
          <button className="settings-panel__close" onClick={closeSettings} aria-label="Close settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-panel__body">

          {/* ── Profile ── */}
          <section className="settings-card">
            <h3 className="settings-card__title">Profile</h3>

            <label className="settings-field">
              <span className="settings-field__label">Display Name</span>
              <input
                className="settings-field__input"
                type="text"
                value={settings.username}
                onChange={(e) => set('username', e.target.value)}
                placeholder="Your name"
                maxLength={30}
              />
            </label>

            <label className="settings-field">
              <span className="settings-field__label">Status Message</span>
              <input
                className="settings-field__input"
                type="text"
                value={settings.statusMessage}
                onChange={(e) => set('statusMessage', e.target.value)}
                placeholder="What's on your mind?"
                maxLength={60}
              />
            </label>
          </section>

          {/* ── Appearance ── */}
          <section className="settings-card">
            <h3 className="settings-card__title">Appearance</h3>

            <div className="settings-toggle-row">
              <div>
                <span className="settings-toggle-row__label">Light Mode</span>
                <span className="settings-toggle-row__hint">Switch between dark and light themes</span>
              </div>
              <button
                className={`settings-switch ${settings.theme === 'light' ? 'settings-switch--on' : ''}`}
                onClick={() => set('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                role="switch"
                aria-checked={settings.theme === 'light'}
              >
                <span className="settings-switch__thumb" />
              </button>
            </div>
          </section>

          {/* ── Chat Settings ── */}
          <section className="settings-card">
            <h3 className="settings-card__title">Chat</h3>

            <ToggleRow
              label="Show Timestamps"
              hint="Display time on each message"
              checked={settings.showTimestamps}
              onToggle={() => toggle('showTimestamps')}
            />
            <ToggleRow
              label="Enter to Send"
              hint="Press Enter to send messages"
              checked={settings.enterToSend}
              onToggle={() => toggle('enterToSend')}
            />
            <ToggleRow
              label="Auto-scroll"
              hint="Scroll to latest message automatically"
              checked={settings.autoScroll}
              onToggle={() => toggle('autoScroll')}
            />
          </section>

          {/* ── Notifications ── */}
          <section className="settings-card">
            <h3 className="settings-card__title">Notifications</h3>

            <ToggleRow
              label="Enable Notifications"
              hint="Show desktop notifications"
              checked={settings.notificationsEnabled}
              onToggle={() => toggle('notificationsEnabled')}
            />
            <ToggleRow
              label="Message Sound"
              hint="Play sound when receiving messages"
              checked={settings.messageSound}
              onToggle={() => toggle('messageSound')}
            />
          </section>

          {/* ── Danger Zone ── */}
          <section className="settings-card">
            <h3 className="settings-card__title">Data</h3>
            <button className="settings-danger-btn" onClick={handleClearHistory}>
              Clear All Chat History
            </button>
          </section>

          {/* ── About ── */}
          <section className="settings-card settings-card--about">
            <span className="settings-about__logo">◈</span>
            <span className="settings-about__name">Talkify</span>
            <span className="settings-about__version">Version 2.0.0</span>
          </section>

        </div>
      </aside>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onToggle }) {
  return (
    <div className="settings-toggle-row">
      <div>
        <span className="settings-toggle-row__label">{label}</span>
        {hint && <span className="settings-toggle-row__hint">{hint}</span>}
      </div>
      <button
        className={`settings-switch ${checked ? 'settings-switch--on' : ''}`}
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
      >
        <span className="settings-switch__thumb" />
      </button>
    </div>
  );
}
