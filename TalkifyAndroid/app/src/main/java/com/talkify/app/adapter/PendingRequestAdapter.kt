package com.talkify.app.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.talkify.app.databinding.ItemUserSearchBinding

data class PendingRequest(
    val userId: String,
    val username: String,
    val avatarUrl: String?
)

class PendingRequestAdapter(
    private val onAcceptClick: (String) -> Unit,
    private val onDeclineClick: (String) -> Unit
) : ListAdapter<PendingRequest, PendingRequestAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemUserSearchBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding, onAcceptClick, onDeclineClick)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ViewHolder(
        private val binding: ItemUserSearchBinding,
        private val onAcceptClick: (String) -> Unit,
        private val onDeclineClick: (String) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {
        fun bind(request: PendingRequest) {
            binding.usernameText.text = request.username
            binding.avatarText.text = request.username.take(2).uppercase()
            
            binding.statusText.visibility = View.GONE
            
            binding.actionButton.visibility = View.VISIBLE
            binding.actionButton.text = "Accept"
            
            binding.declineButton.visibility = View.VISIBLE

            binding.actionButton.setOnClickListener {
                onAcceptClick(request.userId)
            }
            binding.declineButton.setOnClickListener {
                onDeclineClick(request.userId)
            }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<PendingRequest>() {
        override fun areItemsTheSame(oldItem: PendingRequest, newItem: PendingRequest) = oldItem.userId == newItem.userId
        override fun areContentsTheSame(oldItem: PendingRequest, newItem: PendingRequest) = oldItem == newItem
    }
}
