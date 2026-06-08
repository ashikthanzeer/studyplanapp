## 1. Database Migration

- [x] 1.1 Create migration script `migration_email_normalization.sql` to lowercase existing emails and verify existing users
- [x] 1.2 Run database migrations on the development database

## 2. Backend Normalization

- [x] 2.1 Update validation utility in backend to enforce lowercase conversion
- [x] 2.2 Update registration and login controller handlers to lowercase incoming email strings
- [x] 2.3 Update forgot-password, reset-password, and email-change handlers to lowercase email inputs

## 3. Frontend Normalization

- [x] 3.1 Update `Auth.tsx` login, registration, and forgot password forms to lowercase email submissions
- [x] 3.2 Update `ProfileSettings.tsx` email change form to lowercase new email submissions

## 4. End-to-End Verification

- [x] 4.1 Verify that mixed-case registrations and logins normalize to lowercase correctly
- [x] 4.2 Verify that existing users in the database are marked verified and can access their dashboards
