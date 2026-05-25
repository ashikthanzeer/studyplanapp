## 1. Backend Implementation

- [x] 1.1 Import `getClient` from connection utility into `backend/src/controllers/authController.ts`
- [x] 1.2 Update the `register` handler in `backend/src/controllers/authController.ts` to execute database queries inside a transaction block (`BEGIN` / `COMMIT` / `ROLLBACK`)
- [x] 1.3 Implement default Kanban column provisioning (`To Do` at position 1, `In Progress` at position 2, `Done` at position 3) inside the user registration transaction block
- [x] 1.4 Add error catching for unique key violations (PostgreSQL error code `23505`) during registration and respond with a `409` conflict status

## 2. Frontend Implementation

- [x] 2.1 Update `frontend/src/components/KanbanBoard.tsx` to remove client-side dynamic initialization of default columns, relying instead on pre-provisioned backend columns
- [x] 2.2 Verify that the Kanban Board component handles an empty columns list gracefully without triggering automated API writes

## 3. Verification and Integration Testing

- [x] 3.1 Start the development servers (backend and frontend) to verify the integration
- [x] 3.2 Perform a test registration on the frontend to verify a complete and successful user setup
- [x] 3.3 Verify that database tables (`users`, `student_profiles`, `user_preferences`, `kanban_columns`) are correctly populated for the new user
- [x] 3.4 Test double-registration with the same email and check that it returns a 409 status code
