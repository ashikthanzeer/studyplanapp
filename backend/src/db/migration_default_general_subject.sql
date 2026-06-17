-- Migration: Create default "General" subject for existing users who don't have one
INSERT INTO subjects (user_id, name, color)
SELECT u.id, 'General', '#64748b'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM subjects s WHERE s.user_id = u.id AND s.name = 'General'
);
