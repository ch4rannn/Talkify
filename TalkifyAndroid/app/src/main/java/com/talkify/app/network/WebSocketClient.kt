package com.talkify.app.network

import android.util.Log
import com.google.gson.Gson
import com.talkify.app.model.ChatManager
import com.talkify.app.AppConfig
import okhttp3.*
import java.util.concurrent.TimeUnit

data class WsMessage(val type: String, val userId: String? = null, val username: String? = null, val payload: Any? = null)
data class WsPresenceUser(val userId: String, val username: String, val avatarUrl: String? = null, val isOnline: Boolean? = false, val lastSeen: String? = null)
data class WsPrivatePayload(val id: String? = null, val senderId: String, val receiverId: String, val content: String?, val mediaUrl: String? = null, val status: String? = null, val timestamp: Long)
data class WsStatusPayload(val messageId: String, val status: String, val chatId: String)
data class WsTypingPayload(val senderId: String, val isTyping: Boolean)
data class WsSeenPayload(val seenBy: String)
data class WsCallPayload(val targetUserId: String)

object WebSocketClient {
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()
        
    private var webSocket: WebSocket? = null
    private val gson = Gson()
    
    private val BASE_URL = AppConfig.WS_BASE
    
    private var currentToken: String? = null
    private var reconnectAttempts = 0
    private val maxReconnectAttempts = 10
    private val handler = android.os.Handler(android.os.Looper.getMainLooper())
    
    fun connect(token: String) {
        currentToken = token
        reconnectAttempts = 0
        doConnect(token)
    }
    
    private fun doConnect(token: String) {
        // Inject the JWT into the URL query for server-side handshake validation
        val url = "$BASE_URL/?token=$token"
        val request = Request.Builder().url(url).build()
        
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d("WebSocket", "Connected to server (JWT authenticated)")
                reconnectAttempts = 0
            }
            
            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d("WebSocket", "Received: $text")
                try {
                    val msg = gson.fromJson(text, WsMessage::class.java)
                    when (msg.type) {
                        "IDENTIFIED" -> {
                            ChatManager.myId = msg.userId
                            ChatManager.myName = msg.username
                        }
                        "PRESENCE_UPDATE" -> {
                            val usersStr = gson.toJson(msg.payload)
                            val users = gson.fromJson(usersStr, Array<WsPresenceUser>::class.java).toList()
                            ChatManager.syncPresence(users)
                        }
                        "RECEIVE_MESSAGE" -> {
                            val payloadStr = gson.toJson(msg.payload)
                            val payload = gson.fromJson(payloadStr, WsPrivatePayload::class.java)
                            ChatManager.receiveApiMessage(payload)
                        }
                        "MESSAGE_STATUS" -> {
                            val payloadStr = gson.toJson(msg.payload)
                            val payload = gson.fromJson(payloadStr, WsStatusPayload::class.java)
                            ChatManager.updateMessageStatus(payload.messageId, payload.status, payload.chatId)
                        }
                        "MESSAGES_SEEN" -> {
                            val payloadStr = gson.toJson(msg.payload)
                            val payload = gson.fromJson(payloadStr, WsSeenPayload::class.java)
                            ChatManager.markAllSeenFor(payload.seenBy)
                        }
                        "TYPING_INDICATOR" -> {
                            val payloadStr = gson.toJson(msg.payload)
                            val payload = gson.fromJson(payloadStr, WsTypingPayload::class.java)
                            ChatManager.setTyping(payload.senderId, payload.isTyping)
                        }
                        "CALL_ENDED" -> {
                            ChatManager.handleCallEnded()
                        }
                    }
                } catch (e: Exception) {
                    Log.e("WebSocket", "Parse error", e)
                }
            }
            
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d("WebSocket", "Closed: $reason")
            }
            
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("WebSocket", "Connection failure", t)
                scheduleReconnect()
            }
        })
    }
    
    private fun scheduleReconnect() {
        val token = currentToken ?: return
        if (reconnectAttempts >= maxReconnectAttempts) {
            Log.e("WebSocket", "Max reconnect attempts reached")
            return
        }
        val delayMs = (Math.pow(2.0, reconnectAttempts.toDouble()) * 1000).toLong().coerceAtMost(30000)
        reconnectAttempts++
        Log.d("WebSocket", "Reconnecting in ${delayMs}ms (attempt $reconnectAttempts)")
        handler.postDelayed({ doConnect(token) }, delayMs)
    }
    
    fun sendMessage(receiverId: String, text: String?, mediaUrl: String? = null) {
        if (ChatManager.myId == null) return
        
        val payload = mapOf(
            "senderId" to ChatManager.myId,
            "receiverId" to receiverId,
            "content" to (text ?: ""),
            "mediaUrl" to mediaUrl,
            "timestamp" to System.currentTimeMillis()
        )
        val msg = mapOf("type" to "PRIVATE_MESSAGE", "payload" to payload)
        webSocket?.send(gson.toJson(msg))
    }

    fun sendTyping(receiverId: String, isTyping: Boolean) {
        val payload = mapOf("receiverId" to receiverId, "isTyping" to isTyping)
        val msg = mapOf("type" to "TYPING", "payload" to payload)
        webSocket?.send(gson.toJson(msg))
    }

    fun sendEndCall(targetUserId: String) {
        val payload = mapOf("targetUserId" to targetUserId)
        val msg = mapOf("type" to "END_CALL", "payload" to payload)
        webSocket?.send(gson.toJson(msg))
    }

    fun sendMarkSeen(senderId: String) {
        val payload = mapOf("senderId" to senderId)
        val msg = mapOf("type" to "MARK_SEEN", "payload" to payload)
        webSocket?.send(gson.toJson(msg))
    }
}
