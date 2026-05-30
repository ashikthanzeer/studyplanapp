## Why

1. On mobile viewports, the sidepanel is not scrollable which renders the bottom profile options and "Sign Out" button unreachable when the viewport height is small. Additionally, the mobile header coincides with the very top tip of the page on mobile viewports, requiring extra top spacing for optimal styling and device compatibility.
2. The Focus Studio needs a "Stopwatch" mode alongside the Pomodoro Timer to let users track their focus hours continuously, matching the behavior already present in the mobile application.
3. The "Download for Android" button should directly serve and download the app's APK file locally rather than navigating to an external Expo builds page.

## What Changes

- Add custom styling to make the mobile sidebar scrollable (`overflow-y: auto`) and optimize spacing for various devices.
- Increase top padding on the mobile header and main content viewport on mobile devices to prevent coinciding with the top edge of mobile viewports.
- Extend the Focus Studio timer view with a tab selector for switching between the Pomodoro Timer and a new Focus Stopwatch.
- Implement the Focus Stopwatch with controls (Start, Pause, Resume, Stop, Reset) and automatically log completed sessions (sessions of 1 minute or longer) to the backend database upon stopping.
- Store/restore the stopwatch state (active, paused, elapsed time) using `localStorage` to ensure persistence across tab closures.
- Copy the target APK file to the static public folder and update the "Download for Android" links in the authentication page and sidebar to directly download it using the browser download attribute.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `mobile-sidebar-navigation`: Introduce scrolling support for the sidebar drawer and adjust top padding/spacing for the mobile header.
- `pomodoro-timer`: Integrate a Stopwatch tracking module in Focus Studio alongside the Pomodoro Timer, syncing with the database backend for sessions of 1 minute or longer.
- `android-app-download`: Provide a direct download button for the local Android APK file (`application-f5b866d0-7e45-460f-97c0-62da8073afb5.apk`).

## Impact

- **Frontend CSS (`App.css`, `index.css`)**: Media query tweaks for mobile layouts.
- **Frontend Components (`Sidebar.tsx`, `Auth.tsx`, `FocusTimer.tsx`)**: Adding stopwatch UI/logic, modifying download links.
- **Backend**: None, utilizes existing Pomodoro session start and complete endpoints.
