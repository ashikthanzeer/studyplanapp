## Context

On viewports smaller than 1024px, the left sidebar navigation layout in StudyPlanner is hidden (`display: none`). Although a mobile bottom navigation bar exists, it only contains views (Dashboard, Tasks, Subjects, Focus Timer, History, Settings) and lacks user profile details, sign-out actions, and the newly added Android app download link. By implementing a toggleable mobile sidebar drawer, mobile users can access these features.

## Goals / Non-Goals

**Goals:**
- Manage sidebar open/close state (`sidebarOpen`) reactively in `App.tsx`.
- Create a mobile top header inside the main content viewport displaying a hamburger menu button to trigger the sidebar opening.
- Show a close icon button (X symbol) at the top of the sidebar when active on mobile.
- Support closing the sidebar via an overlay backdrop tap/click.
- Automatically close the mobile sidebar drawer when any view/navigation action is selected.
- Implement smooth slide-in/slide-out animations and backdrop blur transitions using standard CSS.

**Non-Goals:**
- Replacing or modifying the mobile bottom navigation bar.
- Redesigning the desktop sidebar layout.

## Decisions

### Decision 1: Sidebar open/close state in App.tsx
- **Chosen Approach:** Lift the state up to `App.tsx`: `const [sidebarOpen, setSidebarOpen] = useState(false)`.
- **Rationale:** The trigger button is located within the main content/header wrapper (outside the sidebar), whereas the close button is inside the sidebar itself. Storing the state in the parent `App` component allows simple prop passing to control visibility across both contexts.

### Decision 2: Mobile Top Header bar layout
- **Chosen Approach:** Add a flex-based `.mobile-header` bar at the top of `main-content` inside `App.tsx` (visible only at `@media (max-width: 1024px)`).
- **Rationale:** Rather than placing a floating button that could overlap dashboard charts or tasks, a top bar header is standard, clean, and integrates naturally with the main scrolling panel. It can also house the title of the active view or a logo.

### Decision 3: CSS Overlay and Slide-in animation
- **Chosen Approach:** Define transition rules in `App.css`:
  - When closed on mobile: `.sidebar` will have `transform: translateX(-100%)` and `position: fixed`.
  - When open on mobile: `.sidebar` will have `.open` class applying `transform: translateX(0)`.
  - Render a `.sidebar-backdrop` element with `backdrop-filter: blur(4px)` and a click listener that toggles the sidebar state to closed.

## Risks / Trade-offs

- **[Risk] Background scrolling while mobile drawer is open** → **[Mitigation]** If the mobile sidebar is active, prevent user scrolling on the underlying view by setting a temporary CSS class on the `app-container` or `body`.
