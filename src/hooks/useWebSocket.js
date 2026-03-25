import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * useWebSocket — lightweight WebSocket wrapper.
 *
 * When no server is reachable, it falls back to a local echo-reply
 * mode so the UI is fully demoable without a backend.
 */
export default function useWebSocket(url) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [fallback, setFallback] = useState(false);
  const listenersRef = useRef([]);

  // ---- Simulated reply pool ---- //
  const replies = [
    "Got it! 👍",
    "That's interesting, tell me more.",
    "Sure thing!",
    "I totally agree with you.",
    "Haha, nice one 😄",
    "Let me think about that for a moment…",
    "Sounds good to me!",
    "Can you elaborate on that?",
    "Absolutely, no problem.",
    "Great point!",
    "I was just thinking the same thing.",
    "Thanks for sharing that!",
    "Let's do it! 🚀",
  ];

  useEffect(() => {
    if (!url) {
      setFallback(true);
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setFallback(true);
      };
      ws.onerror = () => {
        setFallback(true);
      };
      ws.onmessage = (event) => {
        listenersRef.current.forEach((fn) => fn(event.data));
      };

      return () => ws.close();
    } catch {
      setFallback(true);
    }
  }, [url]);

  const send = useCallback(
    (data) => {
      if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }

      // Fallback: simulate an echo reply after a short delay
      if (fallback) {
        const delay = 600 + Math.random() * 1200;
        const reply = replies[Math.floor(Math.random() * replies.length)];
        setTimeout(() => {
          listenersRef.current.forEach((fn) => fn(reply));
        }, delay);
      }
    },
    [connected, fallback],
  );

  const onMessage = useCallback((fn) => {
    listenersRef.current.push(fn);
    return () => {
      listenersRef.current = listenersRef.current.filter((f) => f !== fn);
    };
  }, []);

  return { send, onMessage, connected, fallback };
}
