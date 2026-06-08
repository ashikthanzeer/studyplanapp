import { query } from '../db/connection';
import crypto from 'crypto';

/**
 * Generates a cryptographically secure 6-digit random numeric string.
 */
function generate6DigitCode(): string {
  // Generate random bytes and map to a 6-digit number
  const buffer = crypto.randomBytes(4);
  const number = buffer.readUInt32BE(0) % 1000000;
  return number.toString().padStart(6, '0');
}

/**
 * Generates and saves a new OTP for a user and purpose.
 * Expired and active OTPs for the same user and purpose are deleted beforehand.
 */
export async function generateAndSaveOTP(
  userId: number,
  purpose: 'email_verification' | 'forgot_password' | 'change_email'
): Promise<string> {
  const code = generate6DigitCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Delete previous OTPs of this user/purpose to prevent duplication
  await query(
    'DELETE FROM otps WHERE user_id = $1 AND purpose = $2',
    [userId, purpose]
  );

  // Save the new OTP
  await query(
    'INSERT INTO otps (user_id, code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
    [userId, code, purpose, expiresAt]
  );

  return code;
}

/**
 * Validates a user's OTP. If valid and not expired, it returns true and deletes the OTP.
 */
export async function verifyOTP(
  userId: number,
  code: string,
  purpose: 'email_verification' | 'forgot_password' | 'change_email'
): Promise<boolean> {
  // Find a matching active OTP that hasn't expired yet
  const res = await query(
    'SELECT id FROM otps WHERE user_id = $1 AND code = $2 AND purpose = $3 AND expires_at > CURRENT_TIMESTAMP',
    [userId, code, purpose]
  );

  if (res.rows.length === 0) {
    return false;
  }

  // Delete all OTPs for this user and purpose so they cannot be reused
  await query(
    'DELETE FROM otps WHERE user_id = $1 AND purpose = $2',
    [userId, purpose]
  );

  return true;
}

/**
 * Deletes any expired OTPs from the database.
 */
export async function cleanExpiredOTPs(): Promise<void> {
  await query('DELETE FROM otps WHERE expires_at <= CURRENT_TIMESTAMP');
}
