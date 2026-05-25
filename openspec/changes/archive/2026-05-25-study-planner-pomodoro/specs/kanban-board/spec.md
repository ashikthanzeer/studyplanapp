## ADDED Requirements

### Requirement: User can view tasks in Kanban board format
The system SHALL display tasks as draggable cards organized into vertical columns representing workflow states.

#### Scenario: View board with default columns
- **WHEN** user navigates to Kanban board view
- **THEN** system displays three default columns: "To Do", "In Progress", "Done" with tasks arranged as cards

#### Scenario: View board with custom columns
- **WHEN** user has configured custom columns
- **THEN** system displays user-defined columns (e.g., "Backlog", "Current", "Completed", "Archived")

### Requirement: User can create custom board columns
The system SHALL allow users to create, rename, and reorder columns to match their workflow.

#### Scenario: Create new column
- **WHEN** user clicks "Add Column" and enters column name "Review"
- **THEN** system creates new column and adds it to the board

#### Scenario: Rename existing column
- **WHEN** user right-clicks column header and selects "Rename"
- **THEN** system allows editing column name with confirmation

#### Scenario: Reorder columns
- **WHEN** user drags column header to new position
- **THEN** system reorders columns and saves new arrangement

### Requirement: User can drag and drop tasks between columns
The system SHALL support moving tasks between columns via drag-and-drop interaction.

#### Scenario: Move task to In Progress
- **WHEN** user drags task card from "To Do" column and drops in "In Progress" column
- **THEN** system updates task status to "In Progress" and card appears in new column

#### Scenario: Move multiple tasks
- **WHEN** user drags multiple selected tasks to "Done" column
- **THEN** system moves all selected tasks to Done status

### Requirement: User can reorder tasks within columns
The system SHALL allow users to change task order within same column via drag-and-drop.

#### Scenario: Reorder tasks in column
- **WHEN** user drags task card up in same column
- **THEN** system reorders task within column maintaining new position

### Requirement: Task card displays essential information
The system SHALL show task title, due date, priority indicator, and subject badge on each card.

#### Scenario: View task card details
- **WHEN** user views Kanban board with tasks
- **THEN** each card displays task title, due date color-coded by urgency, priority indicator (High/Medium/Low), and subject badge

#### Scenario: View overdue indicator
- **WHEN** task due date has passed
- **THEN** task card displays red indicator or "Overdue" badge

### Requirement: User can click task card to view/edit details
The system SHALL open task detail view when user clicks task card.

#### Scenario: Open task details
- **WHEN** user clicks task card
- **THEN** system opens modal or sidebar showing full task details with edit option

### Requirement: User can filter Kanban board by subject or priority
The system SHALL allow users to show/hide cards based on subject or priority filters.

#### Scenario: Filter by subject
- **WHEN** user clicks "Math" in subject filter list
- **THEN** system displays only Math tasks on board, graying out other tasks or hiding them

#### Scenario: Filter by priority
- **WHEN** user selects "High" priority filter
- **THEN** board shows only High priority tasks
