## Context

Currently, the user's study streak on the dashboard is hardcoded to a mock value of `3` in `frontend/src/components/Dashboard.tsx`. To provide a meaningful user experience and display accurate progress, the study streak needs to be calculated dynamically from the user's completed study sessions.

## Goals / Non-Goals

**Goals:**
- Dynamically calculate the active study streak on the backend. The study streak is the count of consecutive days (up to and including today or yesterday) in which the user has completed at least one Pomodoro session.
- Expose the calculated streak under `stats.streak` in the response of the `/api/pomodoro/stats` endpoint.
- Consume this new field in `frontend/src/components/Dashboard.tsx` to display the actual streak.

**Non-Goals:**
- Award badges or notify users of new streak achievements (out of scope, can be implemented in a future notification spec).

## Decisions

### Decision 1: Perform the streak calculation on the backend stats query
- **Approach**: Modify `getSessionStats` in `backend/src/controllers/pomodoroController.ts` to query the list of unique dates (`DATE(started_at)`) on which the user completed a Pomodoro session, ordered descending. Traverse this list to count the number of consecutive days up to today/yesterday.
- **Rationale**: Keeps the business logic centralized on the backend and ensures the calculation is lightweight and fast since it only requires querying the unique date values.
- **Alternative considered**: Calculating it on the frontend by fetching all sessions. Rejected because fetching the entire session history just to calculate the streak on the client is inefficient and wastes network bandwidth.

### Decision 2: Streak calculation algorithm
- **Approach**: 
  1. Retrieve all unique dates of completed focus sessions:
     `SELECT DATE(started_at) as session_date FROM pomodoro_sessions WHERE user_id = $1 AND status = 'completed' GROUP BY session_date ORDER BY session_date DESC`
  2. Parse the dates and verify if the most recent date is today or yesterday.
  3. If yes, start the streak counter at 1. Loop through the subsequent unique dates, checking if the gap between the last date and the current date is exactly 1 day. Increment the streak for each consecutive day. Stop when a gap of 2 or more days is encountered.
  4. If the most recent date is before yesterday, set the streak to 0.

## Risks / Trade-offs

- **Risk**: Timezone mismatches between the database server and the user.
  - *Mitigation*: The database stores timestamps in UTC (or database default). We evaluate `DATE(started_at)` in the database timezone and compute the current day in local server time. For most setups, this is consistent and robust enough.
