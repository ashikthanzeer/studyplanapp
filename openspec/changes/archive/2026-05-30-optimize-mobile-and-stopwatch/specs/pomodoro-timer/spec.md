## ADDED Requirements

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
