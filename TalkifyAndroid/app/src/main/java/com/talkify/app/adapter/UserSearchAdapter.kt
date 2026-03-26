package com.talkify.app.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.talkify.app.databinding.ItemUserSearchBinding

data class SearchUser(
    val id: String,
    val username: String,
    val contactStatus: String?,
    val isSender: Boolean
)

class UserSearchAdapter(private val onAddClick: (String) -> Unit) :
    ListAdapter<SearchUser, UserSearchAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemUserSearchBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding, onAddClick)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ViewHolder(private val binding: ItemUserSearchBinding, private val onAddClick: (String) -> Unit) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(user: SearchUser) {
            binding.usernameText.text = user.username
            binding.avatarText.text = user.username.take(2).uppercase()

            if (user.contactStatus == "ACCEPTED") {
                binding.statusText.visibility = View.VISIBLE
                binding.statusText.text = "Friends ✓"
                binding.actionButton.visibility = View.GONE
                binding.declineButton.visibility = View.GONE
            } else if (user.contactStatus == "PENDING") {
                binding.statusText.visibility = View.VISIBLE
                binding.statusText.text = if (user.isSender) "Requested" else "Respond ↓"
                binding.actionButton.visibility = View.GONE
                binding.declineButton.visibility = View.GONE
            } else {
                binding.statusText.visibility = View.GONE
                binding.actionButton.visibility = View.VISIBLE
                binding.declineButton.visibility = View.GONE
                binding.actionButton.text = "+ Add"
                binding.actionButton.setOnClickListener {
                    binding.actionButton.isEnabled = false
                    binding.actionButton.text = "Sent"
                    onAddClick(user.id)
                }
            }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<SearchUser>() {
        override fun areItemsTheSame(oldItem: SearchUser, newItem: SearchUser) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: SearchUser, newItem: SearchUser) = oldItem == newItem
    }
}
