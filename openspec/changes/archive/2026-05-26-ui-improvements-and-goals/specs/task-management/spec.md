## MODIFIED Requirements

### Requirement: Task creation modal is visually centered with a blurred background
The system SHALL display the task creation interface as a modal overlay perfectly centered in the viewport, blurring the background behind it.

#### Scenario: Open task creation modal
- **WHEN** the user triggers the "Add New Task" action
- **THEN** the system SHALL perfectly center the creation modal vertically and horizontally on the screen, overlay it above all content, and apply a backdrop blur effect (e.g., `backdrop-filter: blur(8px)`) to the background content
