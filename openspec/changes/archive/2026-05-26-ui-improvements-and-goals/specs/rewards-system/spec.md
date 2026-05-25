## MODIFIED Requirements

### Requirement: System SHALL compute progression level based on total badges earned
The system SHALL calculate the student's overall level rank (Bronze, Silver, Gold, Platinum, Diamond) dynamically based on the total number of badges they have earned (including duplicate badge completions).

#### Scenario: Calculate student rank level
- **WHEN** the system calculates the user's level based on badges:
  - 0 to 2 badges: Bronze level
  - 3 to 5 badges: Silver level
  - 6 to 10 badges: Gold level
  - 11 to 19 badges: Platinum level
  - 20 or more badges: Diamond level
- **THEN** the system SHALL display the correct badge level badge/text on the user's profile and dashboard

#### Scenario: View locked badges
- **WHEN** the user views their badge progress
- **THEN** the system SHALL display unearned badges in a locked state (reduced brightness and locked icon) to motivate progression
