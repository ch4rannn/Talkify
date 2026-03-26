package com.talkify.app

import android.content.Context
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.talkify.app.adapter.PendingRequest
import com.talkify.app.adapter.PendingRequestAdapter
import com.talkify.app.adapter.SearchUser
import com.talkify.app.adapter.UserSearchAdapter
import com.talkify.app.databinding.ActivityAddFriendBinding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class AddFriendActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddFriendBinding
    private lateinit var searchAdapter: UserSearchAdapter
    private lateinit var pendingAdapter: PendingRequestAdapter
    private val client = OkHttpClient()
    private var token: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddFriendBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val prefs = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)
        token = prefs.getString("talkify_token", "") ?: ""

        setupRecyclerViews()

        binding.backButton.setOnClickListener { finish() }

        binding.searchInput.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val query = s?.toString()?.trim() ?: ""
                if (query.isNotEmpty()) {
                    performSearch(query)
                } else {
                    binding.searchResultsSection.visibility = View.GONE
                    searchAdapter.submitList(emptyList())
                }
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        loadPendingRequests()
    }

    private fun setupRecyclerViews() {
        searchAdapter = UserSearchAdapter { userId ->
            sendFriendRequest(userId)
        }
        binding.searchResultsRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.searchResultsRecyclerView.adapter = searchAdapter

        pendingAdapter = PendingRequestAdapter(
            onAcceptClick = { userId -> acceptRequest(userId) },
            onDeclineClick = { userId -> declineRequest(userId) }
        )
        binding.pendingRequestsRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.pendingRequestsRecyclerView.adapter = pendingAdapter
    }

    private fun performSearch(query: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val request = Request.Builder()
                    .url(AppConfig.HTTP_BASE + "/api/contacts/search?q=$query")
                    .addHeader("Authorization", "Bearer $token")
                    .get()
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val responseData = response.body?.string()
                        if (responseData != null) {
                            val array = JSONArray(responseData)
                            val results = mutableListOf<SearchUser>()
                            for (i in 0 until array.length()) {
                                val obj = array.getJSONObject(i)
                                results.add(
                                    SearchUser(
                                        id = obj.getString("id"),
                                        username = obj.getString("username"),
                                        contactStatus = if (obj.has("contactStatus") && !obj.isNull("contactStatus")) obj.getString("contactStatus") else null,
                                        isSender = if (obj.has("isSender")) obj.getBoolean("isSender") else false
                                    )
                                )
                            }
                            runOnUiThread {
                                binding.searchResultsSection.visibility = View.VISIBLE
                                searchAdapter.submitList(results)
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun loadPendingRequests() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val request = Request.Builder()
                    .url(AppConfig.HTTP_BASE + "/api/contacts/pending")
                    .addHeader("Authorization", "Bearer $token")
                    .get()
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val responseData = response.body?.string()
                        if (responseData != null) {
                            val array = JSONArray(responseData)
                            val requests = mutableListOf<PendingRequest>()
                            for (i in 0 until array.length()) {
                                val obj = array.getJSONObject(i)
                                requests.add(
                                    PendingRequest(
                                        userId = obj.getString("userId"),
                                        username = obj.getString("username"),
                                        avatarUrl = if (obj.has("avatarUrl") && !obj.isNull("avatarUrl")) obj.getString("avatarUrl") else null
                                    )
                                )
                            }
                            runOnUiThread {
                                if (requests.isEmpty()) {
                                    binding.emptyPendingText.visibility = View.VISIBLE
                                    binding.pendingTitle.text = "Pending Requests"
                                } else {
                                    binding.emptyPendingText.visibility = View.GONE
                                    binding.pendingTitle.text = "Pending Requests  ${requests.size}"
                                }
                                pendingAdapter.submitList(requests)
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun sendFriendRequest(userId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply { put("userId", userId) }
                val body = json.toString().toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url(AppConfig.HTTP_BASE + "/api/contacts/request")
                    .addHeader("Authorization", "Bearer $token")
                    .post(body)
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        runOnUiThread {
                            // Optionally toast or let adapter handle UI state
                            Toast.makeText(this@AddFriendActivity, "Request Sent!", Toast.LENGTH_SHORT).show()
                            // Refresh search to show new state
                            val query = binding.searchInput.text.toString()
                            if (query.isNotEmpty()) performSearch(query)
                        }
                    }
                }
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }

    private fun acceptRequest(userId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply { put("userId", userId) }
                val body = json.toString().toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url(AppConfig.HTTP_BASE + "/api/contacts/accept")
                    .addHeader("Authorization", "Bearer $token")
                    .post(body)
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        runOnUiThread {
                            Toast.makeText(this@AddFriendActivity, "Friend Added!", Toast.LENGTH_SHORT).show()
                            loadPendingRequests()
                        }
                    }
                }
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }

    private fun declineRequest(userId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val json = JSONObject().apply { put("userId", userId) }
                val body = json.toString().toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url(AppConfig.HTTP_BASE + "/api/contacts/decline")
                    .addHeader("Authorization", "Bearer $token")
                    .post(body)
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        runOnUiThread {
                            loadPendingRequests()
                        }
                    }
                }
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }
}
