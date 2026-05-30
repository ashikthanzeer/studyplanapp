## ADDED Requirements

### Requirement: Sidebar scrollability on mobile viewports
When the sidebar overlay is displayed on mobile viewports, the content SHALL scroll vertically if it exceeds the height of the viewport, ensuring that the profile info, Android download link, and Sign Out buttons remain reachable and interactive.

#### Scenario: Scroll mobile sidebar to reach Sign Out button
- **WHEN** the viewport height is smaller than the sidebar contents and the sidebar is open
- **THEN** the system SHALL allow vertical scrolling within the sidebar to reveal and interact with the Sign Out button and profile info

### Requirement: Spacing on mobile header
The top navigation header bar SHALL contain appropriate padding at the top to prevent coinciding with the top edge of mobile viewports.

#### Scenario: View mobile header spacing
- **WHEN** the viewport is 1024px or narrower
- **THEN** the mobile header SHALL render with top padding ensuring sufficient spacing from the top edge of the screen
