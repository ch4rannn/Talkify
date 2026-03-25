// Centralized API configuration
// In production (same-origin), use empty string so fetch() uses relative paths
// In development, proxy to the Express backend on port 8080

const isDev = import.meta.env.DEV;

export const API_BASE = isDev
  ? `http://${window.location.hostname}:8080`
  : '';

export const WS_BASE = isDev
  ? `ws://${window.location.hostname}:8080`
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
