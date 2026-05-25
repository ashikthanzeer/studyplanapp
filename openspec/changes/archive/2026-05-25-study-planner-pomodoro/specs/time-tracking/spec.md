## ADDED Requirements

### Requirement: System automatically logs Pomodoro session data
The system SHALL track and record each completed Pomodoro session including duration, associated task, timestamp, and completion status.

#### Scenario: Log completed focus session
- **WHEN** user completes a 25-minute Pomodoro focus session
- **THEN** system records session with timestamp, duration, task association, and "completed" status

#### Scenario: Log abandoned session
- **WHEN** user closes app or exits during active session
- **THEN** system records partial session with "abandoned" status and elapsed time

### Requirement: User can view study session history
The system SHALL display a list of all user study sessions with date, duration, task completed, and status.

#### Scenario: View session history list
- **WHEN** user navigates to "Session History" or "Statistics" view
- **THEN** system displays table of all Pomodoro sessions sorted by date (newest first)

#### Scenario: Filter session history
- **WHEN** user filters sessions by date range (Last 7 days, Last month, etc.)
- **THEN** system shows only sessions within selected date range

### Requirement: User can view time spent per task
The system SHALL aggregate and display total Pomodoro time invested in each task.

#### Scenario: View time by task
- **WHEN** user clicks on a task in task management
- **THEN** system displays total Pomodoro sessions and cumulative time spent on that task

#### Scenario: View time by subject
- **WHEN** user selects a subject filter
- **THEN** system displays total study time across all tasks in that subject

### Requirement: System calculates productivity statistics
The system SHALL provide insights including sessions per day, average session completion rate, and total study time tracked.

#### Scenario: View daily statistics
- **WHEN** user views statistics dashboard
- **THEN** system displays today's Pomodoro count, total focus time, and completion percentage

#### Scenario: View weekly summary
- **WHEN** user selects "This Week" view
- **THEN** system shows total sessions, average daily focus time, and day-by-day breakdown

### Requirement: User can export session data
The system SHALL allow users to download session history and statistics in CSV or JSON format.

#### Scenario: Export session history
- **WHEN** user clicks "Export Sessions" and selects date range and CSV format
- **THEN** system generates and downloads CSV file with all session data

### Requirement: System prevents duplicate session logging
The system SHALL ensure each Pomodoro session is logged exactly once, preventing accidental duplicates.

#### Scenario: Session logged once on completion
- **WHEN** Pomodoro timer completes and notifications fire
- **THEN** session is logged to database exactly once, no duplicates
