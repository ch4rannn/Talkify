package com.talkify.app.model

data class Contact(
    val id: String,
    var name: String,
    val isGroup: Boolean = false,
    val members: List<String> = emptyList(),
    var isOnline: Boolean = false,
    val lastSeen: String = "",
    var avatarUrl: String? = null,
    val personalities: List<String> = emptyList()
) {
    val initials: String
        get() {
            if (isGroup && name.isNotBlank()) {
                val words = name.split(" ").filter { it.isNotBlank() }
                return words.take(2).joinToString("") { it.first().uppercase() }
            }
            return name.split(" ").take(2).joinToString("") { it.first().uppercase() }
        }
}

data class ChatItem(
    val contact: Contact,
    val lastMessage: Message?,
    val unreadCount: Int = 0
)
