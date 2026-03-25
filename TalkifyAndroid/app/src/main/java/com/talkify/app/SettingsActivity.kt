package com.talkify.app

import android.content.Context
import android.os.Bundle
import android.widget.EditText
import android.widget.ImageButton
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.materialswitch.MaterialSwitch

class SettingsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val prefs = getSharedPreferences("talkify_settings", Context.MODE_PRIVATE)

        val editUsername = findViewById<EditText>(R.id.editUsername)
        val editStatus = findViewById<EditText>(R.id.editStatus)
        val switchTimestamps = findViewById<MaterialSwitch>(R.id.switchTimestamps)
        val switchEnterToSend = findViewById<MaterialSwitch>(R.id.switchEnterToSend)

        // Load existing
        editUsername.setText(prefs.getString("username", "You"))
        editStatus.setText(prefs.getString("statusMessage", ""))
        switchTimestamps.isChecked = prefs.getBoolean("showTimestamps", true)
        switchEnterToSend.isChecked = prefs.getBoolean("enterToSend", true)

        findViewById<ImageButton>(R.id.backButton).setOnClickListener {
            // Save on exit
            prefs.edit().apply {
                putString("username", editUsername.text.toString().trim().takeIf { it.isNotEmpty() } ?: "You")
                putString("statusMessage", editStatus.text.toString().trim())
                putBoolean("showTimestamps", switchTimestamps.isChecked)
                putBoolean("enterToSend", switchEnterToSend.isChecked)
            }.apply()
            
            finish()
        }
    }
}
