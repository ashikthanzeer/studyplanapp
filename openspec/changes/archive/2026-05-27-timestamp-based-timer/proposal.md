## Why

When the study planner is used on a mobile phone (or when the browser tab goes to sleep/background), the active timer stops or lags because browser engines freeze or throttle JavaScript's `setInterval`/`setTimeout`. Using a wall-clock timestamp difference (comparing the current time with a calculated target end time) prevents this, ensuring that the timer remains accurate and correctly reflects elapsed time even if the CPU, tab, or screen sleeps.

## What Changes

- Modify the Pomodoro timer countdown logic to compute the remaining time using the differences between the current timestamp (`Date.now()`) and the target end timestamp.
- Ensure that if a session ends while the device or tab was sleeping, it triggers the completion callback and state transitions immediately upon wake-up.
- Update `FocusTimer.tsx` to handle this logic seamlessly for focus, short break, and long break states.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `pomodoro-timer`: The timer calculation will be modified to use absolute timestamps rather than active tick decrements, ensuring continuity during sleep and tab suspension.

## Impact

- `frontend/src/components/FocusTimer.tsx`: Update state management, storage hooks, and active interval callback logic.
- Storage state (`pomodoro_timer_state` in `localStorage`): Ensure it tracks the correct timestamp fields.
