package com.apps.wmqd;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.ArrayList;
import java.util.List;

public class MonetizationManager {
    private static final String PREF_NAME = "monetization_prefs";
    private static final String KEY_PREMIUM = "is_premium";
    private static final String KEY_LAST_ANALYSIS = "last_analysis_time";
    private static final String KEY_LOCK_UNTIL = "lock_until_time";
    private static final String KEY_ATTEMPTS = "attempts_history";

    private static MonetizationManager instance;
    private final SharedPreferences prefs;

    private MonetizationManager(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized MonetizationManager getInstance(Context context) {
        if (instance == null) {
            instance = new MonetizationManager(context);
        }
        return instance;
    }

    public boolean isPremiumUser() {
        return prefs.getBoolean(KEY_PREMIUM, false);
    }

    public void setPremiumUser(boolean isPremium) {
        prefs.edit().putBoolean(KEY_PREMIUM, isPremium).apply();
    }

    public long getLastAnalysisTime() {
        return prefs.getLong(KEY_LAST_ANALYSIS, 0);
    }

    public void setLastAnalysisTime(long time) {
        prefs.edit().putLong(KEY_LAST_ANALYSIS, time).apply();
    }

    public long getLockUntil() {
        return prefs.getLong(KEY_LOCK_UNTIL, 0);
    }

    public void setLockUntil(long time) {
        prefs.edit().putLong(KEY_LOCK_UNTIL, time).apply();
    }

    public List<Long> getAttempts() {
        String attemptsStr = prefs.getString(KEY_ATTEMPTS, "");
        List<Long> list = new ArrayList<>();
        if (!attemptsStr.isEmpty()) {
            String[] parts = attemptsStr.split(",");
            for (String part : parts) {
                try {
                    list.add(Long.parseLong(part.trim()));
                } catch (NumberFormatException ignored) {}
            }
        }
        return list;
    }

    private void saveAttempts(List<Long> list) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            sb.append(list.get(i));
            if (i < list.size() - 1) {
                sb.append(",");
            }
        }
        prefs.edit().putString(KEY_ATTEMPTS, sb.toString()).apply();
    }

    public boolean isUnderOneMinuteCooldown() {
        if (isPremiumUser()) return false;
        long now = System.currentTimeMillis();
        return (now - getLastAnalysisTime()) < 60 * 1000;
    }

    public long getOneMinuteCooldownRemainingMs() {
        long now = System.currentTimeMillis();
        long remaining = (getLastAnalysisTime() + 60 * 1000) - now;
        return Math.max(0, remaining);
    }

    public boolean isUnderFiveMinuteLock() {
        if (isPremiumUser()) return false;
        long now = System.currentTimeMillis();
        return now < getLockUntil();
    }

    public long getFiveMinuteLockRemainingMs() {
        long now = System.currentTimeMillis();
        long remaining = getLockUntil() - now;
        return Math.max(0, remaining);
    }

    public void registerAnalysisAttempt() {
        long now = System.currentTimeMillis();
        setLastAnalysisTime(now);

        List<Long> attempts = getAttempts();
        attempts.add(now);

        // Prune older than 5 minutes
        List<Long> recentAttempts = new ArrayList<>();
        for (Long t : attempts) {
            if (now - t < 5 * 60 * 1000) {
                recentAttempts.add(t);
            }
        }

        saveAttempts(recentAttempts);

        if (recentAttempts.size() >= 4) {
            // Lock for 5 minutes
            setLockUntil(now + 5 * 60 * 1000);
        }
    }
}
