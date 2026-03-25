import { useSettings } from '../data/settingsStore';
import { useChatStore } from '../data/chatStore';
import { API_BASE } from '../config';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const { settings, set, toggle, closeSettings } = useSettings();
  const { clearAllHistory, myName, updateMyProfile, fetchPendingCount } = useChatStore();

  if (!settings.settingsOpen) return null;

  const handleClearHistory = () => {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      if (typeof clearAllHistory === 'function') clearAllHistory();
      closeSettings();
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('media', file);
    
    try {
      const token = localStorage.getItem('talkify_token');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Usually good practice
        body: formData
      });
      
      if (res.ok) {
        const { url } = await res.json();
        
        // Update profile link in SQLite
        await fetch(`${API_BASE}/api/settings/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ username: settings.username || myName, avatarUrl: url })
        });
        
        localStorage.setItem('talkify_avatar', url);
        set('avatarUrl', url);
        updateMyProfile(settings.username || myName, url);
        alert("Avatar updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar");
    }
  };

  const handleProfileSave = async () => {
    const token = localStorage.getItem('talkify_token');
    try {
      const res = await fetch(`${API_BASE}/api/settings/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          username: settings.username, 
          avatarUrl: settings.avatarUrl || localStorage.getItem('talkify_avatar') 
        })
      });
      if (res.ok) {
        updateMyProfile(settings.username, settings.avatarUrl || localStorage.getItem('talkify_avatar'));
        alert("Profile updated!");
      }
    } catch (e) {
      alert("Failed to update profile");
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

            <div className="settings-field" style={{ alignItems: 'center', flexDirection: 'row', gap: '16px', marginBottom: '16px' }}>
              <div 
                className="settings-avatar-preview" 
                style={{
                  width: '64px', height: '64px', borderRadius: '50%', 
                  backgroundColor: 'var(--surface-hover)',
                  backgroundImage: settings.avatarUrl || localStorage.getItem('talkify_avatar') 
                    ? `url(${API_BASE}${settings.avatarUrl || localStorage.getItem('talkify_avatar')})` 
                    : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0
                }}
              />
              <div style={{ flex: 1 }}>
                <span className="settings-field__label" style={{ display: 'block', marginBottom: '8px' }}>Profile Picture</span>
                <label className="settings-danger-btn" style={{ display: 'inline-block', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', background: 'var(--border)', color: 'var(--text)' }}>
                  Upload Image
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <label className="settings-field">
              <span className="settings-field__label">Display Name</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="settings-field__input"
                  type="text"
                  value={settings.username || ''}
                  onChange={(e) => set('username', e.target.value)}
                  placeholder="Your display name"
                />
                <button 
                  className="settings-danger-btn" 
                  style={{ background: 'var(--primary)', padding: '0 12px', fontSize: '0.8rem', color: '#fff' }}
                  onClick={handleProfileSave}
                >
                  Save
                </button>
              </div>
            </label>

            <label className="settings-field">
              <span className="settings-field__label">Status Message</span>
              <input
                className="settings-field__input"
                type="text"
                value={settings.statusMessage || ''}
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
