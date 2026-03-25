import { useState, useRef } from 'react';
import { useChatStore } from '../data/chatStore';
import { useSettings } from '../data/settingsStore';
import { API_BASE } from '../config';
import EmojiGifPicker from './EmojiGifPicker';
import './MessageInput.css';

export default function MessageInput() {
  const [value, setValue] = useState('');
  const { activeChatId, sendMessage, emitTyping } = useChatStore();
  const { settings } = useSettings();
  const typingTimeoutRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const lastFileRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);

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
    emitTyping(activeChatId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(activeChatId, false);
    }, 1500);
  };

  const uploadFile = (file) => {
    if (!file || !activeChatId) return;
    lastFileRef.current = file;
    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.append('media', file);
    const token = localStorage.getItem('talkify_token');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { url } = JSON.parse(xhr.responseText);
        sendMessage(activeChatId, null, url);
        setUploadProgress(null);
        setUploadError(null);
      } else {
        setUploadProgress(null);
        setUploadError('Upload failed. Tap to retry.');
      }
    };

    xhr.onerror = () => {
      setUploadProgress(null);
      setUploadError('Network error. Tap to retry.');
    };

    xhr.send(formData);
  };

  const handleImageSend = (e) => {
    const file = e.target.files[0];
    uploadFile(file);
    e.target.value = '';
  };

  const handleRetry = () => {
    if (lastFileRef.current) uploadFile(lastFileRef.current);
  };

  const handleKeyDown = (e) => {
    if (settings.enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Emoji/GIF/Sticker handlers
  const handleSelectEmoji = (emoji) => {
    setValue(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSelectGif = (gifUrl) => {
    sendMessage(activeChatId, null, gifUrl);
    setShowPicker(false);
  };

  const handleSelectSticker = (sticker) => {
    sendMessage(activeChatId, sticker);
    setShowPicker(false);
  };

  return (
    <footer className="input-bar" id="message-input" style={{ position: 'relative' }}>
      {/* Upload Progress Bar */}
      {uploadProgress !== null && (
        <div style={{
          position: 'absolute', top: '-40px', left: 0, right: 0,
          padding: '8px 16px', background: 'var(--surface)',
          borderTop: '1px solid var(--divider)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            flex: 1, height: '4px', background: 'var(--surface-hover)',
            borderRadius: '2px', overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`, height: '100%',
              background: '#0ea5e9', borderRadius: '2px',
              transition: 'width 0.2s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '36px', textAlign: 'right' }}>
            {uploadProgress}%
          </span>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div onClick={handleRetry} style={{
          position: 'absolute', top: '-40px', left: 0, right: 0,
          padding: '8px 16px', background: '#fef2f2',
          borderTop: '1px solid #fecaca', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          color: '#dc2626', fontSize: '0.8rem', fontWeight: 500
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {uploadError}
        </div>
      )}

      {/* Emoji/GIF/Sticker Picker */}
      {showPicker && (
        <EmojiGifPicker
          onSelectEmoji={handleSelectEmoji}
          onSelectGif={handleSelectGif}
          onSelectSticker={handleSelectSticker}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className="input-bar__wrapper">
        {/* Emoji Toggle */}
        <button
          onClick={() => setShowPicker(prev => !prev)}
          style={{
            padding: '12px 8px', display: 'flex', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.3rem', color: showPicker ? '#0ea5e9' : 'var(--text-secondary)',
            transition: 'color 0.15s'
          }}
          title="Emoji, GIF & Stickers"
        >
          😊
        </button>

        {/* Image Upload */}
        <label style={{ cursor: uploadProgress !== null ? 'wait' : 'pointer', padding: '12px 4px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSend} disabled={uploadProgress !== null} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </label>

        <input
          ref={inputRef}
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
