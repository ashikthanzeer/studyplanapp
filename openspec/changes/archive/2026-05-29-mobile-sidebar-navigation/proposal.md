## Why

On mobile viewports, the application's left sidebar is completely hidden. Consequently, mobile web users cannot access the "Download for Android" button, user profile details, or the logout action. Making the sidebar toggleable (openable/closeable) on mobile resolves this.

## What Changes

- Implement an open/close toggle state for the sidebar in the frontend.
- Add a hamburger menu toggle button visible only on mobile screens to open the sidebar.
- Add a close button (and/or overlay backdrop tap handler) inside the sidebar visible only on mobile screens to dismiss the sidebar.
- Introduce responsive CSS styles to transition the sidebar from hidden off-screen to an active slide-in overlay on mobile devices.

## Capabilities

### New Capabilities
- `mobile-sidebar-navigation`: Provides mobile web users with the ability to open and close the sidebar navigation panel to access utilities (Android download, profile information, sign out) not present in the mobile bottom bar.

### Modified Capabilities

## Impact

- Frontend: `App.tsx` and `Sidebar.tsx` will be modified to support state-driven open/close functionality.
- Styles: `App.css` will be updated with transition animations, sidebar positioning, and backdrop overlay styles for screens narrower than 1024px.
