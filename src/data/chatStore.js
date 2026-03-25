/* ============================================================
   Talkify — WebSocket Driven Chat Store
   ============================================================ */

import { createContext, useContext, useReducer, useCallback, createElement, useEffect } from 'react';
import { API_BASE, WS_BASE } from '../config';
import useWebSocket from '../hooks/useWebSocket';

// ── Initial State ───────────────────────────────────────────
function buildInitialState() {
  return {
    chats: {}, // Map of contactId -> { info, messages, unread }
    activeChatId: null,
    searchQuery: '',
    myId: null,      // Retrieved from server
    myName: null,
  };
}

// ── Reducer ─────────────────────────────────────────────────
function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_ME':
      return { ...state, myId: action.myId, myName: action.myName };

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

    case 'LOAD_HISTORY': {
      const { chatId, messages } = action;
      const chat = state.chats[chatId];
      if (!chat) return state;

      const formattedMessages = messages.map(m => ({
        id: m.id,
        text: m.content,
        mediaUrl: m.mediaUrl,
        isSent: m.senderId === state.myId,
        senderId: m.senderId,
        timestamp: m.timestamp,
        status: m.status
      }));

      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: { ...chat, messages: formattedMessages, unread: 0 }
        }
      };
    }

    case 'UPDATE_MSG_STATUS': {
      const { messageId, status, chatId } = action;
      const chat = state.chats[chatId];
      if (!chat) return state;

      const newMessages = chat.messages.map(m => 
        m.id === messageId ? { ...m, status } : m
      );

      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: { ...chat, messages: newMessages }
        }
      };
    }

    case 'MARK_ALL_SEEN_FOR': {
      const { chatId } = action;
      const chat = state.chats[chatId];
      if (!chat) return state;

      const newMessages = chat.messages.map(m => 
        m.isSent && m.status !== 'SEEN' ? { ...m, status: 'SEEN' } : m
      );

      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: { ...chat, messages: newMessages }
        }
      };
    }

    case 'SET_TYPING': {
      const { chatId, isTyping } = action;
      const chat = state.chats[chatId];
      if (!chat) return state;
      
      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: { ...chat, isTyping }
        }
      };
    }

    case 'SYNC_PRESENCE': {
      // action.users is array of { userId, username, isOnline, lastSeen, avatarUrl }
      const newChats = { ...state.chats };
      const incomingUsers = action.users.filter(u => u.userId !== state.myId);

      // Add new users or update info — use the server's isOnline flag
      incomingUsers.forEach(u => {
        const isOnline = u.isOnline === 1 || u.isOnline === true;
        if (!newChats[u.userId]) {
          newChats[u.userId] = {
            info: {
              id: u.userId,
              name: u.username,
              isGroup: false,
              online: isOnline,
              lastSeen: u.lastSeen || '',
              initials: u.username.substring(0, 2).toUpperCase(),
              avatarColor: 'var(--surface-hover)',
              avatarUrl: u.avatarUrl
            },
            messages: [],
            unread: 0
          };
        } else {
          newChats[u.userId].info.online = isOnline;
          newChats[u.userId].info.name = u.username;
          if (u.lastSeen) newChats[u.userId].info.lastSeen = u.lastSeen;
          if (u.avatarUrl) newChats[u.userId].info.avatarUrl = u.avatarUrl;
        }
      });

      // Auto-select first chat if none selected
      let nextActiveChatId = state.activeChatId;
      const allIds = incomingUsers.map(u => u.userId);
      if (!nextActiveChatId && allIds.length > 0) {
        nextActiveChatId = allIds[0];
      }

      return { ...state, chats: newChats, activeChatId: nextActiveChatId };
    }

    case 'RECEIVE_API_MESSAGE': {
      const { senderId, receiverId, content, timestamp } = action.payload;
      
      // Resolve the chat partner
      const chatId = senderId === state.myId ? receiverId : senderId;
      
      const chat = state.chats[chatId];
      if (!chat) return state; // Drop offline ghost messages

      const newMsg = {
        id: timestamp + Math.random(),
        text: content,
        isSent: senderId === state.myId,
        senderId,
        timestamp,
      };

      const isActive = state.activeChatId === chatId;

      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: [...chat.messages, newMsg],
            unread: isActive || newMsg.isSent ? 0 : (chat.unread || 0) + 1,
          },
        },
      };
    }

    case 'CREATE_GROUP': {
      // Group logic unchanged locally, but not broadcast to WS yet
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
          memberDetails: [], // Skipping offline mapping
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

// ── Context Provider ────────────────────────────────────────
const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, null, () => {
    const initialState = buildInitialState();
    initialState.myId = localStorage.getItem('talkify_userId');
    initialState.myName = localStorage.getItem('talkify_username');
    return initialState;
  });
  
  const token = localStorage.getItem('talkify_token');
  const baseUrlWS = WS_BASE;
  const baseUrlHTTP = API_BASE;

  // Initialize native local network WebSocket, injecting JWT for auth
  const { send, onMessage, connected } = useWebSocket(baseUrlWS, token);

  // Handle incoming presence & messaging frames
  useEffect(() => {
    const unsubscribe = onMessage((msg) => {
      // 1) Identity (Server confirms token)
      if (msg.type === 'IDENTIFIED') {
        dispatch({ type: 'SET_ME', myId: msg.userId, myName: msg.username });
      }
      // 2) Presence list
      else if (msg.type === 'PRESENCE_UPDATE') {
        dispatch({ type: 'SYNC_PRESENCE', users: msg.payload });
      }
      // 5) Echo & Receipt point-to-point from server DB
      else if (msg.type === 'RECEIVE_MESSAGE') {
        dispatch({ type: 'RECEIVE_API_MESSAGE', payload: msg.payload });
      }
      // 6) Read Receipts
      else if (msg.type === 'MESSAGE_STATUS') {
        const { messageId, status, chatId } = msg.payload;
        dispatch({ type: 'UPDATE_MSG_STATUS', messageId, status, chatId });
      }
      else if (msg.type === 'MESSAGES_SEEN') {
        const { seenBy } = msg.payload;
        dispatch({ type: 'MARK_ALL_SEEN_FOR', chatId: seenBy });
      }
      // 7) Volatile Typing Indicator
      else if (msg.type === 'TYPING_INDICATOR') {
        const { senderId, isTyping } = msg.payload;
        dispatch({ type: 'SET_TYPING', chatId: senderId, isTyping });
      }
    });

    return unsubscribe;
  }, [onMessage]);

  const selectChat = useCallback(
    async (chatId) => {
      dispatch({ type: 'SELECT_CHAT', chatId });
      
      // Fetch persistent history from SQLite REST API
      try {
        const res = await fetch(`${baseUrlHTTP}/api/messages/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const messages = await res.json();
          dispatch({ type: 'LOAD_HISTORY', chatId, messages });
          
          // Tell the server we have seen all these messages
          if (connected) {
            send('MARK_SEEN', { senderId: chatId });
          }
        }
      } catch (err) {
        console.error("[REST] Failed to load history", err);
      }
    },
    [baseUrlHTTP, token, connected, send]
  );

  const sendMessage = useCallback(
    (chatId, text, mediaUrl = null) => {
      // Issue payload to WebSocket (waits for server echo to render)
      send('PRIVATE_MESSAGE', {
        payload: {
          senderId: state.myId,
          receiverId: chatId,
          content: text || '',
          mediaUrl,
          timestamp: Date.now()
        }
      });
    },
    [send, state.myId],
  );

  const emitTyping = useCallback(
    (chatId, isTyping) => {
      if (!chatId) return;
      send('TYPING', {
        payload: {
          receiverId: chatId,
          isTyping,
        }
      });
    },
    [send]
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
    emitTyping,
    createGroup,
    setSearch,
    getActiveChat: () => state.chats[state.activeChatId] || null,
  };

  return createElement(ChatContext.Provider, { value }, children);
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatStore must be used within ChatProvider');
  return ctx;
}
