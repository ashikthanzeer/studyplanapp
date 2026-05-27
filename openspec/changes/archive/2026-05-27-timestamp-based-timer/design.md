## Context

Currently, the `FocusTimer` component uses a naive `setInterval` countdown that decrements the remaining time by 1 second on every tick. On mobile devices or browsers with background tab throttling, the CPU is put to sleep or the JavaScript engine suspends the execution of timers. As a result, the countdown is paused or runs slow, meaning the study timer stops. 

Although `restoreTimerState` handles the case where the tab is closed and reopened (by checking the wall-clock elapsed time since the last saved timestamp), it does not trigger when the tab is merely backgrounded/suspended and then foregrounded without a remount.

## Goals / Non-Goals

**Goals:**
- Calculate the remaining time dynamically in the interval tick using a target end timestamp (`targetEndTime`) and the current time (`Date.now()`).
- Support correct wake-up behavior, meaning the timer automatically catches up to the elapsed time and triggers completion/next-session transitions if it expired during sleep.
- Keep local storage in sync with the current target end time so that refreshes also resume correctly.

**Non-Goals:**
- Moving the countdown state to a server-side websocket or server-sent events connection.
- Changing the backend APIs.

## Decisions

### Decision 1: Use Target End Time Timestamp for Counting Down
Instead of decrementing a counter, we will calculate the target end time when starting or resuming the timer:
`targetEndTime = Date.now() + startSeconds * 1000;`

In the interval loop:
`const remainingSeconds = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));`

This ensures that regardless of browser throttling or device sleep, the very next time the interval runs, it calculates the precise time remaining based on the real clock.

### Decision 2: Save targetEndTime in LocalStorage
When the timer is active, we store `targetEndTime` in the localStorage state object. This allows page reloads to restore the exact countdown target. When paused, we clear/ignore the target end time and save the remaining duration.

## Risks / Trade-offs

- **Risk**: Browser throttling can delay the execution of the final completion check by a few seconds.
- **Mitigation**: Since the user is not interactively looking at the screen when the screen is off, a minor latency of a fraction of a second upon turning the screen back on is completely acceptable, and it will immediately transition to the finished state and trigger the alarm.
