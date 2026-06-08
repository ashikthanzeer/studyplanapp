## Why

If a user registers but closes the application before verifying their email address, they get stuck upon subsequent login attempts because no verification OTP code is automatically sent to prompt them. Additionally, if an unverified user undergoes a successful forgot-password flow and enters a valid OTP, their account is not automatically marked as verified, even though they have successfully proven ownership of the email address.

## What Changes

- Automatically generate and send a new email verification OTP code to unverified users when they attempt to log in.
- Automatically mark the user as verified (`is_verified = true`) in the database when they successfully reset their password via the forgot-password OTP flow.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `email-otp-verification`: Update the authentication rules to include auto-OTP dispatch on unverified logins, and update user verification status on successful password reset.

## Impact

- **Backend**: Update the `login` and `resetPassword` handlers in `authController.ts` to implement these flows.
- **Frontend**: Cleanly handle user login states and redirect to the OTP verification screen with an active verification process.
