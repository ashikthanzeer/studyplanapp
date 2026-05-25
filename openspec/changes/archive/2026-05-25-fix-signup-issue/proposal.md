## Why

Currently, the user registration process runs multiple independent database queries (creating the user record, creating the student profile, and creating the user preferences) without a database transaction. If any of the later queries fail, the database is left in a corrupted/incomplete state, and subsequent attempts to register with that email will fail with a "User already exists" error. Additionally, default Kanban columns are initialized on the frontend when the user first views the board, which is error-prone, causes extra API requests, and leads to race conditions.

## What Changes

- Wrap the user registration endpoint queries (`users`, `student_profiles`, `user_preferences`) in a single database transaction so that registration succeeds or fails atomically.
- Initialize the default Kanban columns ("To Do", "In Progress", "Done") on the backend during the registration database transaction.
- Update the frontend Kanban Board component to rely on the backend-initialized columns rather than dynamically creating them on load.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `student-profiles`: Ensure user profile registration is atomic and transactional, and initialize the default study workspace including Kanban columns during signup.
- `kanban-board`: Shift default column initialization from the client-side board render to backend user registration.

## Impact

- **Backend**: `backend/src/controllers/authController.ts` will use transaction blocks via the PG client.
- **Backend Database**: Additional INSERT queries for default kanban columns will be executed inside the registration transaction block.
- **Frontend**: `frontend/src/components/KanbanBoard.tsx` will no longer try to create default columns if none are returned by the API.
