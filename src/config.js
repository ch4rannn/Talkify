// Centralized API configuration
const isDev = import.meta.env.DEV;

export const API_BASE = isDev
  ? `http://${window.location.hostname}:8080`
  : 'https://talkify-production-28d3.up.railway.app';

export const WS_BASE = isDev
  ? `ws://${window.location.hostname}:8080`
  : 'wss://talkify-production-28d3.up.railway.app';
