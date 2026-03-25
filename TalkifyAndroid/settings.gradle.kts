pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://storage.zego.im/maven") }
        maven { url = uri("https://jitpack.io") }
    }
}

rootProject.name = "Talkify"
include(":app")
