## Context

The study planner website requires styling and functionality updates to optimize layout and feature alignment with the mobile app:
1. The mobile view of the sidebar overlay has height constraints that push crucial actions (Sign Out, Profile, Android download button) off-screen without scrolling support. The mobile header coincides too closely with the top viewport boundaries.
2. The web application's Focus Studio has only the Pomodoro Timer, whereas the mobile React Native application has been updated with a Stopwatch that logs sessions of 1 minute or longer to the backend.
3. The "Download for Android" button currently redirects users to an external Expo build url. Direct download of the compiled APK on the system is requested.

## Goals / Non-Goals

**Goals:**
- Enable vertical scrolling (`overflow-y: auto`) on the mobile sidebar overlay to ensure all buttons and info widgets are accessible.
- Introduce extra vertical spacing at the top of the mobile header to prevent overlapping viewport notches/status bars.
- Implement the "Stopwatch" focus mode in the React frontend, matching the state flow and UI styling of the mobile React Native screen.
- Persist stopwatch progress and active states in `localStorage`.
- Support direct download of the APK file (`C:\Users\ashik_rqf6ipg\Downloads\application-f5b866d0-7e45-460f-97c0-62da8073afb5.apk`) by hosting it in the Vite public directory.

**Non-Goals:**
- Creating new backend API endpoints (we will reuse the existing Pomodoro start/complete endpoints).
- Implementing task association for the stopwatch (in accordance with the mobile app's behavior).

## Decisions

### Decision 1: Mobile Sidebar Scrollability
- **Option A**: Reorganize mobile sidebar elements to fit without scrolling.
- **Option B**: Add `overflow-y: auto` to `.sidebar` under the responsive media query.
- **Chosen**: **Option B**. On smaller screens, overflow is inevitable. Adding vertical overflow scrolling guarantees all buttons (including logout) are reachable regardless of the device height.

### Decision 2: Spacing on Mobile Viewport Header
- **Decision**: Increase `.mobile-header` top padding to `24px` and set padding-top of `.main-content` to `80px` (under `max-width: 1024px` media query) to resolve top alignment and notch spacing issues.

### Decision 3: Direct APK Download
- **Decision**: Copy the host APK file to `frontend/public/study-planner.apk` and update the download links in `Auth.tsx` and `Sidebar.tsx` to `href="/study-planner.apk"` with `download="study-planner.apk"`. This serves the file statically from the Vite dev/prod server and triggers browser download behavior immediately.

### Decision 4: Stopwatch State Management
- **Decision**: Add `focusMode` state (`'timer' | 'stopwatch'`) to `FocusTimer.tsx` and manage the stopwatch state using `stopwatchTime`, `stopwatchStartTime`, `stopwatchIsActive`, and `stopwatchIsPaused`.
- State persistence: Save/restore stopwatch state in `localStorage` as `stopwatch_timer_state` to prevent reset on tab reload.
- Save to DB: Upon stopping the stopwatch, calculate `elapsedMinutes = Math.floor(stopwatchTime / 60)`. If `elapsedMinutes >= 1`, invoke `startPomodoroSession({ duration_minutes: elapsedMinutes })` followed by `completePomodoroSession(activeSessionId)` to log the session in the backend.

## Risks / Trade-offs

- **[Risk]**: The APK file is around 102MB, which increases static bundle assets.
  - **Mitigation**: This is acceptable for local development and direct distribution environments where the application serves as a standalone server.
