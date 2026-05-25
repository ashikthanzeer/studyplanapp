## Why

We need to refine the user interface based on user feedback to improve usability, tracking, and motivation. This change polishes dashboard metrics, unifies visual consistency, adds goal updating capabilities, and removes unnecessary features (Kanban) to streamline the study planner.

## What Changes

- Add an option to update Productivity Goals.
- Update the Focus Today and Focus This Week dashboard widgets to indicate how much more or less the student has studied compared to the previous day/week.
- Update the Earned Badges & Trophies gallery to show locked badges with reduced brightness and a lock icon to motivate students.
- **BREAKING**: Completely remove the Kanban Board feature as it is no longer needed.
- Unify dropdown menu styles in the Tasks Planner, Focus Timer, and History windows to match the website's overall aesthetic.
- Fix the new Task input window modal to ensure it is perfectly centered in the screen.
- Adjust the Weekly Focus Activity chart to start the week on Monday instead of Tuesday.

## Capabilities

### New Capabilities
- `productivity-goals`: Allow users to set, view, and update their productivity goals.

### Modified Capabilities
- `dashboard`: Update focus widgets to include comparison metrics (previous day/week).
- `rewards-system`: Display locked badges in the gallery instead of only unlocked ones.
- `kanban-board`: **DELETED** Remove the entire Kanban Board feature and its requirements.
- `task-management`: Enforce strict visual centering requirement for the task creation modal.
- `time-tracking`: Update weekly chart boundaries to start on Monday.

## Impact

- **Frontend**: Dashboard widgets, Badges Gallery, Modals, Dropdowns, and Routing (Kanban removal).
- **Backend**: Removal of Kanban endpoints, additions for fetching previous day/week study times.
- **Database**: Removal of `kanban_columns` and `kanban_column_tasks` tables (cleanup).
