package com.talkify.app

object AppConfig {
    // ── Change these for production deployment ──
    // For emulator:  "http://10.0.2.2:8080" / "ws://10.0.2.2:8080"
    // For real device on same WiFi: "http://192.168.x.x:8080"
    // For production: "https://your-domain.com" / "wss://your-domain.com"
    
    const val HTTP_BASE = "https://talkify-production-28d3.up.railway.app"
    const val WS_BASE   = "wss://talkify-production-28d3.up.railway.app"
}
