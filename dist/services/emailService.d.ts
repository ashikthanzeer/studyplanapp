/**
 * Sends a 6-digit OTP email for account verification or password resets.
 */
export declare function sendOTPEmail(email: string, otp: string, purpose: 'email_verification' | 'forgot_password' | 'change_email'): Promise<void>;
//# sourceMappingURL=emailService.d.ts.map