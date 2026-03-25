import './MessageBubble.css';
import { getContact } from '../data/chatData';
import { useSettings } from '../data/settingsStore';

export default function MessageBubble({ text, timestamp, isSent, senderId, isGroup, grouped }) {
  const { settings } = useSettings();
  const senderName =
    isGroup && !isSent && senderId && !grouped ? getContact(senderId)?.name : null;

  const rowClass = [
    'bubble-row',
    isSent ? 'bubble-row--sent' : 'bubble-row--received',
    grouped ? 'bubble-row--grouped' : '',
  ].join(' ');

  return (
    <div className={rowClass}>
      <div className={`bubble ${isSent ? 'bubble--sent' : 'bubble--received'}`}>
        {senderName && (
          <span className="bubble__sender">{senderName}</span>
        )}
        <p className="bubble__text">{text}</p>
        {settings.showTimestamps && (
          <time className="bubble__time" dateTime={timestamp}>
            {formatTime(timestamp)}
          </time>
        )}
      </div>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
