"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getUserProfile = getUserProfile;
exports.verifyEmail = verifyEmail;
exports.resendVerificationEmail = resendVerificationEmail;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.requestEmailChange = requestEmailChange;
exports.confirmEmailChange = confirmEmailChange;
exports.requestPasswordChange = requestPasswordChange;
exports.confirmPasswordChange = confirmPasswordChange;
const connection_1 = require("../db/connection");
const auth_1 = require("../utils/auth");
const otpService_1 = require("../services/otpService");
const emailService_1 = require("../services/emailService");
async function register(req, res) {
    try {
        let { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        email = (0, auth_1.normalizeEmail)(email);
        if (!(0, auth_1.isValidEmail)(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        // Check if user already exists
        const existingUser = await (0, connection_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }
        // Hash password
        const passwordHash = await (0, auth_1.hashPassword)(password);
        // Acquire a client from pool to run transaction
        const dbClient = await (0, connection_1.getClient)();
        try {
            await dbClient.query('BEGIN');
            // Create user (is_verified defaults to false)
            const result = await dbClient.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email', [email, passwordHash]);
            const user = result.rows[0];
            // Create student profile
            await dbClient.query('INSERT INTO student_profiles (user_id, name) VALUES ($1, $2)', [user.id, email.split('@')[0]]);
            // Create user preferences
            await dbClient.query('INSERT INTO user_preferences (user_id) VALUES ($1)', [user.id]);
            await dbClient.query('COMMIT');
            // Generate and save registration OTP
            const otp = await (0, otpService_1.generateAndSaveOTP)(user.id, 'email_verification');
            // Send verification email
            try {
                await (0, emailService_1.sendOTPEmail)(user.email, otp, 'email_verification');
            }
            catch (emailErr) {
                console.error('Failed to send registration OTP email:', emailErr);
            }
            const token = (0, auth_1.generateToken)(user.id, user.email);
            res.status(201).json({
                message: 'User registered successfully. Verification code sent to email.',
                user: { id: user.id, email: user.email, is_verified: false },
                token,
            });
        }
        catch (dbError) {
            await dbClient.query('ROLLBACK');
            throw dbError;
        }
        finally {
            dbClient.release();
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
}
async function login(req, res) {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        email = (0, auth_1.normalizeEmail)(email);
        const result = await (0, connection_1.query)('SELECT id, email, password_hash, is_verified FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        const isPasswordValid = await (0, auth_1.comparePasswords)(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (!user.is_verified) {
            // Generate and save verification OTP
            const otp = await (0, otpService_1.generateAndSaveOTP)(user.id, 'email_verification');
            // Send verification email
            try {
                await (0, emailService_1.sendOTPEmail)(user.email, otp, 'email_verification');
            }
            catch (emailErr) {
                console.error('Failed to send verification OTP email on login:', emailErr);
            }
        }
        const token = (0, auth_1.generateToken)(user.id, user.email);
        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, is_verified: user.is_verified },
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}
async function getUserProfile(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const result = await (0, connection_1.query)(`SELECT u.id, u.email, u.is_verified, sp.name, sp.avatar_url, sp.bio
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.id = $1`, [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: result.rows[0] });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
}
async function verifyEmail(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Verification code is required' });
        }
        const isValid = await (0, otpService_1.verifyOTP)(req.user.id, code, 'email_verification');
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }
        // Mark user as verified
        await (0, connection_1.query)('UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.user.id]);
        res.json({ message: 'Email verified successfully', is_verified: true });
    }
    catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
}
async function resendVerificationEmail(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Check if user is already verified
        const userRes = await (0, connection_1.query)('SELECT is_verified FROM users WHERE id = $1', [req.user.id]);
        if (userRes.rows.length > 0 && userRes.rows[0].is_verified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }
        const otp = await (0, otpService_1.generateAndSaveOTP)(req.user.id, 'email_verification');
        await (0, emailService_1.sendOTPEmail)(req.user.email, otp, 'email_verification');
        res.json({ message: 'Verification code resent successfully' });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification email' });
    }
}
async function forgotPassword(req, res) {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        email = (0, auth_1.normalizeEmail)(email);
        const userRes = await (0, connection_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length > 0) {
            const user = userRes.rows[0];
            const otp = await (0, otpService_1.generateAndSaveOTP)(user.id, 'forgot_password');
            await (0, emailService_1.sendOTPEmail)(email, otp, 'forgot_password');
        }
        // Return generic success to prevent user enumeration
        res.json({ message: 'If this email is registered, a password reset code has been sent.' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to request password reset' });
    }
}
async function resetPassword(req, res) {
    try {
        let { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Email, code, and new password are required' });
        }
        email = (0, auth_1.normalizeEmail)(email);
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const userRes = await (0, connection_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or code' });
        }
        const user = userRes.rows[0];
        const isValid = await (0, otpService_1.verifyOTP)(user.id, code, 'forgot_password');
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }
        const passwordHash = await (0, auth_1.hashPassword)(newPassword);
        await (0, connection_1.query)('UPDATE users SET password_hash = $1, is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [passwordHash, user.id]);
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
}
async function requestEmailChange(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        let { newEmail } = req.body;
        if (newEmail) {
            newEmail = (0, auth_1.normalizeEmail)(newEmail);
        }
        if (!newEmail || !(0, auth_1.isValidEmail)(newEmail)) {
            return res.status(400).json({ error: 'Valid new email is required' });
        }
        // Check if new email already exists
        const existingUser = await (0, connection_1.query)('SELECT id FROM users WHERE email = $1', [newEmail]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email is already in use by another account' });
        }
        const otp = await (0, otpService_1.generateAndSaveOTP)(req.user.id, 'change_email');
        await (0, emailService_1.sendOTPEmail)(newEmail, otp, 'change_email');
        res.json({ message: 'Verification code sent to your new email address.' });
    }
    catch (error) {
        console.error('Request email change error:', error);
        res.status(500).json({ error: 'Failed to request email change' });
    }
}
async function confirmEmailChange(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        let { code, newEmail } = req.body;
        if (newEmail) {
            newEmail = (0, auth_1.normalizeEmail)(newEmail);
        }
        if (!code || !newEmail || !(0, auth_1.isValidEmail)(newEmail)) {
            return res.status(400).json({ error: 'Verification code and valid new email are required' });
        }
        // Check if new email is in use (just in case they registered it since requesting)
        const existingUser = await (0, connection_1.query)('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail, req.user.id]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email is already in use by another account' });
        }
        const isValid = await (0, otpService_1.verifyOTP)(req.user.id, code, 'change_email');
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }
        await (0, connection_1.query)('UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newEmail, req.user.id]);
        res.json({ message: 'Email address updated successfully', email: newEmail });
    }
    catch (error) {
        console.error('Confirm email change error:', error);
        res.status(500).json({ error: 'Failed to update email address' });
    }
}
async function requestPasswordChange(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const otp = await (0, otpService_1.generateAndSaveOTP)(req.user.id, 'forgot_password');
        await (0, emailService_1.sendOTPEmail)(req.user.email, otp, 'forgot_password');
        res.json({ message: 'Verification code sent to your registered email address.' });
    }
    catch (error) {
        console.error('Request password change error:', error);
        res.status(500).json({ error: 'Failed to request password change' });
    }
}
async function confirmPasswordChange(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { code, newPassword } = req.body;
        if (!code || !newPassword) {
            return res.status(400).json({ error: 'Verification code and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const isValid = await (0, otpService_1.verifyOTP)(req.user.id, code, 'forgot_password');
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }
        const passwordHash = await (0, auth_1.hashPassword)(newPassword);
        await (0, connection_1.query)('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [passwordHash, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Confirm password change error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
}
//# sourceMappingURL=authController.js.map