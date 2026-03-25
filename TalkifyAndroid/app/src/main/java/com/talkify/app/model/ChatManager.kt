package com.talkify.app.model

import android.os.Handler
import android.os.Looper
import com.talkify.app.network.WebSocketClient
import com.talkify.app.network.WsPresenceUser
import com.talkify.app.network.WsPrivatePayload

object ChatManager {
    var myId: String? = null
    var myName: String? = null

    private val dynamicContacts = mutableMapOf<String, Contact>()
    private val mutableGroups = mutableListOf<Contact>()

    // Current app state
    private val messages = mutableMapOf<String, MutableList<Message>>()
    private val unreadCounts = mutableMapOf<String, Int>()
    private val typingStates = mutableMapOf<String, Boolean>()
    var activeChatId: String? = null
    
    // Callbacks
    private val listeners = mutableListOf<() -> Unit>()
    private val callListeners = mutableListOf<() -> Unit>()

    fun syncPresence(users: List<WsPresenceUser>) {
        users.forEach { u ->
            if (u.userId != myId) {
                val online = u.isOnline == true
                if (dynamicContacts.containsKey(u.userId)) {
                    dynamicContacts[u.userId]?.isOnline = online
                    dynamicContacts[u.userId]?.name = u.username
                    if (u.avatarUrl != null) dynamicContacts[u.userId]?.avatarUrl = u.avatarUrl
                } else {
                    dynamicContacts[u.userId] = Contact(
                        id = u.userId,
                        name = u.username,
                        isOnline = online,
                        avatarUrl = u.avatarUrl
                    )
                }
            }
        }
        notifyListeners()
    }

    fun receiveApiMessage(payload: WsPrivatePayload) {
        val chatId = if (payload.senderId == myId) payload.receiverId else payload.senderId
        val msg = Message(
            id = payload.id ?: "m${payload.timestamp}${Math.random()}",
            text = payload.content ?: "",
            mediaUrl = payload.mediaUrl,
            isSent = (payload.senderId == myId),
            senderId = payload.senderId,
            timestamp = payload.timestamp,
            status = payload.status ?: "SENT"
        )
        
        addMessage(chatId, msg)
        if (activeChatId != chatId && !msg.isSent) {
            unreadCounts[chatId] = (unreadCounts[chatId] ?: 0) + 1
            notifyListeners()
        }
    }

    fun updateMessageStatus(messageId: String, status: String, chatId: String) {
        messages[chatId]?.find { it.id == messageId }?.status = status
        notifyListeners()
    }

    fun markAllSeenFor(chatId: String) {
        messages[chatId]?.filter { it.isSent && it.status != "SEEN" }?.forEach { it.status = "SEEN" }
        notifyListeners()
    }

    fun setTyping(senderId: String, isTyping: Boolean) {
        typingStates[senderId] = isTyping
        notifyListeners()
    }

    fun isTyping(chatId: String): Boolean = typingStates[chatId] ?: false

    fun getContactList(): List<ChatItem> {
        return dynamicContacts.values.filter { !it.isGroup }.map { c ->
            ChatItem(c, messages[c.id]?.lastOrNull(), unreadCounts[c.id] ?: 0)
        }.sortedWith(compareByDescending<ChatItem> { it.contact.isOnline }.thenBy { it.contact.name })
    }

    fun getRawContacts(): List<Contact> {
        return dynamicContacts.values.filter { !it.isGroup }.sortedBy { it.name }
    }

    fun getGroupList(): List<ChatItem> {
        return mutableGroups.map { g ->
            ChatItem(g, messages[g.id]?.lastOrNull(), unreadCounts[g.id] ?: 0)
        }.sortedByDescending { it.lastMessage?.timestamp ?: 0 }
    }

    fun getContactById(id: String): Contact? {
        return dynamicContacts[id] ?: mutableGroups.find { it.id == id }
    }

    fun getMessages(chatId: String): List<Message> {
        return messages[chatId] ?: emptyList()
    }

    fun markAsRead(chatId: String) {
        unreadCounts[chatId] = 0
        WebSocketClient.sendMarkSeen(chatId)
        notifyListeners()
    }

    fun sendMessage(chatId: String, text: String?, mediaUrl: String? = null) {
        WebSocketClient.sendMessage(chatId, text, mediaUrl)
    }

    fun sendTyping(chatId: String, isTyping: Boolean) {
        WebSocketClient.sendTyping(chatId, isTyping)
    }

    private fun addMessage(chatId: String, message: Message) {
        val list = messages.getOrPut(chatId) { mutableListOf() }
        list.add(message)
        notifyListeners()
    }

    fun createGroup(name: String, memberIds: List<String>): Contact {
        val newGroup = Contact("g${System.currentTimeMillis()}", name, isGroup = true, members = memberIds)
        mutableGroups.add(newGroup)
        notifyListeners()
        return newGroup
    }

    fun addListener(listener: () -> Unit) {
        if (!listeners.contains(listener)) listeners.add(listener)
    }

    fun removeListener(listener: () -> Unit) {
        listeners.remove(listener)
    }

    fun addCallListener(listener: () -> Unit) {
        if (!callListeners.contains(listener)) callListeners.add(listener)
    }

    fun removeCallListener(listener: () -> Unit) {
        callListeners.remove(listener)
    }

    fun handleCallEnded() {
        Handler(Looper.getMainLooper()).post {
            callListeners.forEach { it.invoke() }
        }
    }

    private fun notifyListeners() {
        Handler(Looper.getMainLooper()).post {
            listeners.forEach { it.invoke() }
        }
    }
}
