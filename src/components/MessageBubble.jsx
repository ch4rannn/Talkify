import './MessageBubble.css';
import { useSettings } from '../data/settingsStore';
import { API_BASE } from '../config';

export default function MessageBubble({ text, mediaUrl, status, timestamp, isSent, senderId, isGroup, grouped }) {
  const { settings } = useSettings();
  const senderName =
    isGroup && !isSent && senderId && !grouped ? senderId.substring(0, 8) : null;

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
        
        {mediaUrl && (
          <img 
            src={`${API_BASE}${mediaUrl}`} 
            alt="Attachment" 
            style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', marginBottom: text ? '8px' : '0' }}
          />
        )}
        
        {text && <p className="bubble__text">{text}</p>}
        
        {settings.showTimestamps && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: text ? '2px' : '0' }}>
            <time className="bubble__time" dateTime={timestamp}>
              {formatTime(timestamp)}
            </time>
            {isSent && (
              <span style={{ fontSize: '0.7rem', color: status === 'SEEN' ? '#3b82f6' : 'inherit', opacity: status === 'SEEN' ? 1 : 0.6 }}>
                {status === 'SENT' ? '✓' : status === 'DELIVERED' || status === 'SEEN' ? '✓✓' : '✓'}
              </span>
            )}
          </div>
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
