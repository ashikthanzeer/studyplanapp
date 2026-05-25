## Why

Currently, the user's study streak on the dashboard is hardcoded to a mock value of `3` in `frontend/src/components/Dashboard.tsx`. It needs to display the actual study streak calculated dynamically from the user's completed study sessions.

## What Changes

- Calculate the user's active study streak on the backend in the Pomodoro stats endpoint (`/api/pomodoro/stats`). The streak is defined as the number of consecutive days (up to and including today or yesterday) in which the user completed at least one focus session.
- Expose the calculated study streak in the API response under `stats.streak`.
- Update the frontend Dashboard component to fetch the study streak dynamically from the Pomodoro stats API instead of using the hardcoded value of `3`.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `dashboard`: Change the study streak indicator from a mock value to a dynamic calculation of the user's active study streak.

## Impact

- **Backend**: `backend/src/controllers/pomodoroController.ts` will query completed session dates and calculate the consecutive day streak.
- **Frontend**: `frontend/src/components/Dashboard.tsx` will receive the dynamic streak from the API and update state accordingly.
