## MODIFIED Requirements

### Requirement: Dashboard displays daily productivity summary
The system SHALL show today's study statistics including sessions completed, total focus time, and tasks completed.

#### Scenario: View daily stats
- **WHEN** user views dashboard after completing study sessions
- **THEN** system displays "Today: 3 sessions, 75 minutes focus time, 2 tasks completed"

#### Scenario: View weekly streak
- **WHEN** user views dashboard
- **THEN** system displays study streak indicator showing the dynamically calculated number of consecutive active focus days (e.g., "7 Days Active")
