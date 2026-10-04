# Illoca

Illoca is a mobile task planner for creating, scheduling, and tracking tasks. It supports email/password and Google sign-in, deadline alerts while the app is open, and a NestJS API that stores accounts and tasks in MongoDB.

## Tech stack

### Languages

| Language | Used for |
| --- | --- |
| <img src="https://cdn.simpleicons.org/typescript" width="22" height="22" alt="TypeScript icon"> **TypeScript** | Mobile app and backend |
| <img src="https://cdn.simpleicons.org/javascript" width="22" height="22" alt="JavaScript icon"> **JavaScript** | App configuration and migration script |
| <img src="https://cdn.simpleicons.org/kotlin" width="22" height="22" alt="Kotlin icon"> **Kotlin** | Android native project |
| <img src="https://cdn.simpleicons.org/swift" width="22" height="22" alt="Swift icon"> **Swift** | iOS native project |

### Frameworks, services, and tools

| Tool | Role |
| --- | --- |
| <img src="https://cdn.simpleicons.org/react" width="22" height="22" alt="React icon"> **React Native** | Mobile interface |
| <img src="https://cdn.simpleicons.org/expo/000020/FFFFFF" width="22" height="22" alt="Expo icon"> **Expo** | Development and device previews |
| <img src="https://cdn.simpleicons.org/expo/000020/FFFFFF" width="22" height="22" alt="Expo icon"> **EAS Build** | Android development and preview APKs |
| <img src="https://cdn.simpleicons.org/android" width="22" height="22" alt="Android icon"> **Android** | Primary testing platform |
| <img src="https://cdn.simpleicons.org/nodedotjs" width="22" height="22" alt="Node.js icon"> **Node.js** | API runtime |
| <img src="https://cdn.simpleicons.org/nestjs" width="22" height="22" alt="NestJS icon"> **NestJS** | REST API |
| <img src="https://cdn.simpleicons.org/mongodb" width="22" height="22" alt="MongoDB icon"> **MongoDB** | Account and task storage |
| <img src="https://cdn.simpleicons.org/firebase" width="22" height="22" alt="Firebase icon"> **Firebase Authentication** | Email/password and Google sign-in |
| <img src="https://cdn.simpleicons.org/render/000000/FFFFFF" width="22" height="22" alt="Render icon"> **Render** | API hosting configuration |
| <img src="https://cdn.simpleicons.org/git" width="22" height="22" alt="Git icon"> **Git** | Version control |
| <img src="https://cdn.simpleicons.org/github/181717/FFFFFF" width="22" height="22" alt="GitHub icon"> **GitHub** | Source repository |
| <img src="https://cdn.simpleicons.org/vitest" width="22" height="22" alt="Vitest icon"> **Vitest** | Backend tests |
| <img src="https://cdn.simpleicons.org/eslint" width="22" height="22" alt="ESLint icon"> **ESLint** | Mobile code checks |

Icons are served by [Simple Icons](https://simpleicons.org/). Commands below assume a terminal opened at the repository root.

## Firebase setup

1. In Firebase Authentication, enable Email/Password and Google.
2. Add a Firebase Web app. Copy its API key, auth domain, project ID and app ID into `mobile/.env` using `mobile/.env.example`. Set `EXPO_PUBLIC_PREVIEW_MODE=false`.
3. Add a Firebase Android app named `com.illoca`. Save its `google-services.json` in `mobile/`.
4. Copy the Web OAuth client ID from Google Cloud Console into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `mobile/.env`.
5. Save a Firebase service account JSON at `backend/firebase-service-account.json`. Set `FIREBASE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json` in `backend/.env`. Keep the existing `MONGODB_URI`.

## Migrate existing accounts

Run the dry run first. It reports conflicts without changing data. Then apply it. Existing passwords, MongoDB user IDs, and tasks are preserved.

```powershell
cd backend
npm.cmd install
npm.cmd run migrate:firebase
npm.cmd run migrate:firebase -- --apply
npm.cmd run start:dev
```

If another Firebase UID already uses a legacy email, the script reports a conflict and skips that account. Resolve conflicts before that account signs in.

## Expo Go: email/password

Set `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:5000/api` in `mobile/.env`. Find the computer's Wi-Fi IPv4 address with `ipconfig`. Keep the phone on the same network.

```powershell
cd mobile
npm.cmd install
npm.cmd start
```

Scan the QR in Expo Go. If Wi-Fi transport fails, stop Expo with Ctrl+C and run `npm.cmd run start:tunnel`.

## Android development build: Google

```powershell
cd mobile
npx.cmd eas-cli@latest login
npm.cmd run build:android:development
```

Follow the Expo prompts, then install the resulting APK from its build link. Get the signing key SHA-1 with `npx.cmd eas-cli@latest credentials -p android`, add it to the Firebase Android app, download the updated `google-services.json`, and rebuild the APK. Start `npm.cmd run start:dev-client` and scan its QR with the installed Illoca development app.

Existing users can sign in with email/password, then choose **Connect Google** in Profile using the same email. After linking, **Continue with Google** works on the sign-in screen.

## Standalone APK and hosted API

For testing outside your local network, host the API at a public HTTPS address and build an Android preview APK with that address in the EAS `preview` environment. Run `npm.cmd run build:android:preview` from `mobile` after setting `EXPO_PUBLIC_API_URL`. See the [Render and APK instructions](docs/instruction.md#9-move-the-api-to-render-for-review-from-anywhere) for the exact setup. The APK works without Expo Go or a Metro server.

## Deadline popups

While the app is open, a pending task shows a popup when its deadline passes. If the app was closed, overdue tasks are shown together when it opens again. Each task deadline is shown once per account and device; changing a deadline allows a new alert. These are in-app popups, so they do not appear while the app is closed.

## Preview and verification

`EXPO_PUBLIC_PREVIEW_MODE=true` uses temporary UI data without the API. Review APKs use `EXPO_PUBLIC_PREVIEW_MODE=false` and real accounts and tasks. Restart Expo after changing the setting. For checks, run `npx.cmd tsc --noEmit` and `npm.cmd run lint` in `mobile`, then `npm.cmd run build` and `npm.cmd test` in `backend`.

See the [architecture](docs/architecture.md), [API reference](docs/api.md), and [setup instructions](docs/instruction.md).
