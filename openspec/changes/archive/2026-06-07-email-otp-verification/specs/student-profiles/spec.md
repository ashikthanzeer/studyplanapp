## ADDED Requirements

### Requirement: OTP verification for profile email change
The system SHALL require a user to verify their identity via a 6-digit OTP sent to their new email address before updating their email address in their profile settings.

#### Scenario: Request email change OTP
- **WHEN** the user inputs a new email address in settings and clicks "Update Email"
- **THEN** the system SHALL generate and send a verification OTP to the new email address and prompt the user to input the OTP.

#### Scenario: Verify OTP and update email
- **WHEN** the user submits the correct OTP for the email change
- **THEN** the system SHALL update the user's email address in the database, invalidate the OTP, and display a success message.

### Requirement: OTP verification for profile password change
The system SHALL require a user to verify their identity via a 6-digit OTP sent to their current email address before updating their password in their profile settings.

#### Scenario: Request password change OTP
- **WHEN** the user clicks "Change Password" in settings
- **THEN** the system SHALL generate and send an OTP to the user's currently registered email address and display the password change form.

#### Scenario: Verify OTP and update password
- **WHEN** the user enters the correct OTP along with the new password and clicks "Confirm"
- **THEN** the system SHALL update the user's password in the database, invalidate the OTP, and display a success message.
