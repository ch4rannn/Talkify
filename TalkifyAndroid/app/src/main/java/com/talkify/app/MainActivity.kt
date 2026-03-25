package com.talkify.app

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.talkify.app.adapter.ContactAdapter
import com.talkify.app.databinding.ActivityMainBinding
import com.talkify.app.model.ChatManager

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var adapter: ContactAdapter

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
}
