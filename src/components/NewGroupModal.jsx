import { useState } from 'react';
import { contacts } from '../data/chatData';
import { useChatStore } from '../data/chatStore';
import './NewGroupModal.css';

export default function NewGroupModal({ onClose }) {
  const { createGroup } = useChatStore();
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState(new Set());

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    const name = groupName.trim();
    if (!name || selected.size === 0) return;
    createGroup(name, Array.from(selected));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Create new group"
      >
        <h2 className="modal__title">Create New Group</h2>

        <input
          className="modal__input"
          type="text"
          placeholder="Group name…"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          autoFocus
        />

        <p className="modal__subtitle">Add Members</p>

        <ul className="modal__contacts">
          {contacts.map((c) => (
            <li
              key={c.id}
              className={`modal__contact ${selected.has(c.id) ? 'modal__contact--selected' : ''}`}
              onClick={() => toggle(c.id)}
              role="checkbox"
              aria-checked={selected.has(c.id)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggle(c.id)}
            >
              <div className="modal__contact-avatar">{c.initials}</div>
              <span className="modal__contact-name">{c.name}</span>
              <span className="modal__check">
                {selected.has(c.id) ? '✓' : ''}
              </span>
            </li>
          ))}
        </ul>

        <div className="modal__actions">
          <button className="modal__btn modal__btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal__btn modal__btn--create"
            onClick={handleCreate}
            disabled={!groupName.trim() || selected.size === 0}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
