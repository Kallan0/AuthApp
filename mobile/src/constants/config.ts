import { Platform } from 'react-native';

export const PREVIEW_MODE = process.env.EXPO_PUBLIC_PREVIEW_MODE === 'true';

// Expo inlines EXPO_PUBLIC_ variables into the JavaScript bundle.
// A phone needs the host computer's reachable LAN address here when using the API.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  ?? (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api');