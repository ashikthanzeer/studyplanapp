## 1. Dropdown Style Fix

- [x] 1.1 Add style rules for option elements in `.form-select` in `index.css` to respect the theme background and text colors

## 2. Navigation & Redirect Updates

- [x] 2.1 Update the `onViewChange` handler type in `App.tsx` and components to accept an optional tab string, and track the active settings tab
- [x] 2.2 Support `initialTab` inside `ProfileSettings.tsx` to switch settings section automatically
- [x] 2.3 Make the Productivity Goals card in `Dashboard.tsx` and the bottom profile section in `Sidebar.tsx` clickable to navigate to their respective settings sections

## 3. Focus Stats History Popups

- [x] 3.1 Implement history aggregation logic in `Dashboard.tsx` to retrieve and format completed focus hours
- [x] 3.2 Build and render a premium comparison modal overlay in `Dashboard.tsx` displaying the past 7 days or 4 weeks
- [x] 3.3 Attach click handlers to the Focus Today and Focus This Week cards on the dashboard to open these modals
