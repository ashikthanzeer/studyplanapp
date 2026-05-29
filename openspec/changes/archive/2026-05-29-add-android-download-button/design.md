## Context

The StudyPlanner project has an Android application available via Expo. However, the web application currently has no links or call-to-actions (CTAs) directing users to download the Android app. Providing this download button will improve the cross-platform experience.

## Goals / Non-Goals

**Goals:**
- Add a "Download for Android" button referencing the Expo Android build download URL: `https://expo.dev/accounts/ashikthanzeer/projects/study-planner/builds/8ec53be2-adb7-438d-8f3a-b9c2809d293f`.
- Show the button on both the unauthenticated login screen (`Auth.tsx`) and the authenticated sidebar (`Sidebar.tsx`).
- Use an inline SVG representation of the Android symbol to avoid introducing external icon library dependencies.
- Ensure the buttons support the application's light/dark modes and are visually polished with micro-interactions (e.g. hover states).

**Non-Goals:**
- Hosting the APK binary locally on the study-planner server.
- Adding download buttons for iOS/macOS/Windows builds.

## Decisions

### Decision 1: Use inline SVG for the Android logo symbol
- **Option A:** Install a library like `react-icons` or `@fortawesome/react-fontawesome`.
- **Option B (Chosen):** Use an inline SVG of the Android logo.
- **Rationale:** The project has very minimal dependencies. Adding a package just for one icon is unnecessary. An inline SVG is lightweight, requires no network/package-management overhead, and is easily customizable with CSS colors/sizes.

### Decision 2: Button placement in Auth.tsx
- **Option A:** Add it inside the login form.
- **Option B (Chosen):** Add it as a separate card/container below the main glassmorphism authentication card, or centered nicely at the bottom of the screen.
- **Rationale:** Putting it inside the login form could distract users from the primary goals of logging in or registering. Placing it underneath the main auth card makes it clean, distinct, and easy to find without interfering with the login flow.

### Decision 3: Button placement in Sidebar.tsx
- **Option A:** Add it as a navigation menu item.
- **Option B (Chosen):** Add it in the bottom section of the sidebar, right above the user profile block.
- **Rationale:** The sidebar navigation menu represents views within the web app itself. The download button links to an external site. Placing it in the bottom section (like utility links) clearly separates it from page navigation, while keeping it permanently visible to logged-in users.

## Risks / Trade-offs

- **[Risk] Expo build link changes or expires** → **[Mitigation]** The URL is hardcoded as requested. If the build changes, this URL can be updated in one place or moved to an environment variable in the future.
