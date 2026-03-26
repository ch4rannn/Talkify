package com.talkify.app

import android.content.Context
import android.os.Bundle
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.materialswitch.MaterialSwitch
import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

class SettingsActivity : AppCompatActivity() {

    private val client = OkHttpClient()
    private val gson = Gson()
    private val JSON = "application/json; charset=utf-8".toMediaType()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val prefs = getSharedPreferences("talkify_settings", Context.MODE_PRIVATE)
        val authPrefs = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)

        val editUsername = findViewById<EditText>(R.id.editUsername)
        val editStatus = findViewById<EditText>(R.id.editStatus)
        val switchTimestamps = findViewById<MaterialSwitch>(R.id.switchTimestamps)
        val switchEnterToSend = findViewById<MaterialSwitch>(R.id.switchEnterToSend)

        val savedSettingsUser = prefs.getString("username", "")
        val actualUser = authPrefs.getString("talkify_username", "You")
        val displayUser = if (!savedSettingsUser.isNullOrEmpty()) savedSettingsUser else actualUser

        // Load existing
        editUsername.setText(displayUser)
        editStatus.setText(prefs.getString("statusMessage", ""))
        switchTimestamps.isChecked = prefs.getBoolean("showTimestamps", true)
        switchEnterToSend.isChecked = prefs.getBoolean("enterToSend", true)

        findViewById<com.google.android.material.button.MaterialButton>(R.id.logoutButton).setOnClickListener {
            // Clear auth preferences
            val prefsAuth = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)
            prefsAuth.edit().clear().apply()

            Toast.makeText(this, "Logged out", Toast.LENGTH_SHORT).show()

            // Navigate back to AuthActivity and clear task
            val intent = android.content.Intent(this, AuthActivity::class.java).apply {
                flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK
            }
            startActivity(intent)
            finish()
        }

        findViewById<ImageButton>(R.id.backButton).setOnClickListener {
            val newName = editUsername.text.toString().trim().takeIf { it.isNotEmpty() } ?: "You"
            val newStatus = editStatus.text.toString().trim()
            val showTime = switchTimestamps.isChecked
            val enterSend = switchEnterToSend.isChecked

            // Save on exit
            prefs.edit().apply {
                putString("username", newName)
                putString("statusMessage", newStatus)
                putBoolean("showTimestamps", showTime)
                putBoolean("enterToSend", enterSend)
            }.apply()
            
            // Sync with backend
            val authPrefs = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)
            val token = authPrefs.getString("talkify_token", "") ?: ""
            if (token.isNotEmpty()) {
                val json = gson.toJson(mapOf("username" to newName, "avatarUrl" to ""))
                val body = json.toRequestBody(JSON)
                val request = Request.Builder()
                    .url(AppConfig.HTTP_BASE + "/api/settings/profile")
                    .addHeader("Authorization", "Bearer $token")
                    .post(body)
                    .build()
                    
                client.newCall(request).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        runOnUiThread { Toast.makeText(this@SettingsActivity, "Failed to save profile", Toast.LENGTH_SHORT).show() }
                    }
                    override fun onResponse(call: Call, response: Response) {
                        val respStr = response.body?.string()
                        if (!response.isSuccessful) {
                            runOnUiThread { Toast.makeText(this@SettingsActivity, "Error saving profile", Toast.LENGTH_SHORT).show() }
                        }
                    }
                })
            }
            
            finish()
        }
    }
}
