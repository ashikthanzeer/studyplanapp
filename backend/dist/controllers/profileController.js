"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.getPreferences = getPreferences;
exports.updatePreferences = updatePreferences;
exports.getGamification = getGamification;
const connection_1 = require("../db/connection");
async function getProfile(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const result = await (0, connection_1.query)(`SELECT id, user_id, name, avatar_url, bio, created_at, updated_at
       FROM student_profiles WHERE user_id = $1`, [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ profile: result.rows[0] });
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
}
async function updateProfile(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { name, avatar_url, bio } = req.body;
        const result = await (0, connection_1.query)(`UPDATE student_profiles SET name = COALESCE($1, name),
        avatar_url = COALESCE($2, avatar_url),
        bio = COALESCE($3, bio),
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4 RETURNING *`, [name, avatar_url, bio, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ message: 'Profile updated successfully', profile: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}
async function getPreferences(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const result = await (0, connection_1.query)('SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Preferences not found' });
        }
        res.json({ preferences: result.rows[0] });
    }
    catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
}
async function updatePreferences(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { pomodoro_duration, break_duration, notification_enabled, desktop_notifications, quiet_hours_start, quiet_hours_end, theme, task_view_preference, } = req.body;
        const result = await (0, connection_1.query)(`UPDATE user_preferences SET
        pomodoro_duration = COALESCE($1, pomodoro_duration),
        break_duration = COALESCE($2, break_duration),
        notification_enabled = COALESCE($3, notification_enabled),
        desktop_notifications = COALESCE($4, desktop_notifications),
        quiet_hours_start = COALESCE($5, quiet_hours_start),
        quiet_hours_end = COALESCE($6, quiet_hours_end),
        theme = COALESCE($7, theme),
        task_view_preference = COALESCE($8, task_view_preference),
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $9 RETURNING *`, [
            pomodoro_duration,
            break_duration,
            notification_enabled,
            desktop_notifications,
            quiet_hours_start,
            quiet_hours_end,
            theme,
            task_view_preference,
            req.user.id,
        ]);
        res.json({ message: 'Preferences updated successfully', preferences: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
}
async function getGamification(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // 1. Get streak details
        const streakResult = await (0, connection_1.query)('SELECT current_streak, max_streak, last_activity_date FROM user_streaks WHERE user_id = $1', [req.user.id]);
        const streak = streakResult.rows[0] || { current_streak: 0, max_streak: 0, last_activity_date: null };
        // 2. Get badges details
        const badgesResult = await (0, connection_1.query)('SELECT badge_name, count, last_earned_at FROM user_badges WHERE user_id = $1 ORDER BY last_earned_at DESC', [req.user.id]);
        const badges = badgesResult.rows;
        // Calculate total badges earned (sum of all counts)
        const totalBadgesEarned = badges.reduce((sum, badge) => sum + (parseInt(badge.count) || 1), 0);
        // Calculate rank level
        let level = 'Bronze';
        if (totalBadgesEarned >= 20) {
            level = 'Diamond';
        }
        else if (totalBadgesEarned >= 11) {
            level = 'Platinum';
        }
        else if (totalBadgesEarned >= 6) {
            level = 'Gold';
        }
        else if (totalBadgesEarned >= 3) {
            level = 'Silver';
        }
        res.json({
            streak: streak.current_streak,
            maxStreak: streak.max_streak,
            lastActivityDate: streak.last_activity_date,
            badges,
            totalBadges: totalBadgesEarned,
            level,
        });
    }
    catch (error) {
        console.error('Error fetching gamification stats:', error);
        res.status(500).json({ error: 'Failed to fetch gamification stats' });
    }
}
//# sourceMappingURL=profileController.js.map