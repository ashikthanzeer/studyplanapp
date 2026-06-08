## Context

Currently, the frontend profile loader (`loadUserProfile` in `App.tsx`) fetches the user profile and theme preferences sequentially on login:
```typescript
const data = await getUserProfile();
setUser(data.user);
const prefData = await getPreferences();
```
For unverified users, the backend blocks the `getPreferences` request with a `403 Forbidden` status. The catch-all block handles this error by calling `handleLogout()`, causing the client to lose their session immediately.

## Goals / Non-Goals

**Goals:**
* Prevent `loadUserProfile` from querying preferences or checking task deadlines if the user is unverified.
* Allow unverified users to stay logged in on the client-side so they are rendered the `EmailVerification` overlay.

**Non-Goals:**
* Allowing unverified users to query references, lists, or timer states.

## Decisions

### Decision 1: Early return in loadUserProfile for unverified accounts
* **Choice**: Check the `is_verified` flag on the returned user object from `getUserProfile()`. If it is false, stop loading, skip preference fetches, and return early.
* **Rationale**: The `user` state will still be updated, triggering React to render the `EmailVerification` page, while preventing any 403 API errors that trigger a logout.

## Risks / Trade-offs

* **[Risk]** Theme settings might not load for unverified users.
  * **Mitigation**: This is acceptable because unverified users can only see the verification overlay, which does not require theme preferences. Once verified, the dashboard will reload and fetch their preferences.
