package com.talkify.app.model

import android.os.Handler
import android.os.Looper
import kotlin.random.Random

object ChatManager {
    // Seed Contacts
    val contacts = listOf(
        Contact("c1", "Aarav Sharma", isOnline = true, personalities = listOf(
            "Almost done with the frontend.",
            "I might need your input on the color scheme \uD83D\uDE09",
            "Let me push the latest changes..."
        )),
        Contact("c2", "Mei Lin", isOnline = true, personalities = listOf(
            "Looks good to me!",
            "Thanks! Let me know if you need anything else.",
            "I'll check it right away."
        )),
        Contact("c3", "Jordan Blake", lastSeen = "2 hours ago", personalities = listOf(
            "Not sure about that, let me think...",
            "Hmm, interesting approach.",
            "Could we jump on a quick call later?"
        )),
        Contact("c4", "Priya Patel", lastSeen = "Yesterday", personalities = listOf(
            "Sounds like a plan \uD83D\uDC4D",
            "Got it.",
            "Will do!"
        )),
        Contact("c5", "Lucas Rivera", isOnline = true, personalities = listOf(
            "Let me get back to you.",
            "I need to check the docs for that.",
            "Just a sec..."
        )),
        Contact("c6", "Sofia Chen", lastSeen = "5 mins ago", personalities = listOf(
            "Already done! \uD83D\uDE04",
            "You bet.",
            "Haha yes!"
        ))
    )

    private val mutableGroups = mutableListOf(
        Contact("g1", "Design Team", isGroup = true, members = listOf("c1", "c2", "c4", "c6")),
        Contact("g2", "Weekend Plans", isGroup = true, members = listOf("c3", "c5", "c1"))
    )

    // Current app state
    private val messages = mutableMapOf<String, MutableList<Message>>()
    private val unreadCounts = mutableMapOf<String, Int>()
    var activeChatId: String? = null
    
    // Callbacks
    private val listeners = mutableListOf<() -> Unit>()

    init {
        // Seed some initial messages
        addMessage("c1", Message("m1", "Hey Aarav! How's the project going?", true, timestamp = System.currentTimeMillis() - 3600000))
        addMessage("c1", Message("m2", "Going well! Almost done with the frontend.", false, "c1", timestamp = System.currentTimeMillis() - 3500000))
        addMessage("c1", Message("m3", "That's great, need any help?", true, timestamp = System.currentTimeMillis() - 3000000))
        addMessage("c1", Message("m4", "I might need your input on the color scheme \uD83D\uDE09", false, "c1", timestamp = System.currentTimeMillis() - 2900000))

        addMessage("g1", Message("m5", "Team, let's finalize the color palette today.", true, timestamp = System.currentTimeMillis() - 7200000))
        addMessage("g1", Message("m6", "I'll prepare some options.", false, "c2", timestamp = System.currentTimeMillis() - 7000000))
        addMessage("g1", Message("m7", "Sounds good, I have a few ideas too!", false, "c4", timestamp = System.currentTimeMillis() - 6800000))
        addMessage("g1", Message("m8", "Love this idea!", false, "c6", timestamp = System.currentTimeMillis() - 6500000))

        unreadCounts["c2"] = 1
        unreadCounts["c4"] = 3
    }

    fun getContactList(): List<ChatItem> {
        return contacts.map { c ->
            ChatItem(c, messages[c.id]?.lastOrNull(), unreadCounts[c.id] ?: 0)
        }.sortedByDescending { it.lastMessage?.timestamp ?: 0 }
    }

    fun getGroupList(): List<ChatItem> {
        return mutableGroups.map { g ->
            ChatItem(g, messages[g.id]?.lastOrNull(), unreadCounts[g.id] ?: 0)
        }.sortedByDescending { it.lastMessage?.timestamp ?: 0 }
    }

    fun getContactById(id: String): Contact? {
        return contacts.find { it.id == id } ?: mutableGroups.find { it.id == id }
    }

    fun getMessages(chatId: String): List<Message> {
        return messages[chatId] ?: emptyList()
    }

    fun markAsRead(chatId: String) {
        unreadCounts[chatId] = 0
        notifyListeners()
    }

    fun sendMessage(chatId: String, text: String) {
        val msg = Message("m${System.currentTimeMillis()}", text, true)
        addMessage(chatId, msg)
        
        // Auto-reply simulation
        val contact = getContactById(chatId) ?: return
        val delay = 800L + Random.nextLong(1500L)
        
        Handler(Looper.getMainLooper()).postDelayed({
            if (contact.isGroup) {
                if (contact.members.isNotEmpty()) {
                    val replierId = contact.members.random()
                    val replier = getContactById(replierId)
                    if (replier != null && replier.personalities.isNotEmpty()) {
                        val replyTxt = replier.personalities.random()
                        val replyMsg = Message("m${System.currentTimeMillis()}", replyTxt, false, replierId)
                        receiveMessage(chatId, replyMsg)
                    }
                }
            } else {
                if (contact.personalities.isNotEmpty()) {
                    val replyTxt = contact.personalities.random()
                    val replyMsg = Message("m${System.currentTimeMillis()}", replyTxt, false, contact.id)
                    receiveMessage(chatId, replyMsg)
                }
            }
        }, delay)
    }

    private fun receiveMessage(chatId: String, message: Message) {
        addMessage(chatId, message)
        if (activeChatId != chatId) {
            unreadCounts[chatId] = (unreadCounts[chatId] ?: 0) + 1
            notifyListeners()
        }
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

    private fun notifyListeners() {
        // notify all observers of state change
        Handler(Looper.getMainLooper()).post {
            listeners.forEach { it.invoke() }
        }
    }
}
