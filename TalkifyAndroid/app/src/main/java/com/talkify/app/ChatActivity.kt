package com.talkify.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.talkify.app.adapter.MessageAdapter
import com.talkify.app.databinding.ActivityChatBinding
import com.talkify.app.model.ChatManager

class ChatActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChatBinding
    private lateinit var adapter: MessageAdapter
    private var chatId: String? = null

    private val chatListener = {
        updateMessages()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        chatId = intent.getStringExtra("CHAT_ID")
        val contact = chatId?.let { ChatManager.getContactById(it) }

        if (contact == null) {
            finish()
            return
        }

        ChatManager.activeChatId = chatId
        ChatManager.markAsRead(contact.id)

        // Setup Header
        binding.chatName.text = contact.name
        binding.chatAvatar.text = contact.initials
        binding.chatStatus.text = if (contact.isGroup) "${contact.members.size} members" else if (contact.isOnline) "Online" else contact.lastSeen

        if (contact.isGroup) {
            binding.chatAvatar.setBackgroundResource(R.drawable.bg_bubble_received)
        }

        // Setup List
        adapter = MessageAdapter(contact.isGroup)
        val layoutManager = LinearLayoutManager(this).apply { stackFromEnd = true }
        binding.messagesRecyclerView.layoutManager = layoutManager
        binding.messagesRecyclerView.adapter = adapter

        // Setup Listeners
        binding.backButton.setOnClickListener { finish() }

        binding.sendButton.setOnClickListener {
            val text = binding.messageInput.text.toString().trim()
            if (text.isNotEmpty()) {
                ChatManager.sendMessage(contact.id, text)
                binding.messageInput.text.clear()
            }
        }

        binding.audioCallButton.setOnClickListener {
            startCallActivity(contact.id, false)
        }

        binding.videoCallButton.setOnClickListener {
            startCallActivity(contact.id, true)
        }

        ChatManager.addListener(chatListener)
        updateMessages()
    }

    private fun startCallActivity(contactId: String, isVideoCall: Boolean) {
        val intent = android.content.Intent(this, CallActivity::class.java).apply {
            putExtra("roomID", "talkify_room_$contactId")
            putExtra("isVideoCall", isVideoCall)
            putExtra("userID", "Android_${System.currentTimeMillis() % 10000}")
            putExtra("userName", "Phone User")
        }
        startActivity(intent)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (ChatManager.activeChatId == chatId) {
            ChatManager.activeChatId = null
        }
        ChatManager.removeListener(chatListener)
    }

    private fun updateMessages() {
        chatId?.let {
            val msgs = ChatManager.getMessages(it)
            adapter.submitList(msgs.toList()) {
                if (msgs.isNotEmpty()) {
                    binding.messagesRecyclerView.scrollToPosition(msgs.size - 1)
                }
            }
        }
    }
}
