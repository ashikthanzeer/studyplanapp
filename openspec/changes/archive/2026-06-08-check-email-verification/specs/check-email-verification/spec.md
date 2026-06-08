## ADDED Requirements

### Requirement: Verify Gmail SMTP integration
The system SHALL successfully connect to the configured Google SMTP server and dispatch OTP verification emails to target mailboxes.

#### Scenario: OTP Email Received
- **WHEN** a user registers a new account or requests password recovery
- **THEN** the system SHALL send a 6-digit OTP code to their email address using the Google SMTP server
