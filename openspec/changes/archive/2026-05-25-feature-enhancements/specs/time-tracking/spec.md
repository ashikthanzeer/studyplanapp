## MODIFIED Requirements

### Requirement: System calculates productivity statistics
The system SHALL provide insights including sessions per day, average session completion rate, and total study time tracked.

#### Scenario: View daily statistics
- **WHEN** user views statistics dashboard
- **THEN** system displays today's Pomodoro count, total focus time, and completion percentage

#### Scenario: View weekly summary
- **WHEN** user selects "This Week" view
- **THEN** system shows total sessions, average daily focus time, and day-by-day breakdown

#### Scenario: Aggregate hours studied for today and current week
- **WHEN** the system calculates statistics
- **THEN** the system SHALL compute the total focused study hours (aggregated from completed Pomodoro sessions) specifically for the current calendar day and the current calendar week
