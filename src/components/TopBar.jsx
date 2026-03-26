import { useSettings } from '../data/settingsStore';
import { useChatStore } from '../data/chatStore';
import './TopBar.css';

export default function TopBar() {
  const { settings, openSettings } = useSettings();
  const { myName } = useChatStore();
  
  const displayUsername = myName || settings.username || 'You';
  const initial = displayUsername.charAt(0).toUpperCase();

  return (
    <header className="topbar" id="topbar">
      <div className="topbar__brand">
        <span className="topbar__logo" aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M54 24C37.43 24 24 36.31 24 51.5C24 60.21 28.58 67.98 35.72 73.18L32.37 82.83C32.03 83.81 32.95 84.73 33.93 84.39L44.75 80.64C47.68 81.49 50.79 81.99 54 81.99C70.57 81.99 84 69.69 84 54.5C84 39.31 70.57 24 54 24ZM62 45H56V60H52V45H46V41H62V45Z" fill="currentColor" />
          </svg>
        </span>
        <h1 className="topbar__title">Talkify</h1>
      </div>

      <div className="topbar__right">
        {/* Settings Gear */}
        <button
          className="topbar__settings-btn"
          onClick={openSettings}
          aria-label="Open settings"
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* User identity */}
        <div className="topbar__user">
          <div className="topbar__avatar" aria-label="Your avatar">
            {initial}
          </div>
          <div className="topbar__info">
            <span className="topbar__name">{displayUsername}</span>
            <span className="topbar__status">
              <span className="topbar__dot" aria-hidden="true" />
              {settings.statusMessage || 'Online'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
