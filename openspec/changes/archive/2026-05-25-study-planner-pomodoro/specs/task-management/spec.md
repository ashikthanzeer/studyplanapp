## ADDED Requirements

### Requirement: User can create a new task
The system SHALL allow students to create tasks with title, description, due date, and priority level.

#### Scenario: Create task with required fields
- **WHEN** user fills in task title and clicks "Create Task"
- **THEN** system creates task with default priority and no due date assigned

#### Scenario: Create task with all fields
- **WHEN** user enters title, description, due date (tomorrow), and sets priority to "High"
- **THEN** system creates task with all specified attributes

### Requirement: User can view all tasks
The system SHALL display a list view of all user tasks with title, due date, priority, and status visible.

#### Scenario: View empty task list
- **WHEN** new user navigates to task list
- **THEN** system displays "No tasks yet" message with option to create first task

#### Scenario: View populated task list
- **WHEN** user has existing tasks
- **THEN** system displays all tasks sorted by due date (earliest first)

### Requirement: User can update task details
The system SHALL allow users to modify task title, description, due date, and priority after creation.

#### Scenario: Edit task title
- **WHEN** user clicks task and modifies title text
- **THEN** system updates task title immediately on save

#### Scenario: Change task priority
- **WHEN** user changes task priority from Low to High
- **THEN** system updates priority and re-sorts task list

### Requirement: User can mark task as complete
The system SHALL allow users to change task status from "To Do" to "Done".

#### Scenario: Complete a task
- **WHEN** user clicks checkbox on task or "Mark Complete" button
- **THEN** system marks task as complete and moves it to Done column/section

#### Scenario: Reopen completed task
- **WHEN** user clicks checkbox on completed task
- **THEN** system returns task to "To Do" status

### Requirement: User can delete tasks
The system SHALL allow users to remove tasks with confirmation prompt.

#### Scenario: Delete task
- **WHEN** user clicks delete icon and confirms deletion
- **THEN** system permanently removes task from task list

### Requirement: User can filter and search tasks
The system SHALL support filtering tasks by priority, due date, or subject, and text search by title/description.

#### Scenario: Filter by priority
- **WHEN** user selects "High" priority filter
- **THEN** system displays only High priority tasks

#### Scenario: Search by text
- **WHEN** user types "assignment" in search box
- **THEN** system shows only tasks with "assignment" in title or description

### Requirement: User can organize tasks by subject
The system SHALL allow assigning tasks to subjects or categories (e.g., Math, Biology, English).

#### Scenario: Assign task to subject
- **WHEN** user creates task and selects "Math" as subject
- **THEN** task is labeled with Math subject and filterable by subject
