package com.talkify.app

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.talkify.app.adapter.ContactAdapter
import com.talkify.app.databinding.ActivityMainBinding
import com.talkify.app.model.ChatManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var adapter: ContactAdapter
    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        adapter = ContactAdapter { chatId ->
            val intent = Intent(this, ChatActivity::class.java).apply {
                putExtra("CHAT_ID", chatId)
            }
            startActivity(intent)
        }

        binding.contactsRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.contactsRecyclerView.adapter = adapter

        binding.newGroupButton.setOnClickListener {
            startActivity(Intent(this, NewGroupActivity::class.java))
        }

        binding.settingsButton.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        // Read JWT from SharedPreferences (stored by AuthActivity)
        val prefs = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("talkify_token", null)
        
        if (token != null) {
            com.talkify.app.network.WebSocketClient.connect(token)
            fetchFriendRequestCount(token)
        }

        val username = prefs.getString("talkify_username", "You") ?: "You"
        binding.avatarText.text = username.take(1).uppercase()

        binding.requestsButton.setOnClickListener {
            startActivity(Intent(this, AddFriendActivity::class.java))
        }

        ChatManager.addListener(::updateList)
        updateList()
    }

    override fun onDestroy() {
        super.onDestroy()
        ChatManager.removeListener(::updateList)
    }

    private fun updateList() {
        runOnUiThread {
            // Combine both groups and contacts, sort by latest message timestamp
            val allChats = ChatManager.getContactList() + ChatManager.getGroupList()
            adapter.submitList(allChats.sortedByDescending { it.lastMessage?.timestamp ?: 0L })
        }
    }

    private fun fetchFriendRequestCount(token: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val request = Request.Builder()
                    .url(AppConfig.HTTP_BASE + "/api/users/friend-requests")
                    .addHeader("Authorization", "Bearer $token")
                    .get()
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val responseData = response.body?.string()
                        if (responseData != null) {
                            val array = JSONArray(responseData)
                            var pendingCount = 0
                            for (i in 0 until array.length()) {
                                val req = array.getJSONObject(i)
                                if (req.getString("status") == "pending") {
                                    pendingCount++
                                }
                            }
                            runOnUiThread {
                                if (pendingCount > 0) {
                                    binding.requestsBadge.text = pendingCount.toString()
                                    binding.requestsBadge.visibility = android.view.View.VISIBLE
                                } else {
                                    binding.requestsBadge.visibility = android.view.View.GONE
                                }
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
