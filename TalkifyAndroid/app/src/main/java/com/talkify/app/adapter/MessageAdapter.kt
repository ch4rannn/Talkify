package com.talkify.app.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.talkify.app.databinding.ItemMessageReceivedBinding
import com.talkify.app.databinding.ItemMessageSentBinding
import com.talkify.app.model.ChatManager
import com.talkify.app.model.Message
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MessageAdapter(private val isGroupChat: Boolean) :
    ListAdapter<Message, RecyclerView.ViewHolder>(DiffCallback) {

    private val df = SimpleDateFormat("hh:mm a", Locale.getDefault())

    override fun getItemViewType(position: Int): Int {
        return if (getItem(position).isSent) 1 else 0
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == 1) {
            val binding = ItemMessageSentBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            SentViewHolder(binding)
        } else {
            val binding = ItemMessageReceivedBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            ReceivedViewHolder(binding)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val msg = getItem(position)
        if (holder is SentViewHolder) holder.bind(msg)
        else if (holder is ReceivedViewHolder) holder.bind(msg)
    }

    inner class SentViewHolder(private val binding: ItemMessageSentBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(message: Message) {
            binding.sentMessageText.text = message.text
            binding.sentTimestamp.text = df.format(Date(message.timestamp))
        }
    }

    inner class ReceivedViewHolder(private val binding: ItemMessageReceivedBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(message: Message) {
            binding.receivedMessageText.text = message.text
            binding.receivedTimestamp.text = df.format(Date(message.timestamp))
            
            if (isGroupChat && message.senderId != null) {
                binding.senderName.visibility = View.VISIBLE
                binding.senderName.text = ChatManager.getContactById(message.senderId)?.name ?: "Unknown"
            } else {
                binding.senderName.visibility = View.GONE
            }
        }
    }

    companion object DiffCallback : DiffUtil.ItemCallback<Message>() {
        override fun areItemsTheSame(oldItem: Message, newItem: Message) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Message, newItem: Message) = oldItem == newItem
    }
}
