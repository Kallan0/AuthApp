# API

Base URL: `/api`

Successful responses: `{ "success": true, "data": ... }`

Failed responses: `{ "success": false, "message": "...", "code": "..." }`

## Authentication

Firebase Authentication handles email/password and Google sign-in in the mobile app. The app sends a Firebase ID token as `Authorization: Bearer <id-token>` on protected requests. The backend verifies it with Firebase Admin and returns the matching MongoDB user from `GET /auth/me`. New Firebase users get a MongoDB user record automatically. Existing MongoDB users must be migrated first; an email match alone does not link accounts.

The old `POST /auth/register` and `POST /auth/login` endpoints are removed.

## Tasks

All task routes require a Firebase ID token. Tasks remain scoped to the authenticated MongoDB user ID.

- `GET /tasks`: list the user's tasks.
- `GET /tasks/:id`: get one task.
- `POST /tasks`: create a task.
- `PATCH /tasks/:id`: update a task, including status.
- `PATCH /tasks/:id/complete`: mark a task complete.
- `DELETE /tasks/:id`: delete a task.

Create payload: title, optional description, scheduledAt and deadline as ISO timestamps, priority (`low`, `medium`, `high`), and optional category. The deadline must be on or after the scheduled time. The task owner is derived from the authenticated user and cannot be set in the payload.
