import { useEffect, useRef } from 'react';
import { useChatStore } from '../data/chatStore';
import { useSettings } from '../data/settingsStore';
import MessageBubble from './MessageBubble';
import './ChatArea.css';

function formatDateLabel(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0);
  if (diff === 0) return 'Today';
  if (diff <= 86400000) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function ChatArea() {
  const { getActiveChat } = useChatStore();
  const { settings } = useSettings();
  const chat = getActiveChat();
  const bottomRef = useRef(null);

  const messages = chat?.messages || [];
  const isGroup = chat?.info?.isGroup || false;

  useEffect(() => {
    if (settings.autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, settings.autoScroll]);

  if (!chat) {
    return (
      <main className="chat-area chat-area--no-chat" id="chat-area">
        <div className="chat-area__empty">
          <span className="chat-area__empty-icon" aria-hidden="true">◈</span>
          <p>Select a conversation</p>
          <p className="chat-area__empty-sub">Pick a contact or group from the sidebar.</p>
        </div>
      </main>
    );
  }

  // Build message groups for clustering + date separators
  const renderItems = [];
  let lastDate = null;

  messages.forEach((msg, i) => {
    const msgDate = new Date(msg.timestamp).toDateString();
    if (msgDate !== lastDate) {
      renderItems.push({ type: 'date', label: formatDateLabel(msg.timestamp), key: 'date-' + msgDate });
      lastDate = msgDate;
    }

    const prev = i > 0 ? messages[i - 1] : null;
    const sameSenderAsPrev = prev &&
      prev.isSent === msg.isSent &&
      prev.senderId === msg.senderId &&
      new Date(prev.timestamp).toDateString() === msgDate;

    renderItems.push({
      type: 'message',
      msg,
      grouped: sameSenderAsPrev,
      key: msg.id,
    });
  });

  return (
    <main className="chat-area" id="chat-area">
      {messages.length === 0 && (
        <div className="chat-area__empty">
          <span className="chat-area__empty-icon" aria-hidden="true">💬</span>
          <p>No messages yet</p>
          <p className="chat-area__empty-sub">
            Say hello to {chat.info.isGroup ? 'the group' : chat.info.name}!
          </p>
        </div>
      )}

      {renderItems.map((item) => {
        if (item.type === 'date') {
          return (
            <div key={item.key} className="chat-area__date-divider">
              <span className="chat-area__date-pill">{item.label}</span>
            </div>
          );
        }
        return (
          <MessageBubble
            key={item.key}
            text={item.msg.text}
            timestamp={item.msg.timestamp}
            isSent={item.msg.isSent}
            senderId={item.msg.senderId}
            isGroup={isGroup}
            grouped={item.grouped}
          />
        );
      })}

      <div ref={bottomRef} aria-hidden="true" />
    </main>
  );
}
