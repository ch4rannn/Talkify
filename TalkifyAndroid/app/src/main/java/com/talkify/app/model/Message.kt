package com.talkify.app.model

data class Message(
    val id: String,
    val text: String,
    val mediaUrl: String? = null,
    val isSent: Boolean,
    val senderId: String? = null,
    val timestamp: Long = System.currentTimeMillis(),
    var status: String = "SENT"
)
