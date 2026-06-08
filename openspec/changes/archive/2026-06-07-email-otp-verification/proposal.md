## Why

Currently, StudyPlanner users can register and log in with any email without verification, posing security risks and enabling fake accounts. Additionally, there is no secure way for users to recover forgotten passwords or verify identity when modifying sensitive profile credentials (email/password). This change establishes verification and verification-on-change flows to secure user accounts.

## What Changes

- Implement a database-backed one-time password (OTP) verification mechanism.
- Add email verification on registration, blocking unverified users from accessing the app.
- Provide a forgot-password flow allowing users to reset their passwords using an OTP sent to their email.
- Require OTP confirmation when changing registered emails or passwords in settings.

## Capabilities

### New Capabilities
- `email-otp-verification`: Covers user registration verification, forgot password flows, and OTP request/validation endpoints and views.

### Modified Capabilities
- `dashboard`: Require the user's email to be verified before allowing access to the dashboard.
- `student-profiles`: Add OTP verification requirements when a user attempts to update their email address or password in settings.

## Impact

- **Database**: Add `is_verified` column to `users` and a new `otps` table.
- **Backend API**: Add routes for requesting/confirming OTPs and verification.
- **Frontend App**: Integrate verification forms and redirect flows.
- **Dependencies**: Add `nodemailer` for email dispatch.
