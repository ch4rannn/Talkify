// Centralized API configuration
import { Capacitor } from '@capacitor/core';

const isDev = import.meta.env.DEV;
const isNative = Capacitor.isNativePlatform();

// On native (Capacitor) always use production backend — localhost won't work on a phone
export const API_BASE = (isDev && !isNative)
  ? `http://${window.location.hostname}:8080`
  : 'https://talkify-production-28d3.up.railway.app';

export const WS_BASE = (isDev && !isNative)
  ? `ws://${window.location.hostname}:8080`
  : 'wss://talkify-production-28d3.up.railway.app';
