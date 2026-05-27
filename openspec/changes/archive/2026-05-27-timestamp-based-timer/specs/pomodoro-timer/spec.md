## MODIFIED Requirements

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
