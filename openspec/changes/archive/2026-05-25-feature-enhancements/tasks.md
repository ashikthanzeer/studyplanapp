## 1. Database Schema Migration

- [x] 1.1 Create migration SQL script for `user_streaks` and `user_badges` tables
- [ ] 1.2 Execute migration script to set up tables in local PostgreSQL database

## 2. Backend Implementation

- [x] 2.1 Implement utility function to evaluate and update user streaks in the database on completed focus session
- [x] 2.2 Implement utility function to aggregate daily focus time and award milestone badges
- [x] 2.3 Create API endpoint `GET /api/profile/gamification` to fetch streak, level, and badge counts
- [x] 2.4 Update backend `/api/pomodoro/stats` to aggregate and return focus hours for Today and the Current Week

## 3. Theme & Layout Adjustments

- [x] 3.1 Add inline `<head>` script in `index.html` to retrieve theme preference from `localStorage` and avoid style flickering
- [x] 3.2 Update theme selection state to write to `localStorage` and apply theme class instantly
- [x] 3.3 Define global CSS styling in `index.css` for centered modals and overlay backdrop filter blur
- [x] 3.4 Refactor task creation interface to use the backdrop-blurred modal component

## 4. Dedicated Subject Management View

- [x] 4.1 Remove subject addition components from settings window
- [x] 4.2 Implement new "Subjects" section page in the frontend router / main workspace layout
- [x] 4.3 Build UI to create, edit, delete, and color-code subjects in the Subjects view
- [x] 4.4 Implement list-filtering component in Subjects view to list and interact with tasks belonging to the active subject

## 5. Dashboard & Rewards UI

- [x] 5.1 Build dashboard widgets to display focus hours for Today and Current Week (from updated stats API)
- [x] 5.2 Create the Rewards showcase component on the dashboard displaying user levels (Bronze to Diamond) and streak counts
- [x] 5.3 Build the Badges Gallery component showing all earned badges and count indicator for duplicates

## 6. Mobile Responsiveness Optimization

- [x] 6.1 Re-style Settings panel with media queries to stack options vertically on screens < 768px wide
- [x] 6.2 Increase interactive target sizes (margins, paddings, fonts) on mobile for forms and buttons
- [x] 6.3 Update navigation sidebar to toggle collapse or display as bottom-navigation on mobile layouts
