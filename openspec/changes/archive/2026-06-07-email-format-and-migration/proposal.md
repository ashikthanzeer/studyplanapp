## Why

Currently, different casings in email inputs (e.g., `Ashik@Example.com` vs `ashik@example.com`) are treated as separate strings, which can lead to duplicate account creation or credential verification errors. Additionally, because the recent OTP verification migration defaulted the `is_verified` column to `false`, all existing registered users are now locked out of their dashboards until they undergo verification.

## What Changes

- **Email Normalization**: Enforce lowercase conversion for all email inputs on both frontend and backend before database storage, matching, or lookup operations.
- **Email Validation**: Standardize email format regex validation on both client and server sides.
- **Existing User Migration**: Perform a database migration script to set `is_verified = true` for all existing registered users, ensuring zero service disruption.

## Capabilities

### New Capabilities
- `email-normalization-and-migration`: Enforces case-insensitivity on emails and executes data correction/migration steps for existing users.

### Modified Capabilities
- `email-otp-verification`: Update authentication specs to explicitly state case-insensitive matching rules for registration, logins, and OTP validations.

## Impact

- **Database**: Run an update migration to flag current accounts as verified.
- **Backend**: Update email validator utility and controllers (`register`, `login`, `forgotPassword`, `resetPassword`, `confirmEmailChange`) to lowercase email inputs.
- **Frontend**: Enforce lowercase formatting on email form inputs on submit.
