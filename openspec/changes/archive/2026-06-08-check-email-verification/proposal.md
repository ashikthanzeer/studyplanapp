## Why

The user has configured new Gmail SMTP credentials in the backend `.env` file to support sending verification emails directly from a dedicated Google account. We need to verify that the email OTP verification flows (registration, forgot-password, email-change) are working properly, and that Google's SMTP auth correctly accepts and dispatches the emails without authentication failures.

## What Changes

- Verify that Google's SMTP connection succeeds using the newly configured app password.
- Test that new registrations successfully trigger OTP emails to user inboxes.
- Verify that unverified accounts are successfully blocked from accessing dashboards.
- Verify that correct OTP entry unlocks user profiles, and incorrect entries are rejected.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Impact

- **Backend**: Verifying email dispatch services (`emailService.ts` and `nodemailer` SMTP client connections).
- **Database**: Verifying OTP generation and state management.
- **Frontend**: Testing authentication redirects and OTP verification views in `Auth.tsx` and `EmailVerification.tsx`.
