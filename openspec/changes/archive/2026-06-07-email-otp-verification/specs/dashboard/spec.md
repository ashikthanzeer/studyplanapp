## ADDED Requirements

### Requirement: Dashboard requires email verification
The system SHALL restrict access to the dashboard view to users whose email addresses have been successfully verified.

#### Scenario: Unverified user redirected from dashboard
- **WHEN** an unverified user attempts to access the dashboard url or view
- **THEN** the system SHALL redirect the user to the OTP verification screen.
