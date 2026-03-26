// Centralized API configuration
const isDev = import.meta.env.DEV;

export const API_BASE = isDev
  ? `http://${window.location.hostname}:8080`
  : '';

export const WS_BASE = isDev
  ? `ws://${window.location.hostname}:8080`
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
