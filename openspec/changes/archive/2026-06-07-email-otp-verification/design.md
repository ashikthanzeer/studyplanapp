## Context

StudyPlanner currently operates with unverified email addresses. To improve security and user management, we need to introduce:
1. Email verification upon sign-up.
2. Password resets via email-based OTP.
3. OTP-confirmed updates to registered profile credentials (email/password).

## Goals / Non-Goals

**Goals:**
* Define database updates for tracking user verification state and active OTP codes.
* Design backend controllers and service layers for generating, sending, and validating OTPs.
* Incorporate `nodemailer` to handle email delivery, defaulting to a mock Ethereal SMTP server for local testing.
* Add React frontend components for OTP entry, password reset requests, and settings triggers.

**Non-Goals:**
* Provisioning a paid, live email dispatch API (e.g., SendGrid, Resend) during local dev. Instead, the backend will accept any standard SMTP config via `.env`.
* Phone number or SMS-based verification.
* Two-factor authentication (2FA) for standard logins.

## Decisions

### Decision 1: Storing OTPs in PostgreSQL instead of Redis
* **Alternatives Considered**: In-memory cache, Redis.
* **Choice**: PostgreSQL table (`otps`).
* **Rationale**: The current application is a Node-Express-Postgres app. Setting up and hosting a Redis instance adds unnecessary dev/ops complexity. A lightweight `otps` table with query indexes is highly performant enough for our scale.

### Decision 2: 6-Digit Numeric OTPs with 10-Minute Expiry
* **Alternatives Considered**: Alphanumeric codes, secure links with long JWTs.
* **Choice**: 6-digit numeric codes.
* **Rationale**: Easier for users to copy/paste or type from mobile screens compared to long alphanumeric strings. A 10-minute expiry balances usability and security.

### Decision 3: Nodemailer for SMTP Transport
* **Alternatives Considered**: Custom HTTP integrations for specific APIs.
* **Choice**: Nodemailer.
* **Rationale**: Highly flexible, supports standard SMTP servers, and enables easy integration with mock SMTP testing services like Ethereal Mail.

## Risks / Trade-offs

* **[Risk]** User exits page before verifying.
  * **Mitigation**: Save the user in the database with `is_verified = false`. When the user attempts to log in later, check their verification status and redirect them back to the verification page to request a new OTP if needed.
* **[Risk]** Spammed email endpoints (API exhaustion/flooding).
  * **Mitigation**: Implement a 60-second client-side cooldown on the "Resend OTP" button.
