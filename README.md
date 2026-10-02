# Illoca

An Expo task app with a NestJS/MongoDB API and Firebase Authentication.

## Firebase setup

1. In Firebase Authentication, enable Email/Password and Google.
2. Add a Firebase Web app. Copy its API key, auth domain, project ID and app ID into `mobile/.env` using `mobile/.env.example`. Set `EXPO_PUBLIC_PREVIEW_MODE=false`.
3. Add a Firebase Android app named `com.illoca`. Save its `google-services.json` in `mobile/`.
4. Copy the Web OAuth client ID from Google Cloud Console into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `mobile/.env`.
5. Save a Firebase service account JSON at `backend/firebase-service-account.json`. Set `FIREBASE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json` in `backend/.env`. Keep the existing `MONGODB_URI`.

## Migrate existing accounts

Run the dry run first. It reports conflicts without changing data. Then apply it. Existing passwords, MongoDB user IDs, and tasks are preserved.

```powershell
cd C:\Users\Joji\Internship_works\Login_app\backend
npm.cmd install
npm.cmd run migrate:firebase
npm.cmd run migrate:firebase -- --apply
npm.cmd run start:dev
```

If another Firebase UID already uses a legacy email, the script reports a conflict and skips that account. Resolve conflicts before that account signs in.

## Expo Go: email/password

Set `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:5000/api` in `mobile/.env`. Find the computer's Wi-Fi IPv4 address with `ipconfig`. Keep the phone on the same network.

```powershell
cd C:\Users\Joji\Internship_works\Login_app\mobile
npm.cmd install
npm.cmd start
```

Scan the QR in Expo Go. If Wi-Fi transport fails, stop Expo with Ctrl+C and run `npm.cmd run start:tunnel`.

## Android development build: Google

```powershell
cd C:\Users\Joji\Internship_works\Login_app\mobile
npx.cmd eas-cli@latest login
npm.cmd run build:android:development
```

Follow the Expo prompts, then install the resulting APK from its build link. Get the signing key SHA-1 with `npx.cmd eas-cli@latest credentials -p android`, add it to the Firebase Android app, download the updated `google-services.json`, and rebuild the APK. Start `npm.cmd run start:dev-client` and scan its QR with the installed Illoca development app.

Existing users can sign in with email/password, then choose **Connect Google** in Profile using the same email. After linking, **Continue with Google** works on the sign-in screen.

## Deadline popups

While the app is open, a pending task shows a popup when its deadline passes. If the app was closed, overdue tasks are shown together when it opens again. Each task deadline is shown once per account and device; changing a deadline allows a new alert. These are in-app popups, so they do not appear while the app is closed.

## Preview and verification

`EXPO_PUBLIC_PREVIEW_MODE=true` uses temporary UI data without the API. Restart Expo after changing the setting. For checks, run `npx.cmd tsc --noEmit` and `npm.cmd run lint` in `mobile`, then `npm.cmd run build` and `npm.cmd test` in `backend`.

See `docs/architecture.md` and `docs/api.md`.
