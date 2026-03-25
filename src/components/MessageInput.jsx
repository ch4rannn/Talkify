import { useState, useRef } from 'react';
import { useChatStore } from '../data/chatStore';
import { useSettings } from '../data/settingsStore';
import { API_BASE } from '../config';
import './MessageInput.css';

export default function MessageInput() {
  const [value, setValue] = useState('');
  const { activeChatId, sendMessage, emitTyping } = useChatStore();
  const { settings } = useSettings();
  const typingTimeoutRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || !activeChatId) return;
    sendMessage(activeChatId, trimmed);
    setValue('');
    emitTyping(activeChatId, false);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    if (!activeChatId) return;
    
    // Broadcast active typing immediately
    emitTyping(activeChatId, true);
    
    // Reset the debounce timer
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(activeChatId, false);
    }, 1500);
  };

  const handleImageSend = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChatId) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const token = localStorage.getItem('talkify_token');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const { url } = await res.json();
        sendMessage(activeChatId, null, url);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (settings.enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="input-bar" id="message-input">
      <div className="input-bar__wrapper">
        <label style={{ cursor: 'pointer', padding: '12px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSend} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </label>
        <input
          className="input-bar__field"
          type="text"
          placeholder="Type a message…"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Type a message"
          autoComplete="off"
          id="chat-input-field"
        />
        <button
          className="input-bar__send"
          onClick={handleSend}
          disabled={!value.trim()}
          aria-label="Send message"
          id="send-button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
