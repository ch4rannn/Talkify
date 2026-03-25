package com.talkify.app.model

data class Message(
    val id: String,
    val text: String,
    val isSent: Boolean,
    val senderId: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)
