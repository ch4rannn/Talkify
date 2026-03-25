import { useState, useEffect, useRef } from 'react';

// ── Emoji Data ──
const EMOJI_CATEGORIES = {
  'Smileys': ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','🤓','😍','🥰','😘','😗','😙','😚','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','🤪','😝','🤑','🤭','🤫','🤥','😬','🤒','🤕','🤢','🤮','🥴','😵','🤯','🥳','🥸','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  'Gestures': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','💪','🦾','🖤','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢','💥','💫','💦','🔥'],
  'Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🦂','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐬','🐳','🐋','🦈','🐊','🐅','🐆'],
  'Food': ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🌮','🌯','🫔','🥙','🧆','🥗','🍝','🍜','🍲','🍛'],
  'Travel': ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🚲','🛴','🛹','🛼','🚂','🚃','✈️','🛫','🛬','🚁','🛸','🚀','🌍','🌎','🌏','🗺️','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️'],
  'Objects': ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','💽','💾','💿','📀','🧮','🎥','🎞️','📸','📷','📹','📼','🔍','🔬','🔭','📡','📺','📻','🎧','🎤','🎵','🎶','🎸','🥁','🎹','🎷','🎺','🪗','🎻','🎬','🏆','🥇','🥈','🥉','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🎱'],
  'Symbols': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','⛎','🔀','🔁','🔂','▶️','⏩','⏭️','⏯️','◀️','⏪','⏮️','🔼','⏫','🔽','⏬'],
};

// ── Sticker Packs (Large Emoji Art) ──
const STICKER_PACKS = {
  'Reactions': ['👍','👎','❤️','😂','😮','😢','😡','🎉','🤔','👏','🙏','💪','🔥','💯','✨','🎊','🥳','😎','🤩','💀'],
  'Animals': ['🐶','🐱','🐻','🐼','🦊','🐸','🐵','🦁','🐯','🐮','🐷','🐰','🐨','🦄','🐝','🐬','🦋','🐢','🐍','🦈'],
  'Food': ['🍕','🍔','🍟','🌮','🍩','🍪','🎂','🍰','🍭','🍬','🍫','☕','🍺','🍷','🧃','🍿','🧁','🍦','🍨','🥤'],
  'Hearts': ['❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️'],
};

// ── Tenor GIF API (free key for demo) ──
const TENOR_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ';

