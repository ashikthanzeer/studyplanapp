## ADDED Requirements

### Requirement: Application settings and windows are mobile-friendly
The settings window, forms, and general user preferences interface SHALL be responsive and adapt to mobile devices.

#### Scenario: View settings on mobile
- **WHEN** the user opens the settings window on a mobile screen (width < 768px)
- **THEN** the system SHALL display settings items in a single-column scrollable container with touch-friendly input sizes and spacing

## MODIFIED Requirements

### Requirement: User profile stores personalized study preferences
The system SHALL persist user preferences for Pomodoro durations, notification settings, and UI preferences.

#### Scenario: Save Pomodoro preferences
- **WHEN** user sets focus duration to 30 min and break to 10 min
- **THEN** system saves preferences and applies to all future sessions

#### Scenario: Save UI theme preference
- **WHEN** user selects "Dark Mode" in preferences
- **THEN** the system SHALL store the preference in both the local storage and database, and apply the theme instantly without reloading the page
