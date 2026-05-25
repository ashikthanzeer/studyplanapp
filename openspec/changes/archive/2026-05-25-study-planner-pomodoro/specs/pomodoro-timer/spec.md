## ADDED Requirements

### Requirement: User can start a Pomodoro session
The system SHALL provide a timer interface where users can initiate a Pomodoro focus session. Default duration is 25 minutes, configurable by user preference (15-50 minutes).

#### Scenario: Start default Pomodoro session
- **WHEN** user clicks "Start Pomodoro" button with default settings
- **THEN** system displays countdown timer showing 25:00 and begins counting down

#### Scenario: Start custom duration session
- **WHEN** user sets custom duration to 20 minutes and clicks "Start"
- **THEN** system displays countdown starting at 20:00

### Requirement: User receives notification when Pomodoro session ends
The system SHALL trigger a notification when the focus session timer reaches zero.

#### Scenario: Focus session expires
- **WHEN** Pomodoro timer counts down to 00:00
- **THEN** system displays completion notification and automatically starts break countdown

#### Scenario: Break session expires
- **WHEN** break timer counts down to 00:00
- **THEN** system notifies user that break is over and prompts to start next session

### Requirement: User can pause and resume Pomodoro session
The system SHALL allow users to temporarily halt timer and resume from same position.

#### Scenario: Pause active session
- **WHEN** user clicks "Pause" during active timer
- **THEN** timer stops, "Resume" button becomes available

#### Scenario: Resume paused session
- **WHEN** user clicks "Resume" on paused timer
- **THEN** timer resumes from paused time

### Requirement: User can skip to break or next session
The system SHALL allow users to end current session immediately and proceed to next phase.

#### Scenario: Skip to break
- **WHEN** user clicks "Skip to Break" during focus session
- **THEN** current session ends, system transitions to break timer (default 5 minutes)

#### Scenario: Skip focus session
- **WHEN** user clicks "Skip Session" during break
- **THEN** break ends, system displays option to start new Pomodoro

### Requirement: User can configure Pomodoro preferences
The system SHALL allow users to set default session durations and break lengths via preferences dialog.

#### Scenario: Update session duration
- **WHEN** user sets focus duration to 30 minutes in preferences
- **THEN** next Pomodoro session uses 30-minute default

#### Scenario: Update break duration
- **WHEN** user sets break duration to 10 minutes in preferences
- **THEN** next break uses 10-minute default
