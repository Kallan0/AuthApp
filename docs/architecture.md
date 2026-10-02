# Architecture

The React Native screens use hooks and Zustand stores. Firebase Authentication owns the real sign-in session and persists it through AsyncStorage. The API client obtains a fresh Firebase ID token for protected requests. The task store keeps server tasks in memory. With `EXPO_PUBLIC_PREVIEW_MODE=true`, the app uses a separate temporary preview adapter.

The NestJS API verifies Firebase ID tokens with Firebase Admin. It resolves each Firebase UID to a MongoDB user and scopes every task lookup by that user's original MongoDB ID. The migration script imports existing bcrypt password hashes into Firebase and records a Firebase UID on each original MongoDB user; it does not move or recreate tasks. A token with an unlinked email cannot claim an existing user. New Firebase accounts create new MongoDB user records.

Google sign-in uses a native Android module and appears only in an Android development build. An existing email/password user can connect the matching Google account from Profile. Email/password remains available in Expo Go.

All stored dates are UTC instants. The app converts them to the device's local timezone for display. The home screen filters and sorts tasks returned by the API.
