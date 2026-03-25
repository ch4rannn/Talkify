import { useEffect, useRef, useCallback, useState } from 'react';

export default function useWebSocket(baseUrl, token) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef([]);

  useEffect(() => {
    if (!token) return;

    let ws;
    let reconnectTimer;
    const url = `${baseUrl}?token=${token}`;

    const connect = () => {
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('[WebSocket] Connected securely');
      };
      
      ws.onclose = () => {
        setConnected(false);
        console.log('[WebSocket] Disconnected - retrying...');
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          listenersRef.current.forEach((fn) => fn(parsed));
        } catch (e) {
          console.error('[WebSocket] Failed to parse message', e);
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // Prevent reconnect on unmount
        ws.close();
      }
    };
  }, [baseUrl, token]);

  const send = useCallback((type, data) => {
    if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('[WebSocket] Cannot send, not connected');
    }
  }, [connected]);

  const onMessage = useCallback((fn) => {
    listenersRef.current.push(fn);
    return () => {
      listenersRef.current = listenersRef.current.filter((f) => f !== fn);
    };
  }, []);

  return { send, onMessage, connected };
}
