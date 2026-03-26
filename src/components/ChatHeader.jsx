import { useChatStore } from '../data/chatStore';
import { useSettings } from '../data/settingsStore';
import { API_BASE } from '../config';
import './ChatHeader.css';

export default function ChatHeader({ onStartCall }) {
  const { getActiveChat, setGroupNickname } = useChatStore();
  const { settings } = useSettings();
  const chat = getActiveChat();

  if (!chat) return null;

  const { info } = chat;

  return (
    <div className="chat-header" id="chat-header">
      <div className="chat-header__left">
        <div
          className={`chat-header__avatar ${info.isGroup ? 'chat-header__avatar--group' : ''}`}
          style={{ 
            backgroundColor: info.avatarColor || 'var(--surface)',
            backgroundImage: info.avatarUrl 
              ? `url(${API_BASE}${info.avatarUrl})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: info.avatarUrl ? 'transparent' : 'inherit'
          }}
        >
          {!info.avatarUrl && info.initials}
          {!info.isGroup && info.online && (
            <span className="chat-header__dot" />
          )}
        </div>
        <div className="chat-header__info">
          <h2 className="chat-header__name">{info.name}</h2>
          <span className="chat-header__status">
            {chat.isTyping
              ? <span style={{ color: 'var(--primary)', fontStyle: 'italic', fontSize: '0.85rem' }}>typing...</span>
              : info.isGroup
                ? `${info.members.length} members`
                : info.online
                  ? 'Online'
                  : info.lastSeen ? `Last seen ${info.lastSeen}` : 'Offline'}
          </span>
        </div>
      </div>

      {info.isGroup && info.memberDetails && (
        <div className="chat-header__members">
          {info.memberDetails.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="chat-header__member-avatar"
              title={`${m.name}${info.nicknames?.[m.id] ? ` (${info.nicknames[m.id]})` : ''}`}
              onClick={() => {
                const nick = prompt(`Set nickname for ${m.name}:`, info.nicknames?.[m.id] || '');
                if (nick !== null) setGroupNickname(info.id, m.id, nick);
              }}
              style={{ background: m.avatarColor || 'var(--surface)', cursor: 'pointer' }}
            >
              {m.initials}
            </div>
          ))}
          {info.memberDetails.length > 4 && (
            <div className="chat-header__member-avatar chat-header__member-more">
              +{info.memberDetails.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Call Actions */}
      <div className="chat-header__actions" style={{ display: 'flex', gap: '16px', marginLeft: 'auto', alignItems: 'center' }}>
        <button
          onClick={() => onStartCall && onStartCall(`talkify_room_${info.id}`, 'audio')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
          title="Voice Call"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        </button>
        <button
          onClick={() => onStartCall && onStartCall(`talkify_room_${info.id}`, 'video')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
          title="Video Call"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        </button>
      </div>

    </div>
  );
}
