package com.talkify.app

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.talkify.app.adapter.MessageAdapter
import com.talkify.app.databinding.ActivityChatBinding
import com.talkify.app.model.ChatManager

class ChatActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChatBinding
    private lateinit var adapter: MessageAdapter
    private var chatId: String? = null
    private val typingHandler = Handler(Looper.getMainLooper())
    private var typingRunnable: Runnable? = null

    private val chatListener = {
        updateMessages()
        updateTypingStatus()
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
        adapter = MessageAdapter(chatId, contact.isGroup)
        val layoutManager = LinearLayoutManager(this).apply { stackFromEnd = true }
        binding.messagesRecyclerView.layoutManager = layoutManager
        binding.messagesRecyclerView.adapter = adapter

        // Setup Listeners
        binding.backButton.setOnClickListener { finish() }

        binding.attachButton.setOnClickListener {
            pickMediaLauncher.launch("image/*")
        }

        binding.sendButton.setOnClickListener {
            val text = binding.messageInput.text.toString().trim()
            if (text.isNotEmpty()) {
                ChatManager.sendMessage(contact.id, text)
                binding.messageInput.text.clear()
                // Stop typing emission
                chatId?.let { ChatManager.sendTyping(it, false) }
            }
        }

        // Typing indicator emission on text changes
        binding.messageInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                chatId?.let { id ->
                    ChatManager.sendTyping(id, true)
                    typingRunnable?.let { typingHandler.removeCallbacks(it) }
                    typingRunnable = Runnable { ChatManager.sendTyping(id, false) }
                    typingHandler.postDelayed(typingRunnable!!, 1500)
                }
            }
            override fun afterTextChanged(s: Editable?) {}
        })

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
        val prefs = getSharedPreferences("talkify_prefs", android.content.Context.MODE_PRIVATE)
        val userId = prefs.getString("talkify_userId", "User_${System.currentTimeMillis() % 10000}") ?: "User_${System.currentTimeMillis() % 10000}"
        val userName = prefs.getString("talkify_username", "You") ?: "You"
        val intent = android.content.Intent(this, CallActivity::class.java).apply {
            putExtra("roomID", "talkify_room_$contactId")
            putExtra("isVideoCall", isVideoCall)
            putExtra("targetUserId", contactId)
            putExtra("userID", userId)
            putExtra("userName", userName)
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

    private fun updateTypingStatus() {
        runOnUiThread {
            chatId?.let { id ->
                val isTyping = ChatManager.isTyping(id)
                val contact = ChatManager.getContactById(id)
                binding.chatStatus.text = when {
                    isTyping -> "typing..."
                    contact?.isGroup == true -> "${contact.members.size} members"
                    contact?.isOnline == true -> "Online"
                    else -> contact?.lastSeen ?: "Offline"
                }
            }
        }
    }

    private val pickMedia = androidx.activity.result.contract.ActivityResultContracts.GetContent()
    private val pickMediaLauncher = registerForActivityResult(pickMedia) { uri ->
        if (uri != null) {
            uploadImage(uri)
        }
    }

    private fun uploadImage(uri: android.net.Uri) {
        binding.chatStatus.text = "Uploading Image..."
        Thread {
            try {
                val inputStream = contentResolver.openInputStream(uri)
                val file = java.io.File(cacheDir, "upload_${System.currentTimeMillis()}.jpg")
                val outputStream = java.io.FileOutputStream(file)
                inputStream?.copyTo(outputStream)
                inputStream?.close()
                outputStream.close()

                val requestBody = okhttp3.MultipartBody.Builder()
                    .setType(okhttp3.MultipartBody.FORM)
                    .addFormDataPart("media", file.name, okhttp3.RequestBody.Companion.asRequestBody(file, okhttp3.MediaType.Companion.toMediaTypeOrNull("image/jpeg")))
                    .build()

                val request = okhttp3.Request.Builder()
                    .url(com.talkify.app.AppConfig.HTTP_BASE + "/api/upload")
                    .post(requestBody)
                    .build()

                val response = okhttp3.OkHttpClient().newCall(request).execute()
                if (response.isSuccessful) {
                    val respString = response.body?.string()
                    val json = org.json.JSONObject(respString ?: "{}")
                    if (json.has("url")) {
                        val mediaUrl = json.getString("url")
                        runOnUiThread {
                            chatId?.let { ChatManager.sendMessage(it, null, mediaUrl) }
                            updateTypingStatus() // Reset status
                        }
                    }
                } else {
                    runOnUiThread {
                        android.widget.Toast.makeText(this@ChatActivity, "Upload Failed", android.widget.Toast.LENGTH_SHORT).show()
                        updateTypingStatus()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread { updateTypingStatus() }
            }
        }.start()
    }
}
