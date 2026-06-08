## 1. Backend Implementation

- [x] 1.1 Update the `login` controller in `authController.ts` to generate and send a new email verification OTP if the user is unverified
- [x] 1.2 Update the `resetPassword` controller in `authController.ts` to set `is_verified = true` in the DB when successfully validating the reset password OTP

## 2. E2E Verification

- [x] 2.1 Verify that logging in with an unverified email automatically dispatches a new OTP to the user's email address
- [x] 2.2 Verify that resetting a password with forgot-password OTP sets `is_verified = true` and allows subsequent login directly
