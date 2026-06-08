# email-normalization-and-migration Specification

## Purpose
TBD - created by archiving change email-format-and-migration. Update Purpose after archive.
## Requirements
### Requirement: Email Lowercase Normalization
The system SHALL convert all email inputs (during registration, login, forgot password request, and profile email update) to lowercase strings before validation, querying, or database write operations.

#### Scenario: Registering with mixed case email
- **WHEN** a user registers with the email `Ashik.CSE@Example.com`
- **THEN** the system SHALL store the email in the database as `ashik.cse@example.com` and generate verification records for `ashik.cse@example.com`.

#### Scenario: Logging in with mixed case email
- **WHEN** a user attempts to log in using the email `ASHIK.cse@EXAMPLE.com`
- **THEN** the system SHALL lowercase the input and search the database for `ashik.cse@example.com`, allowing successful login.

### Requirement: Email Format Syntax Validation
The system SHALL validate that all email inputs match a standard email format regex pattern on both the frontend and backend, rejecting invalid strings with clear error messages.

#### Scenario: Submitting invalid email address
- **WHEN** a user enters `invalid-email-format` in the email input and submits
- **THEN** the system SHALL prevent submission and display "Invalid email format" to the user.

### Requirement: Existing User Migration
The system SHALL ensure that all user accounts created prior to this migration are automatically marked as verified in the database, avoiding dashboard lockouts.

#### Scenario: Existing user logs in after migration
- **WHEN** a user who registered before the email verification system was introduced logs into their account
- **THEN** the system SHALL find their `is_verified` column is set to `true` and grant immediate access to the dashboard.

