package com.talkify.app

import android.content.Context
import android.os.Bundle
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import coil.load
import coil.transform.CircleCropTransformation
import com.google.android.material.button.MaterialButton
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.materialswitch.MaterialSwitch
import com.google.gson.Gson
import com.talkify.app.model.ChatManager
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.IOException

class SettingsActivity : AppCompatActivity() {

    private val client = OkHttpClient()
    private val gson = Gson()
    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    private lateinit var avatarImage: ImageView
    private var currentAvatarUrl: String? = null

    // Image picker launcher
    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            uploadAvatar(uri)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val prefs = getSharedPreferences("talkify_settings", Context.MODE_PRIVATE)
        val authPrefs = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)

        // ── View References ──
        val editUsername = findViewById<EditText>(R.id.editUsername)
        val editStatus = findViewById<EditText>(R.id.editStatus)
        val switchTimestamps = findViewById<MaterialSwitch>(R.id.switchTimestamps)
        val switchEnterToSend = findViewById<MaterialSwitch>(R.id.switchEnterToSend)
        val switchAutoScroll = findViewById<MaterialSwitch>(R.id.switchAutoScroll)
        val switchDarkMode = findViewById<MaterialSwitch>(R.id.switchDarkMode)
        val switchNotifications = findViewById<MaterialSwitch>(R.id.switchNotifications)
        val switchMessageSound = findViewById<MaterialSwitch>(R.id.switchMessageSound)
        avatarImage = findViewById(R.id.avatarImage)

        // ── Load Saved State ──
        val savedSettingsUser = prefs.getString("username", "")
        val actualUser = authPrefs.getString("talkify_username", "You")
        val displayUser = if (!savedSettingsUser.isNullOrEmpty()) savedSettingsUser else actualUser

        editUsername.setText(displayUser)
        editStatus.setText(prefs.getString("statusMessage", ""))
        switchTimestamps.isChecked = prefs.getBoolean("showTimestamps", true)
        switchEnterToSend.isChecked = prefs.getBoolean("enterToSend", true)
        switchAutoScroll.isChecked = prefs.getBoolean("autoScroll", true)
        switchNotifications.isChecked = prefs.getBoolean("notificationsEnabled", true)
        switchMessageSound.isChecked = prefs.getBoolean("messageSound", true)

        // Dark mode: check current night mode
        val isDarkMode = prefs.getBoolean("darkMode", true) // default dark
        switchDarkMode.isChecked = isDarkMode

        // ── Avatar: Load existing ──
        currentAvatarUrl = authPrefs.getString("talkify_avatar", null)
        loadAvatarImage()

        // ── Avatar Click: Open gallery ──
        findViewById<ImageButton>(R.id.editAvatarButton).setOnClickListener {
            pickImageLauncher.launch("image/*")
        }
        avatarImage.setOnClickListener {
            pickImageLauncher.launch("image/*")
        }

        // ── Dark Mode Toggle: Instant ──
        switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean("darkMode", isChecked).apply()
            AppCompatDelegate.setDefaultNightMode(
                if (isChecked) AppCompatDelegate.MODE_NIGHT_YES
                else AppCompatDelegate.MODE_NIGHT_NO
            )
        }

        // ── Clear All Chat History ──
        findViewById<MaterialButton>(R.id.clearHistoryButton).setOnClickListener {
            MaterialAlertDialogBuilder(this)
                .setTitle("Clear Chat History")
                .setMessage("This will clear all local chat history. This cannot be undone.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Clear") { _, _ ->
                    ChatManager.clearAllMessages()
                    Toast.makeText(this, "Chat history cleared", Toast.LENGTH_SHORT).show()
                }
                .show()
        }

        // ── Log Out ──
        findViewById<MaterialButton>(R.id.logoutButton).setOnClickListener {
            MaterialAlertDialogBuilder(this)
                .setTitle("Log Out")
                .setMessage("Are you sure you want to log out?")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Log Out") { _, _ ->
                    authPrefs.edit().clear().apply()
                    Toast.makeText(this, "Logged out", Toast.LENGTH_SHORT).show()
                    val intent = android.content.Intent(this, AuthActivity::class.java).apply {
                        flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK
                    }
                    startActivity(intent)
                    finish()
                }
                .show()
        }

        // ── Back Button → Save All ──
        findViewById<ImageButton>(R.id.backButton).setOnClickListener {
            saveAndExit(prefs, authPrefs, editUsername, editStatus,
                switchTimestamps, switchEnterToSend, switchAutoScroll,
                switchNotifications, switchMessageSound, switchDarkMode)
        }
    }

    @Deprecated("Use onBackPressedDispatcher")
    override fun onBackPressed() {
        val prefs = getSharedPreferences("talkify_settings", Context.MODE_PRIVATE)
        val authPrefs = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)
        saveAndExit(
            prefs, authPrefs,
            findViewById(R.id.editUsername), findViewById(R.id.editStatus),
            findViewById(R.id.switchTimestamps), findViewById(R.id.switchEnterToSend),
            findViewById(R.id.switchAutoScroll), findViewById(R.id.switchNotifications),
            findViewById(R.id.switchMessageSound), findViewById(R.id.switchDarkMode)
        )
    }

    private fun saveAndExit(
        prefs: android.content.SharedPreferences,
        authPrefs: android.content.SharedPreferences,
        editUsername: EditText, editStatus: EditText,
        switchTimestamps: MaterialSwitch, switchEnterToSend: MaterialSwitch,
        switchAutoScroll: MaterialSwitch, switchNotifications: MaterialSwitch,
        switchMessageSound: MaterialSwitch, switchDarkMode: MaterialSwitch
    ) {
        val newName = editUsername.text.toString().trim().takeIf { it.isNotEmpty() } ?: "You"
        val newStatus = editStatus.text.toString().trim()

        // Save all settings locally
        prefs.edit().apply {
            putString("username", newName)
            putString("statusMessage", newStatus)
            putBoolean("showTimestamps", switchTimestamps.isChecked)
            putBoolean("enterToSend", switchEnterToSend.isChecked)
            putBoolean("autoScroll", switchAutoScroll.isChecked)
            putBoolean("notificationsEnabled", switchNotifications.isChecked)
            putBoolean("messageSound", switchMessageSound.isChecked)
            putBoolean("darkMode", switchDarkMode.isChecked)
        }.apply()

        // Sync profile with backend (preserve avatar URL!)
        val token = authPrefs.getString("talkify_token", "") ?: ""
        if (token.isNotEmpty()) {
            val avatarUrl = currentAvatarUrl ?: authPrefs.getString("talkify_avatar", "") ?: ""
            val json = gson.toJson(mapOf("username" to newName, "avatarUrl" to avatarUrl))
            val body = json.toRequestBody(JSON_MEDIA)
            val request = Request.Builder()
                .url(AppConfig.HTTP_BASE + "/api/settings/profile")
                .addHeader("Authorization", "Bearer $token")
                .post(body)
                .build()

            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    // Silent fail on exit
                }
                override fun onResponse(call: Call, response: Response) {
                    response.body?.close()
                }
            })
        }

        finish()
    }

    private fun loadAvatarImage() {
        if (!currentAvatarUrl.isNullOrEmpty()) {
            val fullUrl = if (currentAvatarUrl!!.startsWith("http")) currentAvatarUrl
                          else AppConfig.HTTP_BASE + currentAvatarUrl
            avatarImage.load(fullUrl) {
                crossfade(true)
                transformations(CircleCropTransformation())
                error(android.R.drawable.ic_menu_gallery)
            }
        } else {
            avatarImage.setImageResource(android.R.drawable.ic_menu_gallery)
        }
    }

    private fun uploadAvatar(uri: android.net.Uri) {
        Toast.makeText(this, "Uploading avatar...", Toast.LENGTH_SHORT).show()
        Thread {
            try {
                val inputStream = contentResolver.openInputStream(uri)
                val file = File(cacheDir, "avatar_${System.currentTimeMillis()}.jpg")
                val outputStream = java.io.FileOutputStream(file)
                inputStream?.copyTo(outputStream)
                inputStream?.close()
                outputStream.close()

                val requestBody = MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("media", file.name, file.asRequestBody("image/jpeg".toMediaTypeOrNull()))
                    .build()

                val authPrefs = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)
                val token = authPrefs.getString("talkify_token", "") ?: ""

                val request = Request.Builder()
                    .url(AppConfig.HTTP_BASE + "/api/upload")
                    .addHeader("Authorization", "Bearer $token")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val respString = response.body?.string()
                    val json = org.json.JSONObject(respString ?: "{}")
                    if (json.has("url")) {
                        val mediaUrl = json.getString("url")
                        currentAvatarUrl = mediaUrl
                        authPrefs.edit().putString("talkify_avatar", mediaUrl).apply()

                        // Sync with backend profile
                        val settingsPrefs = getSharedPreferences("talkify_settings", Context.MODE_PRIVATE)
                        val username = settingsPrefs.getString("username", "") ?: ""
                        val profileJson = gson.toJson(mapOf("username" to username, "avatarUrl" to mediaUrl))
                        val profileBody = profileJson.toRequestBody(JSON_MEDIA)
                        val profileRequest = Request.Builder()
                            .url(AppConfig.HTTP_BASE + "/api/settings/profile")
                            .addHeader("Authorization", "Bearer $token")
                            .post(profileBody)
                            .build()
                        client.newCall(profileRequest).execute().body?.close()

                        runOnUiThread {
                            loadAvatarImage()
                            Toast.makeText(this, "Avatar updated!", Toast.LENGTH_SHORT).show()
                        }
                    }
                } else {
                    runOnUiThread {
                        Toast.makeText(this, "Upload failed", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    Toast.makeText(this, "Error uploading avatar", Toast.LENGTH_SHORT).show()
                }
            }
        }.start()
    }
}
