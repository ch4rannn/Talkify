import React, { useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import SettingsPanel from './components/SettingsPanel';
import CallOverlay from './components/CallOverlay';
import IncomingCallModal from './components/IncomingCallModal';
import AuthScreen from './components/AuthScreen';
import { ChatProvider, useChatStore } from './data/chatStore';
import { SettingsProvider, useSettings } from './data/settingsStore';
import './App.css';

function ChatApp() {
  const { 
    chats, 
    activeChatId, 
    getActiveChat, 
    startCall, 
    cancelCall, 
    endCall, 
    clearIncomingCall, 
    incomingCall, 
    myName 
  } = useChatStore();
  const activeChat = getActiveChat();
  const { settings } = useSettings();
  const [activeCall, setActiveCall] = useState(null);

  const handleStartCall = (roomID, type) => {
    // Notify the other user via WebSocket
    if (activeChat && activeChat.info && !activeChat.info.isGroup) {
      startCall(activeChat.info.id, type, roomID);
    }
    setActiveCall({ roomID, type });
  };

  const handleAcceptIncoming = () => {
    if (incomingCall) {
      setActiveCall({ roomID: incomingCall.roomID, type: incomingCall.callType });
      clearIncomingCall();
    }
  };

  const handleDeclineIncoming = () => {
    if (incomingCall) {
      cancelCall(incomingCall.fromUserId);
      clearIncomingCall();
    }
  };

  // Listen for external call end (from WebSocket)
  React.useEffect(() => {
    window._handleCallEndedExternally = () => {
      setActiveCall(null);
    };
    return () => {
      window._handleCallEndedExternally = null;
    };
  }, []);

  const handleEndCall = () => {
    // If we have an active call and an active chat person, notify them
    if (activeCall && activeChatId) {
      endCall(activeChatId);
    }
    setActiveCall(null);
  };

  return (
    <div className="app" id="app-root">
      <TopBar />
      <div className="app__body">
        <Sidebar />
        <div className="app__chat-panel">
          {activeChat ? (
            <>
              <ChatHeader onStartCall={handleStartCall} />
              <ChatArea />
              <MessageInput />
            </>
          ) : (
            <div className="app__no-chat">
              <span className="app__no-chat-icon">◈</span>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
      <SettingsPanel />

      {/* Incoming Call Notification */}
      {incomingCall && !activeCall && (
        <IncomingCallModal
          callerName={incomingCall.fromName}
          callType={incomingCall.callType}
          onAccept={handleAcceptIncoming}
          onDecline={handleDeclineIncoming}
        />
      )}

      {activeCall && (
        <CallOverlay
          roomID={activeCall.roomID}
          callType={activeCall.type}
          onEndCall={handleEndCall}
          username={myName || settings?.username}
        />
      )}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('talkify_token') || null);

  const handleLogin = (newToken, user) => {
    localStorage.setItem('talkify_token', newToken);
    localStorage.setItem('talkify_userId', user.id);
    localStorage.setItem('talkify_username', user.username);
    if(user.avatarUrl) localStorage.setItem('talkify_avatar', user.avatarUrl);
    setToken(newToken);
  };

  if (!token) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <SettingsProvider>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </SettingsProvider>
  );
}
