package com.talkify.app.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.talkify.app.R
import com.talkify.app.databinding.ItemMemberSelectBinding
import com.talkify.app.model.Contact

class MemberSelectAdapter :
    ListAdapter<Contact, MemberSelectAdapter.ViewHolder>(DiffCallback) {

    private val selectedIds = mutableSetOf<String>()

    fun getSelectedMembers(): List<String> = selectedIds.toList()

    inner class ViewHolder(private val binding: ItemMemberSelectBinding) :
        RecyclerView.ViewHolder(binding.root) {

        init {
            binding.root.setOnClickListener {
                if (adapterPosition != RecyclerView.NO_POSITION) {
                    val contact = getItem(adapterPosition)
                    if (selectedIds.contains(contact.id)) {
                        selectedIds.remove(contact.id)
                    } else {
                        selectedIds.add(contact.id)
                    }
                    notifyItemChanged(adapterPosition)
                }
            }
        }

        fun bind(contact: Contact) {
            binding.memberName.text = contact.name
            binding.memberAvatar.text = contact.initials
            
            if (selectedIds.contains(contact.id)) {
                binding.memberCheck.visibility = View.VISIBLE
                binding.memberCheck.setImageResource(android.R.drawable.ic_input_add)
                binding.memberCheck.setColorFilter(binding.root.context.getColor(R.color.accent))
                binding.root.setBackgroundColor(binding.root.context.getColor(R.color.surface_hover))
            } else {
                binding.memberCheck.visibility = View.GONE
                binding.root.setBackgroundColor(binding.root.context.getColor(android.R.color.transparent))
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemMemberSelectBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    companion object DiffCallback : DiffUtil.ItemCallback<Contact>() {
        override fun areItemsTheSame(oldItem: Contact, newItem: Contact) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Contact, newItem: Contact) = oldItem == newItem
    }
}
