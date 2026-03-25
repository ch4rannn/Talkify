package com.talkify.app

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

class AuthActivity : AppCompatActivity() {

    private var isLogin = true
    private val client = OkHttpClient()
    private val gson = Gson()
    private val JSON = "application/json; charset=utf-8".toMediaType()
    private val URL = AppConfig.HTTP_BASE

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Block routing if session is alive
        val prefs = getSharedPreferences("talkify_prefs", Context.MODE_PRIVATE)
        if (prefs.contains("talkify_token")) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }
        
        setContentView(R.layout.activity_auth)

        val titleText = findViewById<TextView>(R.id.titleText)
        val subtitleText = findViewById<TextView>(R.id.subtitleText)
        val usernameInput = findViewById<EditText>(R.id.usernameInput)
        val passwordInput = findViewById<EditText>(R.id.passwordInput)
        val submitButton = findViewById<Button>(R.id.submitButton)
        val switchModeText = findViewById<TextView>(R.id.switchModeText)

        switchModeText.setOnClickListener {
            isLogin = !isLogin
            subtitleText.text = if (isLogin) "Sign in to your account" else "Create a new account"
            submitButton.text = if (isLogin) "Sign In" else "Sign Up"
            switchModeText.text = if (isLogin) "Don't have an account? Sign up" else "Already have an account? Log in"
        }

        submitButton.setOnClickListener {
            val username = usernameInput.text.toString().trim()
            val password = passwordInput.text.toString()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val endpoint = if (isLogin) "/api/auth/login" else "/api/auth/register"
            val json = gson.toJson(mapOf("username" to username, "password" to password))
            val body = json.toRequestBody(JSON)

            val request = Request.Builder()
                .url(URL + endpoint)
                .post(body)
                .build()

            submitButton.isEnabled = false
            submitButton.text = "Authenticating..."

            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread {
                        submitButton.isEnabled = true
                        submitButton.text = if (isLogin) "Sign In" else "Sign Up"
                        Toast.makeText(this@AuthActivity, "Network Error", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onResponse(call: Call, response: Response) {
                    val respBody = response.body?.string() ?: ""
                    runOnUiThread {
                        submitButton.isEnabled = true
                        submitButton.text = if (isLogin) "Sign In" else "Sign Up"
                        
                        if (!response.isSuccessful) {
                            Toast.makeText(this@AuthActivity, "Authentication Failed", Toast.LENGTH_SHORT).show()
                            return@runOnUiThread
                        }

                        try {
                            // Extract JWT token and user profile
                            val type = object : com.google.gson.reflect.TypeToken<Map<String, Any>>() {}.type
                            val data: Map<String, Any> = gson.fromJson(respBody, type)

                            val token = data["token"] as String
                            val userObj = data["user"] as Map<String, String>
                            
                            val id = userObj["id"] ?: ""
                            val uname = userObj["username"] ?: ""
                            val avatar = userObj["avatarUrl"] ?: ""

                            prefs.edit().apply {
                                putString("talkify_token", token)
                                putString("talkify_userId", id)
                                putString("talkify_username", uname)
                                putString("talkify_avatar", avatar)
                                apply()
                            }

                            startActivity(Intent(this@AuthActivity, MainActivity::class.java))
                            finish()
                        } catch (e: Exception) {
                            Toast.makeText(this@AuthActivity, "Data Parse Error", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            })
        }
    }
}
