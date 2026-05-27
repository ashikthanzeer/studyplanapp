## 1. Preparation

- [x] 1.1 Review existing state variables and references in `FocusTimer.tsx` related to countdown tracking

## 2. Implementation

- [x] 2.1 Refactor state and state saving to persist the computed target end timestamp (`targetEndTime`) when active
- [x] 2.2 Modify `startTimerLoop` to calculate time remaining by subtracting the current time from `targetEndTime`
- [x] 2.3 Modify `restoreTimerState` to accurately reconstruct `targetEndTime` and verify elapsed time
- [x] 2.4 Update reset, pause, and skip actions to clean up or reset the target end time
