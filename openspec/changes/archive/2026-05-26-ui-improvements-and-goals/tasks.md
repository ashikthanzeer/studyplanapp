## 1. Database & Backend

- [x] 1.1 Create a migration to drop the `kanban_columns` and `kanban_column_tasks` tables.
- [x] 1.2 Remove Kanban routes, controllers, and services from the backend API.
- [x] 1.3 Create endpoints to set and update productivity goals (target hours).
- [x] 1.4 Update the statistics endpoints in `pomodoroController.ts` to compute and return the previous day's and previous week's focus hours alongside current metrics.

## 2. Kanban Removal (Frontend)

- [x] 2.1 Delete `KanbanBoard.tsx` and its related types/services.
- [x] 2.2 Remove Kanban routing from `App.tsx` and links from `Sidebar.tsx`.
- [x] 2.3 Remove Kanban default view options from Profile Settings.

## 3. Productivity Goals

- [x] 3.1 Create a UI component to define and update Productivity Goals (e.g., in `ProfileSettings.tsx` or a dedicated goals section).
- [x] 3.2 Wire the UI to the backend to fetch and save goal targets.

## 4. Dashboard Enhancements

- [x] 4.1 Update the "Focus Today" and "Focus This Week" widgets in `Dashboard.tsx` to display previous period comparisons. (more/less) compared to the previous day/week.
- [x] 4.2 Integrate the defined productivity goals into the dashboard progress indicators.
- [x] 4.3 Update the Badges Gallery to map through all available badges and render unearned badges with reduced opacity, grayscale, and a lock icon overlay.

## 5. UI Polish & Fixes

- [x] 5.1 Update the Weekly Focus Activity chart to calculate and display the week starting from Monday (instead of Tuesday).
- [x] 5.2 Standardize dropdown menu styles across Tasks Planner, Focus Timer, and History windows to use unified, polished Tailwind classes.
- [x] 5.3 Fix the "Add New Task" modal in `TaskList.tsx` and `SubjectsManager.tsx` to be perfectly centered vertically and horizontally on the screen with a blurred backdrop (`backdrop-blur`).
