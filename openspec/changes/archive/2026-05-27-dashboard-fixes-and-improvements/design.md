## Context

This design addresses three usability issues/improvements requested for the Study Planner Dashboard:
1. Custom select option elements have bad/unreadable text coloring in dark mode.
2. Clicking stats panels on the dashboard should reveal detailed comparisons (past 7 days daily comparison, past 4 weeks weekly comparison).
3. Clicking the Productivity Goals card or the bottom Profile block in the sidebar should redirect the user to the corresponding tab inside settings.

## Goals / Non-Goals

**Goals:**
- Fix the dark mode dropdown option contrast issue globally.
- Fetch, aggregate, and display comparison data for daily and weekly study hours in a clean, glassmorphic modal overlay.
- Enable direct tab redirection to 'goals' or 'profile' inside Settings from the Dashboard and Sidebar.

**Non-Goals:**
- Creating a separate backend API for custom aggregated date queries (we can efficiently group sessions on the client side using the existing history endpoint).

## Decisions

### Decision 1: Option Styling in Custom Selects
We will add option styles in `index.css` to target `.form-select option` dynamically using the CSS variables from the theme:
```css
.form-select option {
  background-color: var(--bg-sidebar);
  color: var(--text-heading);
}
```
This inherits the correct dark background and white text when `data-theme="dark"` is active.

### Decision 2: Nested Sub-Tab Navigation
In `App.tsx`, we will declare a state variable `settingsTab` (defaulting to `'profile'`). We will extend `onViewChange` to accept an optional `tab` string:
`onViewChange(view: ViewType, tab?: 'profile' | 'preferences' | 'goals')`
When navigating to `'settings'` with a `tab` specified, we update the `settingsTab` state and pass it down to `ProfileSettings` as `initialTab`.

### Decision 3: Client-Side Stat Aggregation
Instead of adding new backend endpoints, we will invoke `getPomodoroHistory` with a calculated `date_from` parameter:
- Daily (past 7 days): Fetch sessions since 6 days ago, group by day, and format dates.
- Weekly (past 4 weeks): Fetch sessions since Monday of 3 weeks ago, group into 4-week buckets, and calculate total hours per week.
We will show a nice progress bar for each item in a custom modal window.
