package com.talkify.app

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.talkify.app.adapter.MemberSelectAdapter
import com.talkify.app.databinding.ActivityNewGroupBinding
import com.talkify.app.model.ChatManager

class NewGroupActivity : AppCompatActivity() {
    private lateinit var binding: ActivityNewGroupBinding
    private lateinit var adapter: MemberSelectAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNewGroupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.backButton.setOnClickListener { finish() }

        adapter = MemberSelectAdapter()
        binding.membersRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.membersRecyclerView.adapter = adapter

        adapter.submitList(ChatManager.contacts)

        binding.createGroupButton.setOnClickListener {
            val name = binding.groupNameInput.text.toString().trim()
            val members = adapter.getSelectedMembers()

            if (name.isEmpty()) {
                Toast.makeText(this, "Enter group name", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (members.isEmpty()) {
                Toast.makeText(this, "Select at least 1 member", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            ChatManager.createGroup(name, members)
            finish()
        }
    }
}
