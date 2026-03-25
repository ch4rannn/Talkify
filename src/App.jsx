import React, { useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import SettingsPanel from './components/SettingsPanel';
import CallOverlay from './components/CallOverlay';
import { ChatProvider, useChatStore } from './data/chatStore';
import { SettingsProvider, useSettings } from './data/settingsStore';
import useAutoReply from './hooks/useAutoReply';
import './App.css';

function ChatApp() {
  const { chats, activeChatId, receiveMessage, getActiveChat } = useChatStore();
  const activeChat = getActiveChat();
  const { settings } = useSettings();
  const [activeCall, setActiveCall] = useState(null);

  // Simulate auto-replies
  useAutoReply(chats, activeChatId, receiveMessage);

  return (
    <div className="app" id="app-root">
      <TopBar />
      <div className="app__body">
        <Sidebar />
        <div className="app__chat-panel">
          {activeChat ? (
            <>
              <ChatHeader onStartCall={(roomID, type) => setActiveCall({ roomID, type })} />
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

      {activeCall && (
        <CallOverlay
          roomID={activeCall.roomID}
          callType={activeCall.type}
          onEndCall={() => setActiveCall(null)}
          username={settings?.username}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </SettingsProvider>
  );
}
