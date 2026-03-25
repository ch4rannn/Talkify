/* ============================================================
   Talkify — Chat Store
   React Context + useReducer for centralized state management
   ============================================================ */

import { createContext, useContext, useReducer, useCallback, createElement } from 'react';
import {
  contacts,
  groups,
  getContact,
  seedConversations,
} from './chatData';

// ── Initial State ───────────────────────────────────────────
function buildInitialState() {
  const chats = {};

  // Individual contacts
  contacts.forEach((c) => {
    chats[c.id] = {
      info: { ...c, isGroup: false },
      messages: seedConversations[c.id] || [],
      unread: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0,
    };
  });

  // Groups
  groups.forEach((g) => {
    chats[g.id] = {
      info: {
        ...g,
        memberDetails: g.members.map((mid) => getContact(mid)).filter(Boolean),
      },
      messages: seedConversations[g.id] || [],
      unread: Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0,
    };
  });

  return {
    chats,
    activeChatId: 'c1',
    searchQuery: '',
  };
}

// ── Reducer ─────────────────────────────────────────────────
let msgIdCounter = 1000;
const nextMsgId = () => ++msgIdCounter;

function chatReducer(state, action) {
  switch (action.type) {
    case 'SELECT_CHAT': {
      const updated = { ...state, activeChatId: action.chatId };
      if (updated.chats[action.chatId]) {
        updated.chats = {
          ...updated.chats,
          [action.chatId]: {
            ...updated.chats[action.chatId],
            unread: 0,
          },
        };
      }
      return updated;
    }

    case 'SEND_MESSAGE': {
      const { chatId, text } = action;
      const chat = state.chats[chatId];
      if (!chat) return state;

      const newMsg = {
        id: nextMsgId(),
        text,
        isSent: true,
        senderId: null,
        timestamp: new Date().toISOString(),
      };

      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: [...chat.messages, newMsg],
          },
        },
      };
    }

    case 'RECEIVE_MESSAGE': {
      const { chatId, text, senderId } = action;
      const chat = state.chats[chatId];
      if (!chat) return state;

      const newMsg = {
        id: nextMsgId(),
        text,
        isSent: false,
        senderId,
        timestamp: new Date().toISOString(),
      };

      const isActive = state.activeChatId === chatId;

      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: [...chat.messages, newMsg],
            unread: isActive ? 0 : (chat.unread || 0) + 1,
          },
        },
      };
    }

    case 'CREATE_GROUP': {
      const { name, memberIds } = action;
      const id = 'g' + Date.now();
      const initials = name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const newGroup = {
        info: {
          id,
          name,
          isGroup: true,
          members: memberIds,
          memberDetails: memberIds.map((mid) => getContact(mid)).filter(Boolean),
          initials,
        },
        messages: [],
        unread: 0,
      };

      return {
        ...state,
        chats: { ...state.chats, [id]: newGroup },
        activeChatId: id,
      };
    }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────
const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, null, buildInitialState);

  const selectChat = useCallback(
    (chatId) => dispatch({ type: 'SELECT_CHAT', chatId }),
    [],
  );

  const sendMessage = useCallback(
    (chatId, text) => dispatch({ type: 'SEND_MESSAGE', chatId, text }),
    [],
  );

  const receiveMessage = useCallback(
    (chatId, text, senderId) =>
      dispatch({ type: 'RECEIVE_MESSAGE', chatId, text, senderId }),
    [],
  );

  const createGroup = useCallback(
    (name, memberIds) => dispatch({ type: 'CREATE_GROUP', name, memberIds }),
    [],
  );

  const setSearch = useCallback(
    (query) => dispatch({ type: 'SET_SEARCH', query }),
    [],
  );

  const value = {
    ...state,
    selectChat,
    sendMessage,
    receiveMessage,
    createGroup,
    setSearch,
    getActiveChat: () => state.chats[state.activeChatId] || null,
  };

  // Use createElement instead of JSX to avoid .js parse issues
  return createElement(ChatContext.Provider, { value }, children);
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatStore must be used within ChatProvider');
  return ctx;
}
