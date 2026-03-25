package com.talkify.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.zegocloud.uikit.prebuilt.call.ZegoUIKitPrebuiltCallConfig
import com.zegocloud.uikit.prebuilt.call.ZegoUIKitPrebuiltCallFragment

class CallActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_call)

        // ZegoCloud Credentials
        val appID: Long = 1208204400
        val appSign = "5ab6cdbb741a8fc0411e33eb9b77e94a"

        val roomID = intent.getStringExtra("roomID") ?: return
        val isVideoCall = intent.getBooleanExtra("isVideoCall", false)
        val userID = intent.getStringExtra("userID") ?: "User_${System.currentTimeMillis() % 1000}"
        val userName = intent.getStringExtra("userName") ?: userID

        // Configure Call Mode
        val config = if (isVideoCall) {
            ZegoUIKitPrebuiltCallConfig.oneOnOneVideoCall()
        } else {
            ZegoUIKitPrebuiltCallConfig.oneOnOneVoiceCall()
        }

        // Generate Zego Fragment
        val fragment = ZegoUIKitPrebuiltCallFragment.newInstance(
            appID, appSign, userID, userName, roomID, config
        )

        // Inject Fragment into layout
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commitNow()
    }
}
