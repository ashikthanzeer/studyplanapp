## Why

Provide users of the StudyPlanner website with direct access to download the Android app build, making it easy to transition to or use the application on mobile devices.

## What Changes

- Add a "Download for Android" button containing the Android icon/symbol and linking to the Expo Android build download page: `https://expo.dev/accounts/ashikthanzeer/projects/study-planner/builds/8ec53be2-adb7-438d-8f3a-b9c2809d293f`.
- Include the download button in the login/registration page (`Auth.tsx`) under the authentication card so anonymous visitors and new users can access it.
- Include the download button in the application sidebar (`Sidebar.tsx`) above the profile section so logged-in users have a permanent way to find and download the app.
- Style the buttons to blend seamlessly with the current premium theme (supporting light and dark modes, hover states, and smooth transitions).

## Capabilities

### New Capabilities
- `android-app-download`: Provides users with a clear and styled link/button to download the Android app from both authenticated and unauthenticated views.

### Modified Capabilities

## Impact

- Frontend: `Auth.tsx` and `Sidebar.tsx` will be modified.
- Styles: Component styles or `App.css`/`index.css` will be updated to support the new button and icon layout.
