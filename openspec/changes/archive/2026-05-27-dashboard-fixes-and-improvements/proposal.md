## Why

1. **Dark Mode Select Styling**: The option elements of the dropdown selectors have incorrect text/background combinations in dark mode, rendering them unreadable. Styling them correctly ensures a cohesive premium dark mode experience.
2. **Dashboard Focus Comparison Popups**: Users need to see and compare focus stats over time to keep track of their goals. Making "Focus Today" and "Focus This Week" panels interactive with details of the past 7 days and 4 weeks will improve the analytical experience.
3. **Shortcut Redirects**: The "Productivity Goals" panel on the dashboard and the bottom Profile section on the sidebar currently lack interactive navigation. Redirecting them directly to their corresponding settings sections will improve usability.

## What Changes

- Add a dark theme style override in `index.css` for custom dropdown options.
- Add click handlers to the "Focus Today" and "Focus This Week" cards to launch a premium glassmorphic comparison modal.
- Implement past 7 days / 4 weeks focus hour aggregations using the existing local history stats.
- Overload the `onViewChange` navigation function to accept an optional settings tab parameter.
- Make the "Productivity Goals" card and the bottom Profile section in the sidebar click-to-redirect to the correct Settings tabs.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `dashboard`: Modified to support interactive stats popups and redirect shortcuts for productivity targets.
- `student-profiles`: Modified to enable clicking the sidebar profile section to navigate directly to the settings profile edit screen.

## Impact

- `frontend/src/index.css`: Style override for select dropdown options.
- `frontend/src/App.tsx`: Manage sub-tab settings state and delegate to settings rendering.
- `frontend/src/components/Sidebar.tsx`: Add click handling to sidebar profile display.
- `frontend/src/components/Dashboard.tsx`: Add click handling, fetch historical data, and show past 7 days / 4 weeks comparison popups.
