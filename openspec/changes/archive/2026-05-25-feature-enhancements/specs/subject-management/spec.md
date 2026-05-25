## ADDED Requirements

### Requirement: System SHALL provide a dedicated Subject Management panel
The system SHALL display a standalone section or page in the application (outside of the general settings window) to manage study subjects.

#### Scenario: View dedicated Subjects view
- **WHEN** the user navigates to the "Subjects" section of the application
- **THEN** the system displays all registered subjects, their colored tags, and a summary of tasks associated with each subject

### Requirement: User can add and delete subjects
The system SHALL allow users to create new subjects with names and custom colors, and delete existing ones.

#### Scenario: Create new subject with color
- **WHEN** the user clicks "Add Subject", enters a name (e.g., "Physics"), selects a color tag (e.g., "#00FF00"), and clicks save
- **THEN** the system saves the subject and lists it immediately on the Subjects screen

#### Scenario: Delete a subject
- **WHEN** the user clicks delete on an existing subject and confirms
- **THEN** the system removes the subject from the subjects database (existing tasks associated with this subject remain but are marked as unassigned)

### Requirement: User can view all tasks associated with a specific subject
The system SHALL allow users to click on any subject in the Subjects view to see a filtered list of all active and completed tasks for that subject.

#### Scenario: Filter tasks by clicking a subject
- **WHEN** the user clicks on the "Math" subject tag in the Subjects view
- **THEN** the system navigates to or opens a list showing only tasks associated with the "Math" subject
