package com.talkify.app.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.talkify.app.R
import com.talkify.app.databinding.ItemContactBinding
import com.talkify.app.model.ChatItem
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ContactAdapter(private val onClick: (String) -> Unit) :
    ListAdapter<ChatItem, ContactAdapter.ContactViewHolder>(DiffCallback) {

    inner class ContactViewHolder(private val binding: ItemContactBinding) :
        RecyclerView.ViewHolder(binding.root) {

        init {
            binding.root.setOnClickListener {
                if (adapterPosition != RecyclerView.NO_POSITION) {
                    onClick(getItem(adapterPosition).contact.id)
                }
            }
        }

        fun bind(item: ChatItem) {
            val contact = item.contact
            binding.contactName.text = contact.name
            binding.contactAvatar.text = contact.initials

            if (contact.isGroup) {
                binding.onlineDot.visibility = View.GONE
                binding.contactPreview.text = "${contact.members.size} members"
            } else {
                binding.onlineDot.visibility = if (contact.isOnline) View.VISIBLE else View.GONE
            }

            // Message preview & timestamp
            if (item.lastMessage != null) {
                if (!contact.isGroup) {
                    val prefix = if (item.lastMessage.isSent) "You: " else ""
                    binding.contactPreview.text = prefix + item.lastMessage.text
                } else {
                    binding.contactPreview.text = item.lastMessage.text
                }
                
                binding.contactTime.visibility = View.VISIBLE
                val df = SimpleDateFormat("hh:mm a", Locale.getDefault())
                binding.contactTime.text = df.format(Date(item.lastMessage.timestamp))
            } else {
                binding.contactTime.visibility = View.GONE
                if (!contact.isGroup) {
                    binding.contactPreview.text = "Tap to start chatting"
                }
            }

            // Unread badge
            if (item.unreadCount > 0) {
                binding.unreadBadge.visibility = View.VISIBLE
                binding.unreadBadge.text = item.unreadCount.toString()
            } else {
                binding.unreadBadge.visibility = View.GONE
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ContactViewHolder {
        val binding = ItemContactBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ContactViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ContactViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    companion object DiffCallback : DiffUtil.ItemCallback<ChatItem>() {
        override fun areItemsTheSame(oldItem: ChatItem, newItem: ChatItem) =
            oldItem.contact.id == newItem.contact.id

        override fun areContentsTheSame(oldItem: ChatItem, newItem: ChatItem) =
            oldItem == newItem
    }
}
