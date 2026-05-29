## ADDED Requirements

### Requirement: Toggle sidebar open via hamburger menu button on mobile viewports
When the application is viewed on a mobile device or viewport narrower than 1024px, the system SHALL display a hamburger menu toggle button at the top of the main content. Tapping this button SHALL trigger the opening of the sidebar menu overlay.

#### Scenario: Show hamburger button on mobile screen
- **WHEN** the user is logged in and the viewport width is 1024px or narrower
- **THEN** the system SHALL render a hamburger menu toggle button at the top left of the content panel

#### Scenario: Open sidebar using hamburger button
- **WHEN** the user is viewing the dashboard on a mobile screen and clicks the hamburger menu button
- **THEN** the system SHALL slide the sidebar navigation menu in from the left over the main content area with a dimmed backdrop

### Requirement: Toggle sidebar close via close button or backdrop click
When the sidebar menu overlay is visible on a mobile viewport, the system SHALL display a close button (X symbol) inside the sidebar header. Tapping this close button, tapping the backdrop overlay area, or selecting a navigation view item from the sidebar menu SHALL dismiss/close the sidebar.

#### Scenario: Close sidebar using close icon
- **WHEN** the mobile sidebar menu overlay is open and the user clicks the close icon inside the sidebar header
- **THEN** the system SHALL slide the sidebar menu back off-screen

#### Scenario: Close sidebar using backdrop click
- **WHEN** the mobile sidebar menu overlay is open and the user clicks on the backdrop area outside the sidebar
- **THEN** the system SHALL dismiss the sidebar overlay

#### Scenario: Close sidebar when selecting a view
- **WHEN** the mobile sidebar menu overlay is open and the user clicks any navigation link (e.g. Tasks)
- **THEN** the system SHALL update the active view and automatically dismiss the sidebar overlay
