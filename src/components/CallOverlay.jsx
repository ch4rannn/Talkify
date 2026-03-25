import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export default function CallOverlay({ roomID, callType, onEndCall, username }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // ZegoCloud Keys
        const appID = 1208204400;
        const serverSecret = "5ab6cdbb741a8fc0411e33eb9b77e94a";

        // Generate a quick random ID for the local user connecting
        const userID = Math.floor(Math.random() * 100000).toString();
        const userName = username || "User_" + userID;

        // Generate Token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomID,
            userID,
            userName
        );

        // Initialize ZegoCloud element
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
            container: containerRef.current,
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-on-1 call mode
            },
            turnOnCameraWhenJoining: callType === 'video',
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: false,
            onLeaveRoom: () => {
                onEndCall();
            }
        });

        // Cleanup on unmount
        return () => {
            if (zp) {
                zp.destroy();
            }
        };
    }, [roomID, callType, onEndCall, username]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 99999,
                background: '#0D0D0D'
            }}
        >
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
