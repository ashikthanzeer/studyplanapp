## Context

The application has recently introduced gamification and mobile optimizations. However, user feedback indicates that some features like the Kanban board are unnecessary and clutter the UI. Additionally, users want to set explicit productivity goals, compare their current study metrics to previous periods (day/week), and have a more consistent and polished UI (centered modals, consistent dropdowns, locked badges visibility). The weekly focus chart also currently misaligns with the standard Monday-Sunday week layout.

## Goals / Non-Goals

**Goals:**
- Implement a Productivity Goals system (setting and updating target hours).
- Enhance the dashboard widgets to compute and display differences (more/less) in study hours compared to the previous day and previous week.
- Update the rewards system UI to render locked badges distinctly with a lock icon.
- Fully remove the Kanban Board feature (frontend components, routing, and backend endpoints/tables).
- Standardize dropdown menus and modal positioning across the application.
- Shift the Weekly Focus Activity chart to start on Monday.

**Non-Goals:**
- Complete redesign of the application theme.
- Refactoring the entire database schema (only removing kanban tables).

## Decisions

- **Goal Tracking Storage**: Add a UI component to manage goals. The database already has a `study_goals` table, we will create endpoints in `profileController` or `gamificationService` to interact with it.
- **Metric Comparison**: The backend `pomodoroController.ts` will fetch the previous day's and previous week's study minutes in addition to the current ones. The frontend will compute the difference and display an up/down trend indicator.
- **Kanban Removal**: We will drop the `kanban_columns` and `kanban_column_tasks` tables via a new database migration. Frontend components `KanbanBoard.tsx` and related routes will be deleted.
- **Locked Badges**: The `badgesList` constant in the frontend will be used to map all possible badges. Badges that the user has not earned will be rendered with `opacity-50`, `grayscale`, and a lock icon overlay.
- **Dropdown Styling**: We will apply a unified Tailwind class set to all dropdown menus (e.g., standard padding, background color, rounded corners, hover effects) to replace custom, inconsistent styles.

## Risks / Trade-offs

- **Risk**: Deleting the Kanban tables might cause foreign key constraint errors if tasks are deeply coupled.
  - **Mitigation**: The `kanban_column_tasks` junction table uses `ON DELETE CASCADE`. Dropping the tables will safely remove the associations without deleting the actual tasks.
