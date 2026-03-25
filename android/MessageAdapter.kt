package com.talkify.app.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.talkify.app.R
import com.talkify.app.model.Message
import java.text.SimpleDateFormat
import java.util.*

/**
 * Talkify — RecyclerView adapter for chat messages.
 *
 * Uses two ViewHolder types:
 *   TYPE_SENT     → item_message_sent.xml   (green accent, right-aligned)
 *   TYPE_RECEIVED → item_message_received.xml (dark surface, left-aligned)
 */
class MessageAdapter : ListAdapter<Message, RecyclerView.ViewHolder>(MessageDiffCallback()) {

    companion object {
        private const val TYPE_SENT = 0
        private const val TYPE_RECEIVED = 1
    }

    // ── Data model ──────────────────────────────────────────────
    data class Message(
        val id: String,
        val text: String,
        val timestamp: Long,
        val isSent: Boolean
    )

    // ── Diff callback for efficient list updates ────────────────
    class MessageDiffCallback : DiffUtil.ItemCallback<Message>() {
        override fun areItemsTheSame(old: Message, new: Message) = old.id == new.id
        override fun areContentsTheSame(old: Message, new: Message) = old == new
    }

    // ── ViewHolder: Sent ────────────────────────────────────────
    inner class SentViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val textView: TextView = view.findViewById(R.id.sentMessageText)
        private val timeView: TextView = view.findViewById(R.id.sentTimestamp)

        fun bind(msg: Message) {
            textView.text = msg.text
            timeView.text = formatTime(msg.timestamp)
        }
    }

    // ── ViewHolder: Received ────────────────────────────────────
    inner class ReceivedViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val textView: TextView = view.findViewById(R.id.receivedMessageText)
        private val timeView: TextView = view.findViewById(R.id.receivedTimestamp)

        fun bind(msg: Message) {
            textView.text = msg.text
            timeView.text = formatTime(msg.timestamp)
        }
    }

    // ── Adapter overrides ───────────────────────────────────────

    override fun getItemViewType(position: Int): Int {
        return if (getItem(position).isSent) TYPE_SENT else TYPE_RECEIVED
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return if (viewType == TYPE_SENT) {
            SentViewHolder(inflater.inflate(R.layout.item_message_sent, parent, false))
        } else {
            ReceivedViewHolder(inflater.inflate(R.layout.item_message_received, parent, false))
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val msg = getItem(position)
        when (holder) {
            is SentViewHolder -> holder.bind(msg)
            is ReceivedViewHolder -> holder.bind(msg)
        }
    }

    // ── Helpers ─────────────────────────────────────────────────
    private val timeFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())

    private fun formatTime(timestamp: Long): String {
        return timeFormat.format(Date(timestamp))
    }
}
