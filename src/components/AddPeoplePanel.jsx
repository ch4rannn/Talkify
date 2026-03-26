import React, { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '../data/chatStore';
import './AddPeoplePanel.css';
import { API_BASE } from '../config';

const BASE = API_BASE;

export default function AddPeoplePanel({ isOpen, onClose }) {
  const { fetchPendingCount } = useChatStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pending, setPending] = useState([]);
  const [searching, setSearching] = useState(false);
  const token = localStorage.getItem('talkify_token');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Load pending requests on open
  const loadPending = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/contacts/pending`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPending(data);
      }
    } catch (e) { console.error(e); }
  }, [headers]);

  useEffect(() => {
    if (isOpen) { loadPending(); setQuery(''); setResults([]); }
  }, [isOpen, loadPending]);

  // Search users
  const handleSearch = async (q) => {
    setQuery(q);
    if (q.trim().length < 1) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${BASE}/api/contacts/search?q=${encodeURIComponent(q)}`, { headers });
      if (res.ok) setResults(await res.json());
    } catch (e) { console.error(e); }
    setSearching(false);
  };

  // Send friend request
  const sendRequest = async (userId) => {
    try {
      await fetch(`${BASE}/api/contacts/request`, {
        method: 'POST', headers, body: JSON.stringify({ userId })
      });
      handleSearch(query); // refresh results
    } catch (e) { console.error(e); }
  };

  // Accept request
  const acceptRequest = async (userId) => {
    try {
      await fetch(`${BASE}/api/contacts/accept`, {
        method: 'POST', headers, body: JSON.stringify({ userId })
      });
      loadPending(); // refresh local
      fetchPendingCount(); // refresh global badge
    } catch (e) { console.error(e); }
  };

  // Decline request
  const declineRequest = async (userId) => {
    try {
      await fetch(`${BASE}/api/contacts/decline`, {
        method: 'POST', headers, body: JSON.stringify({ userId })
      });
      loadPending();
      fetchPendingCount(); // refresh global badge
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <div className="add-people-overlay" onClick={onClose}>
      <div className="add-people-panel" onClick={(e) => e.stopPropagation()}>
        
        <div className="add-people__header">
          <h2 className="add-people__title">Add People</h2>
          <button className="add-people__close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Search */}
        <div className="add-people__search">
          <input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Search Results */}
        {query.trim().length > 0 && (
          <div className="add-people__section">
            <h3 className="add-people__section-title">Search Results</h3>
            {searching && <p className="add-people__empty">Searching...</p>}
            {!searching && results.length === 0 && <p className="add-people__empty">No users found</p>}
            <ul className="add-people__list">
              {results.map((user) => (
                <li key={user.id} className="add-people__item">
                  <div className="add-people__avatar">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="add-people__name">{user.username}</span>
                  {user.contactStatus === 'ACCEPTED' ? (
                    <span className="add-people__badge add-people__badge--accepted">Friends ✓</span>
                  ) : user.contactStatus === 'PENDING' ? (
                    <span className="add-people__badge add-people__badge--pending">
                      {user.isSender ? 'Requested' : 'Respond ↓'}
                    </span>
                  ) : (
                    <button className="add-people__add-btn" onClick={() => sendRequest(user.id)}>
                      + Add
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pending Incoming Requests */}
        <div className="add-people__section">
          <h3 className="add-people__section-title">
            Pending Requests {pending.length > 0 && <span className="add-people__count">{pending.length}</span>}
          </h3>
          {pending.length === 0 && <p className="add-people__empty">No pending requests</p>}
          <ul className="add-people__list">
            {pending.map((user) => (
              <li key={user.userId} className="add-people__item">
                <div className="add-people__avatar">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="add-people__name">{user.username}</span>
                <div className="add-people__actions">
                  <button className="add-people__accept-btn" onClick={() => acceptRequest(user.userId)}>Accept</button>
                  <button className="add-people__decline-btn" onClick={() => declineRequest(user.userId)}>✕</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
