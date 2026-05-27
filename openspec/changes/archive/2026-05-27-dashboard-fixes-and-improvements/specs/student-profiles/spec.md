## MODIFIED Requirements

### Requirement: User can view profile summary
The system SHALL display student profile information including name, subjects, and account creation date. Clicking on the Profile avatar/DP or name at the bottom of the navigation menu SHALL redirect the user to the Profile section in settings.

#### Scenario: View profile overview
- **WHEN** user clicks profile icon in navigation
- **THEN** system displays profile card with name, subjects, total study time, and account info

#### Scenario: Click sidebar profile shortcut
- **WHEN** the user clicks the Profile avatar/DP or name at the bottom of the navigation menu
- **THEN** the system SHALL redirect the user to the Profile section in settings

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
