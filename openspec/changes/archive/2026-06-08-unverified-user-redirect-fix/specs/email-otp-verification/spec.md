## MODIFIED Requirements

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

#### Scenario: Unverified user login auto-sends OTP
- **WHEN** an unverified user logs in with valid credentials
- **THEN** the system SHALL generate and send a new 6-digit OTP to the user's email, return successful authentication, and redirect the user to the verification view.

#### Scenario: Redirect unverified logged-in user to verification screen
- **WHEN** an unverified user logs in and the frontend profile loader is executed
- **THEN** the system SHALL load the user profile in an unverified state, bypass loading other verified-only data, and display the OTP verification view without triggering a logout.
