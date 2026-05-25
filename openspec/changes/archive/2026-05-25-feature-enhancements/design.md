## Context

The Study Planner app is a full-stack React + TypeScript + Express + PostgreSQL application. Currently, it lacks robust gamification, mobile layout optimizations, a dedicated subjects section, and persistent theme controls. 

This design establishes a scalable approach to:
1. Support gamification by introducing streak tracking and milestone badge achievements.
2. Separate subject management into a dedicated interface.
3. Optimize modals and panels for mobile responsiveness and modern aesthetics.
4. Calculate and display today's and current week's total study hours.

## Goals / Non-Goals

**Goals:**
* Save and apply Dark Mode preferences instantly from `localStorage`, syncing to the backend preferences database asynchronously.
* Build a dedicated "Subjects" dashboard view where users can add, color-code, delete, and view tasks categorized by subject.
* Make all layout components mobile-responsive, particularly the settings panel and sidebar.
* Display Today's and Current Week's study/focus hours on the dashboard.
* Update the "Add New Task" window to be centered and have a backdrop blur overlay.
* Implement a rewards system with streak tracking, daily hour record milestones, badge accumulation, and level ranking (Bronze to Diamond).

**Non-Goals:**
* Real-time notifications for badges (badge updates will trigger on completing a focus session and display in the next statistics or dashboard fetch).
* Social sharing of badges.
* Complex multiplayer leaderboard systems.

## Decisions

### 1. Database Schema Additions for Gamification
To track streaks and badge achievements without overloading the existing tables, we will introduce two new database tables:

* **Table `user_streaks`**:
  ```sql
  CREATE TABLE user_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
* **Table `user_badges`**:
  ```sql
  CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    count INTEGER DEFAULT 1,
    last_earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_name)
  );
  ```

*Alternative Considered*: Store badges as a JSON array inside the `user_preferences` table. 
*Decision Rationale*: Having a separate table for `user_badges` allows keeping track of counts when a user earns the same badge multiple times (e.g., getting the "8-Hour Focus" badge multiple times) and enables easy database queries for stats.

### 2. Gamification Logic Trigger
Badges and streaks will be evaluated and updated in the backend **only** when a Pomodoro focus session is successfully completed (status = 'completed').
* **Streak Update**: 
  - Compare the current date with `last_activity_date` in `user_streaks`.
  - If `last_activity_date` is the day before today: `current_streak` increments by 1.
  - If `last_activity_date` is today: streak remains the same.
  - If `last_activity_date` is older than yesterday or null: `current_streak` resets/starts at 1.
  - Check if `current_streak` matches any milestone: 5, 10, 25, 50, 75, 100, 150, 200, 250, 300 days. If yes, unlock the streak badge.
* **Daily Hours Milestones**:
  - Sum the duration of all completed Pomodoro sessions for the user today.
  - If the sum matches or exceeds 8, 10, 12, 14, or 15 hours, check if the badge for that milestone has already been earned today (to prevent multiple awards in one day). If not, award or increment the count of that daily record badge.
* **Level/Rank Computation**:
  - Dynamically calculate the level during API request based on the sum of all earned badges:
    - 0 to 2 badges: Bronze level
    - 3 to 5 badges: Silver level
    - 6 to 10 badges: Gold level
    - 11 to 19 badges: Platinum level
    - 20+ badges: Diamond level

### 3. Dedicated Subject Management View
* Remove the "Add Subject" control from Settings modal.
* Create a new "Subjects" view on the frontend that displays:
  - All existing subjects with their color tags.
  - An inline or dialog creation form to create a new subject (requires subject name, color).
  - List of active/completed tasks filtered for that subject.
* Update backend `/api/subjects` endpoints to fetch tasks count for each subject.

### 4. Centered & Blurred Add Task Modal
* Create a reusable React `<Modal>` component with backdrop blur styles.
* CSS rules:
  ```css
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(15, 23, 42, 0.4); /* Tailwind Slate-900 / dark alpha */
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    width: 100%;
    max-width: 500px;
    padding: 1.5rem;
    animation: scaleUp 0.2s ease-out;
  }
  ```

### 5. Hours Studied Calculation
Add queries to `/api/pomodoro/stats` (or a dedicated route) to retrieve:
* **Today's Hours**: Sum of all `duration_minutes` for sessions ended today.
* **Current Week's Hours**: Sum of all `duration_minutes` for sessions ended between Monday and Sunday of the current week.

## Risks / Trade-offs

* **[Risk]**: Timezones mismatch between server database and frontend client.
  - *Mitigation*: Store and query timestamps in UTC, and convert them to the user's local date/time representation on the frontend, or pass the client's timezone offset in the request headers when requesting statistics.
* **[Risk]**: Dark mode flickering if `localStorage` theme is read after the React app mounts.
  - *Mitigation*: Add a small blocking script in the `<head>` of `index.html` that reads `localStorage.getItem('theme')` and adds the appropriate class (e.g. `dark-mode`) to the `<html>` or `<body>` tag before rendering.
