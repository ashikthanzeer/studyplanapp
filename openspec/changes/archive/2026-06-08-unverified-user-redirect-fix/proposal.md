## Why

When an unverified user logs in, the frontend attempts to fetch their theme preferences and task schedules. Since these endpoints require verification, they respond with a `403 Forbidden` error. The frontend router catches this error and automatically logs the user out, resulting in a redirect loop that forces the login screen to reload continuously.

## What Changes

- Update the frontend profile loader (`loadUserProfile` in `App.tsx`) to check the user's verification status first.
- If the user is unverified, skip loading preferences and task schedules, set the user state immediately, and display the OTP verification view.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `email-otp-verification`: Update verification specs to detail the frontend flow for redirecting unverified logged-in users to the verification prompt instead of logging them out.

## Impact

- **Frontend**: Modifies `frontend/src/App.tsx` loading logic.
