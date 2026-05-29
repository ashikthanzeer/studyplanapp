## MODIFIED Requirements

### Requirement: Toggle sidebar open via hamburger menu button on mobile viewports
When the application is viewed on a mobile device or viewport narrower than 1024px, the system SHALL display a hamburger menu toggle button inside a navigation header bar at the absolute top of the page. This header bar SHALL remain fixed to the top of the viewport when scrolling, cover the full width of the viewport, and contain the hamburger button to trigger opening the sidebar menu overlay.

#### Scenario: Show hamburger button on mobile screen
- **WHEN** the user is logged in and the viewport width is 1024px or narrower
- **THEN** the system SHALL render a fixed, full-width top navigation header with a hamburger menu toggle button at the top left

#### Scenario: Open sidebar using hamburger button
- **WHEN** the user is viewing the dashboard on a mobile screen and clicks the hamburger menu button
- **THEN** the system SHALL slide the sidebar navigation menu in from the left over the main content area with a dimmed backdrop
