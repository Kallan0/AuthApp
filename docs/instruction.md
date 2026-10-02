# Firebase setup for Illoca (Android)

This guide connects the existing Expo app and NestJS API to one Firebase project. Email/password works in Expo Go. Google sign-in uses the Android development build. Keep the current MongoDB database: it still stores users and tasks.

## 1. Create the Firebase project

1. Open the [Firebase console](https://console.firebase.google.com/) and create a project, or select the project you want to use.
2. In **Authentication > Sign-in method**, enable **Email/Password** and **Google**. Save each provider. [Firebase email/password setup](https://firebase.google.com/docs/auth/web/password-auth) and [Google provider setup](https://firebase.google.com/docs/auth/web/google-signin) show the console steps.
3. Note the **Project ID** under **Project settings > General**. Use this same ID in both app and backend settings.

## 2. Add the Web app settings to Expo

1. In **Project settings > General > Your apps**, add a **Web** app. Hosting is not needed.
2. Edit the existing `mobile/.env`. Use [mobile/.env.example](../mobile/.env.example) to check the key names. Update the existing preview and API URL lines, then add the Firebase lines below. Keep one line per key:

```dotenv
EXPO_PUBLIC_PREVIEW_MODE=false
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:5000/api
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_WEB_APP_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_WEB_APP_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_OAUTH_CLIENT_ID
```

Use the exact values shown for your Web app. Get `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` from **Google Cloud Console > APIs & Services > Credentials**. It must be an OAuth client ID of type **Web application**, not the Android client ID. The [Google Sign-In configuration guide](https://react-native-google-signin.github.io/docs/setting-up/get-config-file) describes where to find it.

`EXPO_PUBLIC_*` values are bundled into the app. Do not put the service account JSON or MongoDB URI in `mobile/.env`.

## 3. Add the Android app

1. In **Firebase Project settings > Your apps**, add an **Android** app with package name **`com.illoca`**. This must match [mobile/app.json](../mobile/app.json).
2. Download its `google-services.json` into `mobile/google-services.json`. Keep that exact filename and location. The repo ignores the local file; the EAS build includes it.
3. After the first EAS development build creates an Android signing key, run `npx.cmd eas-cli@latest credentials -p android` from `mobile` and find its **SHA-1** fingerprint. Add the fingerprint to the Android app in Firebase Project settings, then download the updated `google-services.json` and rebuild the APK. The [Google Sign-In Android guide](https://react-native-google-signin.github.io/docs/setting-up/get-config-file) explains the SHA-1 requirement.

Google sign-in uses native code, so it cannot run inside Expo Go. [Expo setup for Google Sign-In](https://react-native-google-signin.github.io/docs/setting-up/expo) covers the development build requirement.

## 4. Configure the backend

1. In **Firebase Project settings > Service accounts**, choose **Generate new private key**.
2. Save the downloaded JSON as `backend/firebase-service-account.json`. Keep it private; never paste it into chat or commit it.
3. Add these values to the existing `backend/.env`, using [backend/.env.example](../backend/.env.example) for reference. Keep the current `MONGODB_URI` unchanged:

```dotenv
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

The backend uses the [Firebase Admin SDK and application default credentials](https://firebase.google.com/docs/admin/setup) to verify Firebase ID tokens. Run backend commands from the `backend` folder so the relative credential path resolves correctly.

## 5. Migrate existing accounts

Run this before signing in with existing accounts on the Firebase version. The script imports their bcrypt password hashes into Firebase and links each Firebase UID to the original MongoDB user. Task documents and their owner IDs remain in MongoDB. [Firebase supports bcrypt user imports](https://firebase.google.com/docs/auth/admin/import-users).

Open PowerShell:

```powershell
cd C:\Users\Joji\Internship_works\Login_app\backend
npm.cmd install
npm.cmd run migrate:firebase
```

The first run is a **dry run**. It changes nothing. Review its ready count and resolve any reported email or UID conflicts. Once it reports no conflicts, apply the migration:

```powershell
npm.cmd run migrate:firebase -- --apply
```

The apply command writes to Firebase and adds `firebaseUid` to existing MongoDB users. It does not delete users, tasks, or password hashes. It can be rerun if interrupted. An existing Firebase account with the same email but a different UID is skipped; do not assume the accounts are the same person.

## 6. Start the API and test email/password

In one PowerShell window:

```powershell
cd C:\Users\Joji\Internship_works\Login_app\backend
npm.cmd run start:dev
```

Find your computer's Wi-Fi IPv4 address with `ipconfig` and put it in `EXPO_PUBLIC_API_URL` in `mobile/.env`. Keep the Android phone and computer on the same reachable network. In the phone browser, open `http://YOUR_COMPUTER_LAN_IP:5000/api/auth/me`. A `401` response shows that the protected API is reachable.

In a second PowerShell window:

```powershell
cd C:\Users\Joji\Internship_works\Login_app\mobile
npm.cmd install
npm.cmd start
```

Scan the QR code in **Expo Go** and test an existing migrated account or create a new account. If the QR cannot connect over Wi-Fi, stop Expo with Ctrl+C and run `npm.cmd run start:tunnel`.

## 7. Build and test Google sign-in

From the `mobile` folder:

```powershell
npx.cmd eas-cli@latest login
npm.cmd run build:android:development
```

Follow the Expo prompts to link a project and create the Android signing key. Install the resulting APK from the build link. After registering the SHA-1 and rebuilding with the updated `google-services.json`, start the QR server:

```powershell
npm.cmd run start:dev-client
```

Scan that QR with the **installed Illoca development app**. Existing email/password users should first sign in with their password and tap **Connect Google** in Profile, selecting the Google account with the same email. Then they can use **Continue with Google** on the sign-in screen.

If Google reports `DEVELOPER_ERROR`, check the Android package name, signing key SHA-1, Web OAuth client ID, and refreshed `google-services.json`. If the API cannot connect, check the LAN IP, backend terminal, and network access before changing Firebase settings.