export default function EmojiGifPicker({ onSelectEmoji, onSelectGif, onSelectSticker, onClose }) {
  const [activeTab, setActiveTab] = useState('emoji');
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [activeEmojiCat, setActiveEmojiCat] = useState('Smileys');
  const [activeStickerPack, setActiveStickerPack] = useState('Reactions');
  const pickerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Fetch trending GIFs on tab open
  useEffect(() => {
    if (activeTab === 'gif' && gifs.length === 0) {
      fetchGifs('trending');
    }
  }, [activeTab]);

  const fetchGifs = async (query) => {
    setGifLoading(true);
    try {
      const endpoint = query === 'trending'
        ? `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=20&media_filter=tinygif`
        : `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&limit=20&media_filter=tinygif`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(data.results || []);
    } catch (err) {
      console.error('GIF fetch error:', err);
      setGifs([]);
    }
    setGifLoading(false);
  };

  const handleGifSearch = (e) => {
    setGifSearch(e.target.value);
    if (e.target.value.trim().length > 1) {
      fetchGifs(e.target.value.trim());
    } else if (e.target.value.trim().length === 0) {
      fetchGifs('trending');
    }
  };

  const tabs = [
    { id: 'emoji', icon: '😊', label: 'Emoji' },
    { id: 'gif', icon: 'GIF', label: 'GIFs' },
    { id: 'sticker', icon: '🎨', label: 'Stickers' },
  ];

  return (
    <div
      ref={pickerRef}
      style={{
        position: 'absolute', bottom: '60px', left: '8px',
        width: '360px', height: '380px',
        background: 'var(--bg-sidebar)', borderRadius: '16px',
        border: '1px solid var(--divider)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', zIndex: 100,
        animation: 'pickerSlideUp 0.25s ease'
      }}
    >
      {/* Tab Bar */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--divider)',
        padding: '0 4px', flexShrink: 0
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 0', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: tab.id === 'gif' ? '0.75rem' : '1.1rem',
              fontWeight: tab.id === 'gif' ? 700 : 400,
              color: activeTab === tab.id ? '#0ea5e9' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid #0ea5e9' : '2px solid transparent',
              transition: 'all 0.15s'
            }}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* ── Emoji Tab ── */}
      {activeTab === 'emoji' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Category Row */}
          <div style={{
            display: 'flex', gap: '2px', padding: '6px 8px',
            overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid var(--divider)'
          }}>
            {Object.keys(EMOJI_CATEGORIES).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveEmojiCat(cat)}
                style={{
                  padding: '4px 10px', borderRadius: '12px', border: 'none',
                  background: activeEmojiCat === cat ? '#0ea5e9' : 'var(--surface)',
                  color: activeEmojiCat === cat ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Emoji Grid */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '8px',
            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '2px', alignContent: 'start'
          }}>
            {EMOJI_CATEGORIES[activeEmojiCat].map((emoji, i) => (
              <button
                key={i}
                onClick={() => onSelectEmoji(emoji)}
                style={{
                  fontSize: '1.4rem', padding: '6px', border: 'none',
                  background: 'none', cursor: 'pointer', borderRadius: '8px',
                  transition: 'background 0.1s', lineHeight: 1
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── GIF Tab ── */}
      {activeTab === 'gif' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px', flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Search GIFs…"
              value={gifSearch}
              onChange={handleGifSearch}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '10px',
                border: '1px solid var(--divider)', background: 'var(--surface)',
                color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
              }}
            />
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', padding: '0 8px 8px',
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px', alignContent: 'start'
          }}>
            {gifLoading && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                Loading…
              </div>
            )}
            {!gifLoading && gifs.map((gif, i) => {
              const url = gif.media_formats?.tinygif?.url;
              if (!url) return null;
              return (
                <img
                  key={i}
                  src={url}
                  alt="GIF"
                  onClick={() => onSelectGif(url)}
                  style={{
                    width: '100%', height: '120px', objectFit: 'cover',
                    borderRadius: '8px', cursor: 'pointer',
                    transition: 'transform 0.15s', border: '1px solid var(--divider)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              );
            })}
            {!gifLoading && gifs.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No GIFs found
              </div>
            )}
          </div>
          <div style={{
            padding: '4px 8px', borderTop: '1px solid var(--divider)',
            textAlign: 'right', flexShrink: 0
          }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Powered by Tenor</span>
          </div>
        </div>
      )}

      {/* ── Sticker Tab ── */}
      {activeTab === 'sticker' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', gap: '2px', padding: '6px 8px',
            overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid var(--divider)'
          }}>
            {Object.keys(STICKER_PACKS).map(pack => (
              <button
                key={pack}
                onClick={() => setActiveStickerPack(pack)}
                style={{
                  padding: '4px 10px', borderRadius: '12px', border: 'none',
                  background: activeStickerPack === pack ? '#0ea5e9' : 'var(--surface)',
                  color: activeStickerPack === pack ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
              >
                {pack}
              </button>
            ))}
          </div>
          <div style={{
            flex: 1, overflowY: 'auto', padding: '8px',
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px', alignContent: 'start'
          }}>
            {STICKER_PACKS[activeStickerPack].map((sticker, i) => (
              <button
                key={i}
                onClick={() => onSelectSticker(sticker)}
                style={{
                  fontSize: '2.2rem', padding: '10px', border: 'none',
                  background: 'none', cursor: 'pointer', borderRadius: '12px',
                  transition: 'all 0.15s', lineHeight: 1
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                  e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pickerSlideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
