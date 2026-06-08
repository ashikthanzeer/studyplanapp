-- Migration: Enforce lowercased emails and verify all existing users

UPDATE users SET email = LOWER(email);
UPDATE users SET is_verified = true WHERE is_verified IS NOT TRUE;
