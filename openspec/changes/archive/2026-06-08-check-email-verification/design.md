## Context

The backend is configured with Gmail SMTP settings to send OTP verification codes to users. A previous test run resulted in an `EAUTH` (BadCredentials) error from Google:
`Forgot password error: Error: Invalid login: 535-5.7.8 Username and Password not accepted.`
This design doc outlines the steps to verify if the newly updated Gmail SMTP credentials in `.env` are correct, functional, and successfully send emails.

## Goals / Non-Goals

**Goals:**
* Verify SMTP authentication and connection with `smtp.gmail.com`.
* Programmatically send a test OTP email using the configured transporter.
* Verify user registration and verification flows.

**Non-Goals:**
* Modifying any core auth logic, backend middleware, or database schema.

## Decisions

### Decision 1: Create a standalone SMTP tester script
* **Choice**: Run a quick Node script to verify the connection and send a test email, catching any SMTP auth errors.
* **Rationale**: This lets us isolate SMTP configuration issues (like Gmail's bad credentials error) directly from the command line without having to click through the React UI.

## Risks / Trade-offs

* **[Risk]** Gmail account blocks due to login attempts from new locations/IPs.
  * **Mitigation**: Google App Passwords bypass standard location-based blockings. Ensure 2-Step Verification remains enabled on the account.
