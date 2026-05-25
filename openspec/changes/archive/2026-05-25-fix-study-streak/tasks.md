## 1. Backend Implementation

- [x] 1.1 Implement active study streak calculation in `getSessionStats` in `backend/src/controllers/pomodoroController.ts`
- [x] 1.2 Include the calculated streak value as `streak` in the stats object returned by the Pomodoro stats API

## 2. Frontend Implementation

- [x] 2.1 Update `frontend/src/components/Dashboard.tsx` to set the `streak` state from `statsData.stats.streak` instead of using the hardcoded value of 3

## 3. Verification Testing

- [x] 3.1 Verify that the streak calculates correctly for 0 days (no sessions), 1 day (only today or yesterday), and multiple consecutive days
