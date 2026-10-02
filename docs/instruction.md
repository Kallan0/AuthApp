# Firebase setup for Illoca (Android)

This guide connects the existing Expo app and NestJS API to one Firebase project. Email/password works in Expo Go. Google sign-in uses an Android development or preview build. Keep the current MongoDB database: it still stores users and tasks.

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

## 8. Let someone outside your Wi-Fi review the Android app

The backend already listens on `0.0.0.0:5000`, meaning it accepts connections on the computer's network interfaces. **Do not use `0.0.0.0` in `EXPO_PUBLIC_API_URL`**: it is a server listening address, not a phone-reachable address. A `192.168.x.x` address works only on a reachable local network. An outside reviewer needs a public HTTPS URL that forwards to the API. Their app also needs its JavaScript bundle: use a preview APK for a standalone install, or keep Expo's development server running over a tunnel. MongoDB Atlas's IP access list controls which backend servers can connect to the database; adding `0.0.0.0/0` there does not publish the API or help the reviewer's phone reach it.

### Temporary review while your computer stays on

1. Start the backend from `backend` with `npm.cmd run start:dev`. Leave that window open. Confirm `http://localhost:5000/api/auth/me` returns a `401` JSON response.
2. In another PowerShell window run the [Wrangler Quick Tunnel](https://developers.cloudflare.com/workers/wrangler/commands/tunnel/#tunnel-quick-start) command (or [install `cloudflared` for Windows](https://developers.cloudflare.com/tunnel/downloads/) and use the second command):

   ```powershell
   npx.cmd --yes wrangler@latest tunnel quick-start http://localhost:5000
   ```

   ```powershell
   cloudflared tunnel --url http://localhost:5000
   ```

3. Copy the printed `https://...trycloudflare.com` URL. Open `https://...trycloudflare.com/api/auth/me` in a browser. A `401` JSON response confirms the public route reaches the API. Anyone with that URL can reach the API, although user and task routes still require a valid Firebase token. Stop the tunnel with Ctrl+C when review is done. [Quick Tunnel details](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).
4. For the **existing development APK**, set `EXPO_PUBLIC_API_URL=https://...trycloudflare.com/api` in `mobile/.env`, then run `npm.cmd run start:dev-client -- --tunnel` from `mobile`. Send the reviewer the development APK link and the new Expo QR/link. Keep the backend, API tunnel, and Expo server running until the review ends. Restart Expo after changing `.env` so it bundles the new URL.

### Standalone review APK

The `preview` build profile in `mobile/eas.json` bundles the app and does not need Metro or an Expo QR. Use a public HTTPS API URL. A Quick Tunnel works for a short review while the backend and tunnel stay running; a deployed API or named tunnel on your own domain gives a stable URL for repeat reviews. In the [Expo project environment settings](https://docs.expo.dev/eas/environment-variables/manage/), add these `preview` environment variables as plain text, using the same Firebase Web app values as `mobile/.env`:

```dotenv
EXPO_PUBLIC_PREVIEW_MODE=false
EXPO_PUBLIC_API_URL=https://YOUR_PUBLIC_API_HOST/api
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_WEB_APP_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_WEB_APP_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_OAUTH_CLIENT_ID
```

Do not add MongoDB credentials or the Firebase service account to Expo environment variables. The repository excludes `mobile/.env` from EAS uploads, so the preview build must receive the public values from EAS. Build from PowerShell:

```powershell
cd C:\Users\Joji\Internship_works\Login_app\mobile
npm.cmd run build:android:preview
```

Send the resulting APK install link to the reviewer. The API must remain available for sign-in and tasks. `EXPO_PUBLIC_API_URL` is embedded in the APK. A Quick Tunnel hostname changes when restarted, so the APK built with that URL works only while the same tunnel is running. If you restart the tunnel, update the preview URL and build a new APK from `mobile`:

```powershell
npx.cmd eas-cli@latest env:set preview --name EXPO_PUBLIC_API_URL --value https://NEW_HOST.trycloudflare.com/api --visibility plaintext --non-interactive
npm.cmd run build:android:preview
```

[Expo internal distribution](https://docs.expo.dev/build/internal-distribution/) and [EAS environment variables](https://docs.expo.dev/eas/environment-variables/usage/) describe these build behaviors.

## 9. Move the API to Render for review from anywhere

This repository has a `backend` service and a `mobile` app. Render hosts only the backend; MongoDB Atlas remains the database, and Firebase Authentication remains the sign-in provider. The existing task data stays in the same MongoDB database.

1. Commit and push the deployment changes to the repository's `main` branch. Render deploys code from GitHub, not from files that exist only on this computer. Keep `backend/.env` and `backend/firebase-service-account.json` out of Git. From the repository root in PowerShell:

   ```powershell
   cd C:\Users\Joji\Internship_works\Login_app
   git add backend/.node-version backend/package.json backend/src/app.module.ts backend/src/health.controller.ts mobile/src/api/authApi.ts mobile/eas.json mobile/package.json docs/instruction.md .easignore
   git commit -m "Prepare Render review deployment"
   git push origin main
   ```
2. In [Render](https://dashboard.render.com/), choose **New > Web Service**, connect the GitHub repository `Kallan0/AuthApp`, and set:

   | Field | Value |
   | --- | --- |
   | Runtime | Node |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Build Command | `npm ci --include=dev && npm run build` |
   | Start Command | `npm run start:prod` |
   | Instance Type | Free |
   | Health Check Path | `/api/health` |

   The `backend/.node-version` file selects Node 24. Render supplies `PORT`; the API already listens on `0.0.0.0` and uses that port.
3. In the Render service's **Environment** page, add `MONGODB_URI` with the existing Atlas connection string and `FIREBASE_PROJECT_ID` with the existing Firebase project ID. Under **Secret Files**, add a file named `firebase-service-account.json` with the contents of the local `backend/firebase-service-account.json`. Add the environment variable `GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-service-account.json`. Never put the MongoDB URI or service account JSON in `EXPO_PUBLIC_*` variables or Git. [Render secret files](https://render.com/docs/configure-environment-variables) and [Firebase Admin credentials](https://firebase.google.com/docs/admin/setup) explain these settings.
4. In the Render service page, open **Connect > Outbound** and copy its outbound IP ranges. Add those ranges to the MongoDB Atlas project's **Network Access** list so this backend can reach the existing database. Use the listed ranges instead of opening Atlas to `0.0.0.0/0`. [Render outbound IP addresses](https://render.com/docs/outbound-ip-addresses).
5. Deploy the service. Open `https://YOUR_SERVICE.onrender.com/api/health`: it should return a `200` response with `success: true` and `data.status: ok`. Open `https://YOUR_SERVICE.onrender.com/api/auth/me` without signing in: a `401` JSON response confirms the protected API route is reachable. If the service does not become healthy, inspect Render's deploy logs and confirm the secret file, environment variables, and Atlas access list.
6. From the `mobile` folder in PowerShell, put the new stable URL into the EAS preview environment and build a new APK:

   ```powershell
   cd C:\Users\Joji\Internship_works\Login_app\mobile
   npx.cmd eas-cli@latest env:set preview --name EXPO_PUBLIC_API_URL --value https://YOUR_SERVICE.onrender.com/api --visibility plaintext --non-interactive
   npm.cmd run build:android:preview
   ```

   Replace `YOUR_SERVICE` with the actual Render hostname. Send the **new** APK install link from EAS to the reviewer. The earlier APK contains the temporary tunnel URL and will not switch to Render automatically. The preview build uses real Firebase and MongoDB data (`EXPO_PUBLIC_PREVIEW_MODE=false`).

Render's Free service [sleeps after 15 minutes of inactivity and can take about a minute to wake](https://render.com/docs/free). The app gives the initial account request 90 seconds to allow for this. The first login after a quiet period may therefore be slow; later requests should be faster. If reliable immediate login becomes necessary, change the Render service to a paid instance.
