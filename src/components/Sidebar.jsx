import { useState } from 'react';
import { useChatStore } from '../data/chatStore';
import NewGroupModal from './NewGroupModal';
import './Sidebar.css';

export default function Sidebar() {
  const { chats, activeChatId, selectChat, searchQuery, setSearch } = useChatStore();
  const [showNewGroup, setShowNewGroup] = useState(false);

  const chatList = Object.values(chats);
  const directChats = chatList.filter((c) => !c.info.isGroup);
  const groupChats = chatList.filter((c) => c.info.isGroup);

  const q = searchQuery.toLowerCase();
  const filteredDirect = q
    ? directChats.filter((c) => c.info.name.toLowerCase().includes(q))
    : directChats;
  const filteredGroups = q
    ? groupChats.filter((c) => c.info.name.toLowerCase().includes(q))
    : groupChats;

  const getLastMessage = (chat) => {
    const msgs = chat.messages;
    if (msgs.length === 0) return 'No messages yet';
    const last = msgs[msgs.length - 1];
    const prefix = last.isSent ? 'You: ' : '';
    const text = last.text.length > 28 ? last.text.slice(0, 28) + '…' : last.text;
    return prefix + text;
  };

  const getLastTime = (chat) => {
    const msgs = chat.messages;
    if (msgs.length === 0) return '';
    const d = new Date(msgs[msgs.length - 1].timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <aside className="sidebar" id="sidebar">
        {/* Search */}
        <div className="sidebar__search">
          <div className="sidebar__search-inner">
            <svg className="sidebar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="sidebar__search-input"
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search conversations"
            />
          </div>
        </div>

        <div className="sidebar__content">
          {/* Direct Messages */}
          <div className="sidebar__section">
            <div className="sidebar__label-row">
              <h2 className="sidebar__label">Direct Messages</h2>
            </div>
            <ul className="sidebar__list">
              {filteredDirect.map((chat) => (
                <li
                  key={chat.info.id}
                  className={`sidebar__item ${activeChatId === chat.info.id ? 'sidebar__item--active' : ''}`}
                  onClick={() => selectChat(chat.info.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && selectChat(chat.info.id)}
                >
                  <div
                    className="sidebar__avatar"
                    style={{ background: chat.info.avatarColor || 'var(--surface)' }}
                  >
                    {chat.info.initials}
                    {chat.info.online && <span className="sidebar__online-dot" />}
                  </div>
                  <div className="sidebar__info">
                    <div className="sidebar__header">
                      <span className="sidebar__name">{chat.info.name}</span>
                      <span className="sidebar__time">{getLastTime(chat)}</span>
                    </div>
                    <div className="sidebar__meta">
                      <span className="sidebar__preview">{getLastMessage(chat)}</span>
                      {chat.unread > 0 && (
                        <span className="sidebar__badge">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Groups */}
          <div className="sidebar__section">
            <div className="sidebar__label-row">
              <h2 className="sidebar__label">Groups</h2>
              <button
                className="sidebar__new-group-btn"
                onClick={() => setShowNewGroup(true)}
                aria-label="Create new group"
              >
                + New
              </button>
            </div>
            <ul className="sidebar__list">
              {filteredGroups.map((chat) => (
                <li
                  key={chat.info.id}
                  className={`sidebar__item ${activeChatId === chat.info.id ? 'sidebar__item--active' : ''}`}
                  onClick={() => selectChat(chat.info.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && selectChat(chat.info.id)}
                >
                  <div
                    className="sidebar__avatar sidebar__avatar--group"
                    style={{ background: chat.info.avatarColor || 'var(--surface)' }}
                  >
                    {chat.info.initials}
                  </div>
                  <div className="sidebar__info">
                    <div className="sidebar__header">
                      <span className="sidebar__name">{chat.info.name}</span>
                      <span className="sidebar__time">{getLastTime(chat)}</span>
                    </div>
                    <div className="sidebar__meta">
                      <span className="sidebar__preview">
                        {chat.info.members ? `${chat.info.members.length} members` : ''}
                        {' · '}
                        {getLastMessage(chat)}
                      </span>
                      {chat.unread > 0 && (
                        <span className="sidebar__badge">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App Button */}
          <div className="sidebar__download-app">
            <a 
               href="/app-debug.apk" 
               download 
               className="sidebar__download-btn"
               title="Download Talkify for Android"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Get Android App</span>
            </a>
          </div>
        </div>
      </aside>

      {showNewGroup && (
        <NewGroupModal onClose={() => setShowNewGroup(false)} />
      )}
    </>
  );
}
