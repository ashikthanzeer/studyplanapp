## ADDED Requirements

### Requirement: Email Verification on Registration
The system SHALL require all newly registered users to verify their email address via a 6-digit One-Time Password (OTP) sent to their email before they can access the application dashboard.

#### Scenario: Redirect new user to verification screen
- **WHEN** a user registers with a name, email, and password
- **THEN** the system SHALL create the user account in an unverified state, generate a 6-digit OTP, send it to the user's email, and redirect the user to the OTP verification view.

#### Scenario: Successful email verification
- **WHEN** the user enters the correct 6-digit OTP in the verification view
- **THEN** the system SHALL mark the user account as verified, delete the OTP, and redirect the user to the dashboard.

#### Scenario: Failed email verification
- **WHEN** the user enters an incorrect 6-digit OTP in the verification view
- **THEN** the system SHALL display an error message and keep the user on the verification view in an unverified state.

#### Scenario: Resend verification OTP
- **WHEN** the user clicks the "Resend OTP" button after the 60-second cooldown has elapsed
- **THEN** the system SHALL generate and send a new 6-digit OTP to the user's email and reset the cooldown timer.

### Requirement: Forgot Password Flow
The system SHALL allow users who have forgotten their password to request a 6-digit OTP to reset their password securely.

#### Scenario: Request password reset OTP
- **WHEN** a user clicks "Forgot Password" on the login screen, enters their registered email, and clicks "Send OTP"
- **THEN** the system SHALL generate a password reset OTP, send it to their email, and display the password reset form.

#### Scenario: Reset password with valid OTP
- **WHEN** the user submits the password reset form with the correct OTP and a new password
- **THEN** the system SHALL update the user's password, delete the OTP, and display a success message allowing them to log in.

#### Scenario: Reset password with invalid or expired OTP
- **WHEN** the user submits the password reset form with an incorrect or expired OTP
- **THEN** the system SHALL reject the password change and display an error message.

### Requirement: Single-use and Timeout of OTP Codes
The system SHALL ensure that all generated OTPs are 6-digit numeric strings, expire exactly 10 minutes after generation, and are immediately invalidated/deleted upon successful validation.

#### Scenario: Validate expired OTP
- **WHEN** a user submits an OTP that was generated more than 10 minutes ago
- **THEN** the system SHALL reject the OTP as expired and prompt the user to request a new code.
