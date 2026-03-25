import { useEffect, useRef, useCallback } from 'react';
import { contacts, getContact } from '../data/chatData';

/**
 * useAutoReply — simulates replies from contacts after a message is sent.
 *
 * For individual chats: the specific contact replies using their personality.
 * For group chats: a random group member replies.
 */
export default function useAutoReply(chats, activeChatId, receiveMessage) {
  const lastMsgCountRef = useRef({});

  useEffect(() => {
    // Initialize counts
    Object.keys(chats).forEach((id) => {
      if (lastMsgCountRef.current[id] === undefined) {
        lastMsgCountRef.current[id] = chats[id].messages.length;
      }
    });
  }, []);

  useEffect(() => {
    Object.entries(chats).forEach(([chatId, chat]) => {
      const prevCount = lastMsgCountRef.current[chatId] || 0;
      const currCount = chat.messages.length;

      if (currCount > prevCount) {
        const lastMsg = chat.messages[currCount - 1];

        // Only reply to sent messages
        if (lastMsg && lastMsg.isSent) {
          const delay = 800 + Math.random() * 1500;

          if (chat.info.isGroup) {
            // Group: random member replies
            const memberIds = chat.info.members || [];
            if (memberIds.length > 0) {
              const replierId = memberIds[Math.floor(Math.random() * memberIds.length)];
              const contact = getContact(replierId);
              if (contact) {
                const reply = contact.personality[Math.floor(Math.random() * contact.personality.length)];
                setTimeout(() => receiveMessage(chatId, reply, replierId), delay);
              }
            }
          } else {
            // Individual: the contact replies
            const contact = contacts.find((c) => c.id === chatId);
            if (contact) {
              const reply = contact.personality[Math.floor(Math.random() * contact.personality.length)];
              setTimeout(() => receiveMessage(chatId, reply, chatId), delay);
            }
          }
        }
      }

      lastMsgCountRef.current[chatId] = currCount;
    });
  }, [chats, receiveMessage]);
}
