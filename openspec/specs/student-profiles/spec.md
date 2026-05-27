# student-profiles Specification

## Purpose
TBD - created by archiving change study-planner-pomodoro. Update Purpose after archive.
## Requirements
### Requirement: User can create and manage student profile
The system SHALL allow each student to create a profile with name, email, subjects, and study preferences.

#### Scenario: Create new profile
- **WHEN** new user registers with name and email
- **THEN** system atomically creates the user account, initializes the student profile, saves default study preferences, and provisions default Kanban columns

### Requirement: User profile stores personalized study preferences
The system SHALL persist user preferences for Pomodoro durations, notification settings, and UI preferences.

#### Scenario: Save Pomodoro preferences
- **WHEN** user sets focus duration to 30 min and break to 10 min
- **THEN** system saves preferences and applies to all future sessions

#### Scenario: Save UI theme preference
- **WHEN** user selects "Dark Mode" in preferences
- **THEN** the system SHALL store the preference in both the local storage and database, and apply the theme instantly without reloading the page

### Requirement: User can view profile summary
The system SHALL display student profile information including name, subjects, and account creation date. Clicking on the Profile avatar/DP or name at the bottom of the navigation menu SHALL redirect the user to the Profile section in settings.

#### Scenario: View profile overview
- **WHEN** user clicks profile icon in navigation
- **THEN** system displays profile card with name, subjects, total study time, and account info

#### Scenario: Click sidebar profile shortcut
- **WHEN** the user clicks the Profile avatar/DP or name at the bottom of the navigation menu
- **THEN** the system SHALL redirect the user to the Profile section in settings

### Requirement: User can upload profile picture
The system SHALL allow student to upload and store a profile avatar image.

#### Scenario: Upload profile picture
- **WHEN** user clicks "Upload Photo" and selects image file
- **THEN** system stores image and displays as avatar throughout interface

### Requirement: System tracks student study goals
The system SHALL allow students to set study goals (e.g., "2 hours Math per week", "Complete all assignments by Friday"). Clicking on the Productivity Goals panel in the dashboard SHALL redirect the user to the Productivity Goals section in settings.

#### Scenario: Set weekly study goal
- **WHEN** user enters "Study 10 hours this week" as goal
- **THEN** system stores goal and tracks progress against it

#### Scenario: View goal progress
- **WHEN** user checks dashboard
- **THEN** system displays progress toward current study goals (e.g., "7/10 hours completed")

#### Scenario: Click productivity goals shortcut
- **WHEN** the user clicks on the Productivity Goals panel in the dashboard
- **THEN** the system SHALL redirect the user to the Productivity Goals section in the settings page

### Requirement: User can manage multiple study subjects
The system SHALL allow students to add, remove, or update list of subjects they are studying.

#### Scenario: Add new subject
- **WHEN** user clicks "Add Subject" and enters "Chemistry"
- **THEN** system adds Chemistry to profile and enables filtering by this subject

#### Scenario: Remove subject
- **WHEN** user removes "History" from subject list
- **THEN** system removes subject from profile (existing tasks with this subject remain but are unassigned)

### Requirement: System maintains learning preferences
The system SHALL track user preferences for break timing, notification verbosity, and task view preferences.

#### Scenario: Save task view preference
- **WHEN** user switches from List view to Kanban board view
- **THEN** system remembers this preference and opens Kanban view by default next session

### Requirement: Application settings and windows are mobile-friendly
The settings window, forms, and general user preferences interface SHALL be responsive and adapt to mobile devices.

#### Scenario: View settings on mobile
- **WHEN** the user opens the settings window on a mobile screen (width < 768px)
- **THEN** the system SHALL display settings items in a single-column scrollable container with touch-friendly input sizes and spacing

