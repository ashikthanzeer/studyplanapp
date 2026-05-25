## MODIFIED Requirements

### Requirement: User can create and manage student profile
The system SHALL allow each student to create a profile with name, email, subjects, and study preferences.

#### Scenario: Create new profile
- **WHEN** new user registers with name and email
- **THEN** system atomically creates the user account, initializes the student profile, saves default study preferences, and provisions default Kanban columns
