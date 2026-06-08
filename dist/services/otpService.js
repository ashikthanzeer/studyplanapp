"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndSaveOTP = generateAndSaveOTP;
exports.verifyOTP = verifyOTP;
exports.cleanExpiredOTPs = cleanExpiredOTPs;
const connection_1 = require("../db/connection");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a cryptographically secure 6-digit random numeric string.
 */
function generate6DigitCode() {
    // Generate random bytes and map to a 6-digit number
    const buffer = crypto_1.default.randomBytes(4);
    const number = buffer.readUInt32BE(0) % 1000000;
    return number.toString().padStart(6, '0');
}
/**
 * Generates and saves a new OTP for a user and purpose.
 * Expired and active OTPs for the same user and purpose are deleted beforehand.
 */
async function generateAndSaveOTP(userId, purpose) {
    const code = generate6DigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    // Delete previous OTPs of this user/purpose to prevent duplication
    await (0, connection_1.query)('DELETE FROM otps WHERE user_id = $1 AND purpose = $2', [userId, purpose]);
    // Save the new OTP
    await (0, connection_1.query)('INSERT INTO otps (user_id, code, purpose, expires_at) VALUES ($1, $2, $3, $4)', [userId, code, purpose, expiresAt]);
    return code;
}
/**
 * Validates a user's OTP. If valid and not expired, it returns true and deletes the OTP.
 */
async function verifyOTP(userId, code, purpose) {
    // Find a matching active OTP that hasn't expired yet
    const res = await (0, connection_1.query)('SELECT id FROM otps WHERE user_id = $1 AND code = $2 AND purpose = $3 AND expires_at > CURRENT_TIMESTAMP', [userId, code, purpose]);
    if (res.rows.length === 0) {
        return false;
    }
    // Delete all OTPs for this user and purpose so they cannot be reused
    await (0, connection_1.query)('DELETE FROM otps WHERE user_id = $1 AND purpose = $2', [userId, purpose]);
    return true;
}
/**
 * Deletes any expired OTPs from the database.
 */
async function cleanExpiredOTPs() {
    await (0, connection_1.query)('DELETE FROM otps WHERE expires_at <= CURRENT_TIMESTAMP');
}
//# sourceMappingURL=otpService.js.map