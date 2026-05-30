# pomodoro-timer Specification

## Purpose
TBD - created by archiving change study-planner-pomodoro. Update Purpose after archive.
## Requirements
### Requirement: User can start a Pomodoro session
The system SHALL provide a timer interface where users can initiate a Pomodoro focus session. Default duration is 25 minutes, configurable by user preference (15-50 minutes). The countdown SHALL be calculated based on the difference between the absolute current timestamp and a target end timestamp, ensuring the timer counts down correctly even if the device sleeps or the browser tab is suspended.

#### Scenario: Start default Pomodoro session
- **WHEN** user clicks "Start Pomodoro" button with default settings
- **THEN** system displays countdown timer showing 25:00 and begins counting down based on absolute elapsed time

#### Scenario: Start custom duration session
- **WHEN** user sets custom duration to 20 minutes and clicks "Start"
- **THEN** system displays countdown starting at 20:00 based on absolute elapsed time

### Requirement: User receives notification when Pomodoro session ends
The system SHALL trigger a notification when the focus session timer reaches zero. If the device was asleep or the tab was suspended when the timer reached zero, the system SHALL trigger the completion notification and transition state immediately upon wake-up.

#### Scenario: Focus session expires
- **WHEN** Pomodoro timer counts down to 00:00 (or is detected to have expired upon device wake-up)
- **THEN** system displays completion notification and automatically starts break countdown

#### Scenario: Break session expires
- **WHEN** break timer counts down to 00:00 (or is detected to have expired upon device wake-up)
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

### Requirement: Toggle Focus Studio modes
The Focus Studio interface SHALL provide a mode toggle to switch between Pomodoro Timer and Focus Stopwatch. The mode cannot be toggled while either timer or stopwatch is actively running.

#### Scenario: Switch Focus Studio mode to Stopwatch
- **WHEN** the timer is inactive and the user clicks the "Focus Stopwatch" tab
- **THEN** the Focus Studio transitions to Stopwatch mode and displays the stopwatch interface

### Requirement: Focus Stopwatch controls
The Focus Stopwatch SHALL allow users to start, pause, resume, and reset. The elapsed time SHALL count up starting from zero and be persistent using localStorage, so that page reloads do not reset the active stopwatch state.

#### Scenario: Start and pause the stopwatch
- **WHEN** the user is in Stopwatch mode and clicks "Start Stopwatch"
- **THEN** the stopwatch begins counting up, and when the user clicks "Pause", the elapsed time freezes and remains persistent

### Requirement: Save Stopwatch session on stop
When the user stops the Focus Stopwatch, the system SHALL check if the elapsed time is at least 1 minute. If it is 1 minute or longer, the system SHALL automatically create and complete a focus session on the backend. If it is shorter than 1 minute, the session SHALL be cancelled and not saved.

#### Scenario: Stop stopwatch with more than 1 minute elapsed
- **WHEN** the stopwatch has run for 75 seconds and the user clicks "Stop"
- **THEN** the system SHALL call the backend to start and complete a focus session of 1 minute, display a success message, and reset the stopwatch

