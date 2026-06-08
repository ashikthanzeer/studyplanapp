## Context

To support case-insensitive logins, registrations, and OTP requests, all email data must be normalized to lowercase. Additionally, because the recent OTP verification rollout defaulted `is_verified` to `false`, we must run a migration to verify all existing users so they are not blocked from their dashboard.

## Goals / Non-Goals

**Goals:**
* Enforce lowercase conversion on all incoming email strings on both the frontend and backend.
* Create a database migration script that:
  1. Normalizes all existing emails in the `users` table to lowercase.
  2. Sets `is_verified = true` for all current users.
* Ensure validation patterns match exactly on client and server.

**Non-Goals:**
* Stripping gmail sub-addresses (e.g. `user+tag@gmail.com` -> `user@gmail.com`) or removing dots.
* Restoring user sessions that expired due to password resets.

## Decisions

### Decision 1: Normalization at both Frontend and Backend boundaries
* **Choice**: Convert emails to lowercase on the React client (on submit) AND in Express controllers.
* **Rationale**: Enforcing it on the backend ensures database integrity even if API requests are sent from outside the web UI (e.g., mobile apps, curl, or automated scripts). Conversions on the frontend prevent unnecessary API calls and ensure input fields reflect the saved state.

### Decision 2: SQL Migration for Data Correction
* **Choice**: Run a SQL migration script:
  ```sql
  UPDATE users SET email = LOWER(email);
  UPDATE users SET is_verified = true WHERE is_verified IS NOT TRUE;
  ```
* **Rationale**: This guarantees that:
  1. Existing emails in the DB are normalized, resolving lookups for users who originally registered with capital letters.
  2. All current users are immediately marked as verified, preventing post-deployment lockouts.

## Risks / Trade-offs

* **[Risk]** Unique constraint conflict during `LOWER(email)` update if duplicates exist (e.g., `user@test.com` and `User@test.com` both registered).
  * **Mitigation**: Database constraints in Postgres typically treat these as unique if case-sensitivity was enabled. However, in our system, duplicate registration was unlikely. If conflicts occur during migration, Postgres will abort the transaction, prompting us to manually resolve the conflict.
