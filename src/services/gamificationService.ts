import { query } from '../db/connection';

/**
 * Awards or increments a badge count for a user, ensuring a badge is only earned once per calendar day.
 */
async function awardBadge(userId: number, badgeName: string) {
  // Fetch existing badge details
  const badgeRes = await query(
    `SELECT id, count, DATE(last_earned_at)::text as last_earned_date 
     FROM user_badges 
     WHERE user_id = $1 AND badge_name = $2`,
    [userId, badgeName]
  );

  const dateRes = await query(`SELECT CURRENT_DATE::text as today`);
  const today = dateRes.rows[0].today;

  if (badgeRes.rows.length === 0) {
    // Insert new badge if the user doesn't have it
    await query(
      `INSERT INTO user_badges (user_id, badge_name, count, last_earned_at)
       VALUES ($1, $2, 1, CURRENT_TIMESTAMP)`,
      [userId, badgeName]
    );
    console.log(`User ${userId} earned new badge: ${badgeName}`);
  } else {
    const badge = badgeRes.rows[0];
    
    // Only increment badge count if it hasn't been earned today
    if (badge.last_earned_date !== today) {
      await query(
        `UPDATE user_badges 
         SET count = count + 1, last_earned_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [badge.id]
      );
      console.log(`User ${userId} incremented badge count for: ${badgeName}`);
    }
  }
}

/**
 * Evaluates and updates streak statistics and milestone badges on Pomodoro session completion.
 */
export async function updateStreakAndBadges(userId: number) {
  try {
    // Get server date information in DB timezone
    const dateRes = await query(
      `SELECT CURRENT_DATE::text as today, (CURRENT_DATE - INTERVAL '1 day')::date::text as yesterday`
    );
    const today = dateRes.rows[0].today;
    const yesterday = dateRes.rows[0].yesterday;

    // 1. Evaluate User Streak
    const streakRes = await query(
      `SELECT id, current_streak, max_streak, DATE(last_activity_date)::text as last_activity 
       FROM user_streaks 
       WHERE user_id = $1`,
      [userId]
    );

    let currentStreak = 1;
    let maxStreak = 1;
    let isStreakUpdated = false;

    if (streakRes.rows.length === 0) {
      // First streak record
      await query(
        `INSERT INTO user_streaks (user_id, current_streak, max_streak, last_activity_date)
         VALUES ($1, 1, 1, CURRENT_DATE)`,
        [userId]
      );
      isStreakUpdated = true;
    } else {
      const streakRecord = streakRes.rows[0];
      currentStreak = streakRecord.current_streak;
      maxStreak = streakRecord.max_streak;
      const lastActivity = streakRecord.last_activity;

      if (lastActivity === yesterday) {
        currentStreak += 1;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
        isStreakUpdated = true;
      } else if (lastActivity === today) {
        // Streak already updated today
        isStreakUpdated = false;
      } else {
        // Streak broken, reset to 1
        currentStreak = 1;
        isStreakUpdated = true;
      }

      if (isStreakUpdated) {
        await query(
          `UPDATE user_streaks 
           SET current_streak = $1, max_streak = $2, last_activity_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $3`,
          [currentStreak, maxStreak, userId]
        );
      }
    }

    // Award streak badges on milestones if streak incremented
    if (isStreakUpdated) {
      const streakMilestones = [5, 10, 25, 50, 75, 100, 150, 200, 250, 300];
      if (streakMilestones.includes(currentStreak)) {
        await awardBadge(userId, `${currentStreak}-Day Streak`);
      }
    }

    // 2. Evaluate Daily Focus Hours Milestones
    const dailyMinutesRes = await query(
      `SELECT SUM(duration_minutes) as daily_minutes 
       FROM pomodoro_sessions 
       WHERE user_id = $1 AND status = 'completed' AND DATE(ended_at) = CURRENT_DATE`,
      [userId]
    );

    const dailyMinutes = parseInt(dailyMinutesRes.rows[0].daily_minutes) || 0;
    const dailyHours = dailyMinutes / 60;

    const hourMilestones = [8, 10, 12, 14, 15];
    for (const milestone of hourMilestones) {
      if (dailyHours >= milestone) {
        await awardBadge(userId, `${milestone}-Hour Daily Focus`);
      }
    }

  } catch (error) {
    console.error('Error updating gamification stats:', error);
  }
}
