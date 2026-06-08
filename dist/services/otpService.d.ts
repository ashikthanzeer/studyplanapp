/**
 * Generates and saves a new OTP for a user and purpose.
 * Expired and active OTPs for the same user and purpose are deleted beforehand.
 */
export declare function generateAndSaveOTP(userId: number, purpose: 'email_verification' | 'forgot_password' | 'change_email'): Promise<string>;
/**
 * Validates a user's OTP. If valid and not expired, it returns true and deletes the OTP.
 */
export declare function verifyOTP(userId: number, code: string, purpose: 'email_verification' | 'forgot_password' | 'change_email'): Promise<boolean>;
/**
 * Deletes any expired OTPs from the database.
 */
export declare function cleanExpiredOTPs(): Promise<void>;
//# sourceMappingURL=otpService.d.ts.map