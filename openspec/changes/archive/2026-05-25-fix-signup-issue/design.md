## Context

Currently, the user registration process in `backend/src/controllers/authController.ts` runs three separate SQL queries sequentially (creating the user record, creating the student profile, and creating the user preferences) without a database transaction. If the database connection drops or one of the queries fails, the user is partially registered. Subsequent attempts to register the same email address will fail with "User already exists" (409), but the user will lack a profile or preferences, breaking their user experience.

Additionally, default Kanban board columns ("To Do", "In Progress", "Done") are initialized on the client side when the user first visits the Kanban page. This requires three separate sequential API calls from the client, which is slow, prone to race conditions, and doesn't initialize default columns for the user until they actively navigate to the board.

## Goals / Non-Goals

**Goals:**
- Ensure that user registration is fully atomic: either the user account, student profile, preferences, and default Kanban columns are all created successfully, or none of them are.
- Pre-provision default Kanban columns ("To Do", "In Progress", "Done") on the backend during the registration database transaction.
- Simplify the frontend Kanban Board column retrieval to just fetch columns from the API, removing the client-side auto-initialization logic.
- Gracefully handle database constraint errors (such as unique key violations for emails) by returning a clear 409 status code.

**Non-Goals:**
- Implement registration email verification/confirmation (out of scope for this signup fix).
- Allow users to choose their default Kanban columns during the signup process (they can still customize them later).

## Decisions

### Decision 1: Use SQL Transactions on user registration
- **Approach**: Acquire a dedicated client from the PG pool, execute `BEGIN`, perform inserts into `users`, `student_profiles`, `user_preferences`, and `kanban_columns`, and run `COMMIT`. Rollback on any failure.
- **Rationale**: Guarantees database consistency. If any step fails, no half-created records are left behind.
- **Alternative considered**: Implementing a cleanup script or endpoint. This is reactive and far more complex to manage than standard ACID transactions.

### Decision 2: Initialize default columns on backend signup
- **Approach**: Create the three default columns ("To Do", "In Progress", "Done") inside the registration transaction block.
- **Rationale**: Solves the client-side race conditions and ensures that the user's workspace is fully populated right after signup.
- **Alternative considered**: Keep initialization on the frontend. Rejected because it is slow and leads to duplicate columns if the Kanban component mounts multiple times concurrently.

### Decision 3: Catch Unique Key Violations (`23505`) in registration
- **Approach**: Check `error.code === '23505'` in the `catch` block of the registration controller. If matched, return `409 Conflict`.
- **Rationale**: Prevents concurrent registration requests with the same email from causing `500 Internal Server Error`.

## Risks / Trade-offs

- **Risk**: Connection leaks if the client is not properly released back to the pool.
  - *Mitigation*: Wrap the transaction block in a `try...catch...finally` construct, calling `client.release()` in the `finally` block.
- **Risk**: Existing users without columns might have an empty Kanban board.
  - *Mitigation*: Existing users are not affected unless they delete all their columns. If they do, they can manually add custom columns via the "Add Column" button.
