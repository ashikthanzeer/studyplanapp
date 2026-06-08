## Context

Currently, if a user registers but exits the app before verifying their email address, they get stuck when logging back in because no OTP verification code is automatically dispatched to them. Additionally, resetting a password through the forgot password flow successfully validates the user's control over the email, but does not mark their account as verified in the DB.

## Goals / Non-Goals

**Goals:**
* Send a new verification OTP automatically when an unverified user logs in.
* Mark users as verified (`is_verified = true`) in the database upon successful forgot-password reset validation.

**Non-Goals:**
* Bypassing verification check for unverified logins.
* Removing existing token generation logic for unverified logins (since they still need the token to access the verification views).

## Decisions

### Decision 1: Trigger email OTP dispatch on login for unverified accounts
* **Choice**: In the `login` controller, if a user has `is_verified === false`, run `generateAndSaveOTP` and call `sendOTPEmail` before returning the response.
* **Rationale**: This ensures that as soon as the user is redirected to the verification view, a fresh OTP has already been sent to their inbox, eliminating the need to click "Resend" manually.

### Decision 2: Mark verified during password reset
* **Choice**: In the `resetPassword` controller, update the `users` table to set `is_verified = true` upon successful OTP matching.
* **Rationale**: Validating a password reset OTP proves ownership of the email account, so we can securely elevate the account status to verified.

## Risks / Trade-offs

* **[Risk]** Spamming the user with emails if they login repeatedly.
  * **Mitigation**: Standard backend rate limiting or simply generating/sending only one new OTP per login attempt is sufficient for the scale of this project.
