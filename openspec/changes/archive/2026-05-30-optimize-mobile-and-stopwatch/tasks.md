## 1. Mobile Styling Optimizations

- [x] 1.1 Update App.css sidebar rules under media query max-width 1024px to enable overflow vertical scrolling
- [x] 1.2 Update App.css mobile-header rules to increase top padding to 24px and adjust main-content top padding to 80px

## 2. Direct Android App Download

- [x] 2.1 Copy the target APK file from host Downloads folder to frontend/public/study-planner.apk
- [x] 2.2 Update Sidebar.tsx to use local /study-planner.apk download link with browser download attribute
- [x] 2.3 Update Auth.tsx to use local /study-planner.apk download link with browser download attribute

## 3. Focus Stopwatch Integration

- [x] 3.1 Modify FocusTimer.tsx state to support focusMode (timer/stopwatch) and render a premium toggle switcher
- [x] 3.2 Add Stopwatch UI display (matching the mobile layout style) and controls (Start, Pause, Resume, Stop, Reset)
- [x] 3.3 Implement persistence hooks in FocusTimer.tsx to save and restore active/paused stopwatch states in localStorage
- [x] 3.4 Hook the Stop action of the stopwatch to start and complete a Pomodoro session on the database for durations >= 1 min
