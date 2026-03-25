import { useState } from 'react';
import { useChatStore } from '../data/chatStore';
import { useSettings } from '../data/settingsStore';
import './MessageInput.css';

export default function MessageInput() {
  const [value, setValue] = useState('');
  const { activeChatId, sendMessage } = useChatStore();
  const { settings } = useSettings();

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || !activeChatId) return;
    sendMessage(activeChatId, trimmed);
    setValue('');
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
        <input
          className="input-bar__field"
          type="text"
          placeholder="Type a message…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
