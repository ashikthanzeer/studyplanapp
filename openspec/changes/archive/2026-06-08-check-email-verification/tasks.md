## 1. SMTP Connection Test

- [x] 1.1 Create and run a temporary standalone test script to verify connection to `smtp.gmail.com` using the configured `.env` credentials
- [x] 1.2 Validate that the Gmail SMTP server successfully accepts and transmits the test email

## 2. End-to-End User Verification

- [x] 2.1 Start the backend server and ensure it launches without error
- [x] 2.2 Register a new user in the browser using the frontend client
- [x] 2.3 Verify that the actual Gmail account successfully delivers the 6-digit OTP code to the target inbox
- [x] 2.4 Verify that typing the received code into the verification UI successfully validates the account and redirects to the dashboard
