## Why

Students need a more engaging, responsive, and intuitive study planning tool to stay motivated and manage their studies effectively. Persisting user preferences (dark mode), separating subject management from settings, improving mobile responsiveness, centering key user flows like task creation, and introducing a streak/badge-based gamification reward model will significantly improve user engagement and productivity tracking.

## What Changes

1. **Dark Mode Persistence**: Save the user's theme selection locally in `localStorage` and sync with user preferences to avoid theme flickering on reload.
2. **Dedicated Subject Management**: Remove the subject creation UI from Settings and create a dedicated "Subjects" dashboard view or workspace section. Users will be able to create, view, color-code, and delete subjects, as well as view all tasks assigned to a specific subject.
3. **Mobile-Responsive UI**: Redesign and optimize all application panels for mobile screens, with a particular focus on the Settings overlay/panel, dashboard layout, and navigation.
4. **Enhanced Dashboard Metrics**: Display the number of study/focus hours completed "Today" and "This Week" in a visually appealing card.
5. **Polished Task Creation Modal**: Center the "Add New Task" dialog on the screen and apply a backdrop blur (`backdrop-filter: blur(...)`) to improve focus and visual appeal.
6. **Gamification & Rewards Model**: Introduce a point-based and badge-based progression system:
   - **Streaks Badges**: Awarded for continuous focus days (5, 10, 25, 50, 75, 100, 150, 200, 250, 300 days).
   - **Daily Study Milestones**: Awarded for total focus hours in a single day (8, 10, 12, 14, 15 hours). Includes a counter for badges earned multiple times.
   - **Level Progression**: Calculate a point score based on badges and focus hours, moving students through ranks: Bronze, Silver, Gold, Platinum, Diamond.

## Capabilities

### New Capabilities
- `rewards-system`: Tracks focus streaks, daily study hour records, awards corresponding badges (with counts for multiple achievements), and dynamically calculates level ranks (Bronze to Diamond) based on points earned from study activity.
- `subject-management`: Provides a dedicated space to add, view, color-customize, and delete subjects, and filters/displays tasks grouped by subject.

### Modified Capabilities
- `dashboard`: Modified to show study hours for "Today" and the "Current Week", alongside displaying current badges and the gamification level/rank.
- `task-management`: The task creation interface will be redesigned into a centered, background-blurred modal.
- `student-profiles`: Extended to handle dark mode preference selection, persistence, and synchronization.
- `time-tracking`: Updated to aggregate and expose daily and weekly focus hours for dashboard widgets and reward trigger evaluations.

## Impact

* **Frontend**: UI updates to dashboard layouts, creation of a new Subject Management panel, redesign of the Task Creation modal, adding backdrop blur CSS, local storage handling for theme state, responsive CSS adjustments for mobile, and a new Rewards/Badges page/widget.
* **Backend**:
  * New APIs/routes or db columns to store/retrieve badge status, earned badge counts, and user streak counts.
  * DB schema updates to support badge definitions, user-earned badges, and tracking points/ranks.
  * API endpoints to fetch gamification stats (streaks, badges, levels).
* **Database**: New tables (`badges`, `user_badges`) or schema changes in `users`/`user_preferences` to persist streak milestones, badge counts, and overall level scores.
