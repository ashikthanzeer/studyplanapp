# dashboard Specification

## Purpose
Productivity stats, goals, and badge summaries displayed on the user dashboard.
## Requirements
### Requirement: Dashboard displays daily productivity summary
The system SHALL show today's study statistics including sessions completed, total focus time, tasks completed, and a comparison against the previous period. When a user clicks on the "Focus Today" or "Focus This Week" panels, the system SHALL display a detailed comparison overlay showing focus hours for the past 7 days or the past 4 weeks (including the current week) respectively.

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

#### Scenario: Open past 7 days comparison modal
- **WHEN** the user clicks on the "Focus Today" panel
- **THEN** the system SHALL open a modal showing focus hours from the past 7 days with visual progress bars compared to the daily goal

#### Scenario: Open past 4 weeks comparison modal
- **WHEN** the user clicks on the "Focus This Week" panel
- **THEN** the system SHALL open a modal showing focus hours from the past 4 weeks (including current week) with visual progress bars compared to the weekly goal

### Requirement: Dashboard displays gamification rewards and badges
The system SHALL display the user's active level rank (e.g., Bronze, Silver, Gold) and a showcase of all available badges on the dashboard.

#### Scenario: View badges and rank on dashboard
- **WHEN** the user views the dashboard
- **THEN** the system displays their current level rank and a visual gallery of all badges, where earned badges show counts for duplicates and unearned badges are displayed with reduced brightness and a locked sign

### Requirement: Dashboard requires email verification
The system SHALL restrict access to the dashboard view to users whose email addresses have been successfully verified.

#### Scenario: Unverified user redirected from dashboard
- **WHEN** an unverified user attempts to access the dashboard url or view
- **THEN** the system SHALL redirect the user to the OTP verification screen.

