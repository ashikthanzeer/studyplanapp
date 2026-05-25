## MODIFIED Requirements

### Requirement: Dashboard displays daily productivity summary
The system SHALL show today's study statistics including sessions completed, total focus time, tasks completed, and a comparison against the previous period.

#### Scenario: View daily stats
- **WHEN** user views dashboard after completing study sessions
- **THEN** system displays "Today: 3 sessions, 75 minutes focus time, 2 tasks completed"

#### Scenario: View weekly streak
- **WHEN** user views dashboard
- **THEN** system displays study streak indicator showing the dynamically calculated number of consecutive active focus days (e.g., "7 Days Active")

#### Scenario: View daily and weekly study hours
- **WHEN** the user views the dashboard
- **THEN** the system SHALL display the total focus hours completed today and during the current week (e.g., "Today: 2.5 hrs", "This Week: 12.0 hrs")

#### Scenario: View study time comparison
- **WHEN** the user views the daily and weekly focus hours on the dashboard
- **THEN** the system SHALL display an indicator below the hours showing how much more or less they have studied compared to the previous day and previous week respectively

### Requirement: Dashboard displays gamification rewards and badges
The system SHALL display the user's active level rank (e.g., Bronze, Silver, Gold) and a showcase of all available badges on the dashboard.

#### Scenario: View badges and rank on dashboard
- **WHEN** the user views the dashboard
- **THEN** the system displays their current level rank and a visual gallery of all badges, where earned badges show counts for duplicates and unearned badges are displayed with reduced brightness and a locked sign
