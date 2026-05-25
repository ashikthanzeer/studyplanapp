# rewards-system Specification

## Purpose
TBD - created by archiving change feature-enhancements. Update Purpose after archive.
## Requirements
### Requirement: System SHALL track user's consecutive study streaks
The system SHALL monitor and record the user's daily study streak, awarding streak badges upon reaching specific milestones.

#### Scenario: Study streak starts
- **WHEN** a user completes their first Pomodoro session of the day
- **THEN** the system increments the user's active streak by 1 and records the activity timestamp

#### Scenario: Study streak milestone reached
- **WHEN** the user's active daily streak reaches a milestone of 5, 10, 25, 50, 75, 100, 150, 200, 250, or 300 days
- **THEN** the system SHALL unlock the corresponding streak badge and notify the user

#### Scenario: Study streak resets
- **WHEN** a user does not complete any study sessions for a calendar day
- **THEN** the system resets the active streak to 0

### Requirement: System SHALL award daily focus time milestone badges
The system SHALL record the user's total daily study hours and unlock daily record badges for reaching focus milestones of 8, 10, 12, 14, or 15 hours in a single day.

#### Scenario: Unlock daily hours milestone badge
- **WHEN** the user's total study hours on a single day reach 8 hours
- **THEN** the system SHALL unlock the "8-Hour Focus" badge

#### Scenario: Award duplicate daily record badge
- **WHEN** the user achieves a daily focus milestone (e.g., 8 hours) they have already achieved before
- **THEN** the system SHALL increment the count of times that badge has been earned rather than creating a new badge entry

### Requirement: System SHALL compute progression level based on total badges earned
The system SHALL calculate the student's overall level rank (Bronze, Silver, Gold, Platinum, Diamond) dynamically based on the total number of badges they have earned (including duplicate badge completions).

#### Scenario: Calculate student rank level
- **WHEN** the system calculates the user's level based on badges:
  - 0 to 2 badges: Bronze level
  - 3 to 5 badges: Silver level
  - 6 to 10 badges: Gold level
  - 11 to 19 badges: Platinum level
  - 20 or more badges: Diamond level
- **THEN** the system SHALL display the correct badge level badge/text on the user's profile and dashboard

