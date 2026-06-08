## 1. Database & Package Setup

- [x] 1.1 Create database migration script `migration_otp_auth.sql` to add `is_verified` to `users` and create `otps` table
- [x] 1.2 Run database migrations on the development database
- [x] 1.3 Add `nodemailer` and its TypeScript definitions to the backend project dependencies

## 2. Backend Services & Utilities

- [x] 2.1 Implement `emailService.ts` for SMTP connection and OTP email template dispatching
- [x] 2.2 Implement `otpService.ts` for generating random 6-digit OTPs, saving them, and checking validation/expiry times

## 3. Backend Routes & Middlewares

- [x] 3.1 Modify user registration controller to generate/send registration OTP and save user with `is_verified = false`
- [x] 3.2 Add `POST /api/auth/verify-email` route handler to validate registration OTP and update user verification status
- [x] 3.3 Add `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` routes to support secure credential resets
- [x] 3.4 Add routes to request and verify OTPs for email and password changes under profile endpoints
- [x] 3.5 Update API auth middleware to block unverified users from executing non-auth endpoints

## 4. Frontend Integration

- [x] 4.1 Update API service client in the frontend to include functions calling the new verification and forgot-password endpoints
- [x] 4.2 Implement an OTP verification screen with resend cooldown timer (60s)
- [x] 4.3 Modify the routing/App view to intercept unverified logged-in users and display the OTP verification view
- [x] 4.4 Add a forgot password dialog to the sign-in modal
- [x] 4.5 Update the profile settings components to trigger verification overlays when updating the email address or password

## 5. End-to-End Verification

- [x] 5.1 Test the new user sign-up and registration verification flow using mock Ethereal mail logs
- [x] 5.2 Validate that unverified users cannot bypass the dashboard block
- [x] 5.3 Test the forgot-password and reset-password flows
- [x] 5.4 Test the email/password updates under profile settings
