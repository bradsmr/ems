package dev.bradleysummers.ems.security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {
    private static final int MAX_ATTEMPT = 5;
    private static final long LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

    private static class Attempt {
        int count;
        long lastFailedTime;
        long lockUntil;
    }

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attempts.remove(key);
    }

    private boolean isAdmin(String key) {
        // Allow multiple admin emails as needed
        String normalized = key.trim().toLowerCase();
        return normalized.equals("admin@example.com") || normalized.equals("admin@initech.com");
    }

    public void loginFailed(String key) {
        if (isAdmin(key)) return; // Do not lock out admin
        Attempt attempt = attempts.computeIfAbsent(key, k -> new Attempt());
        attempt.count++;
        attempt.lastFailedTime = System.currentTimeMillis();
        if (attempt.count >= MAX_ATTEMPT) {
            attempt.lockUntil = System.currentTimeMillis() + LOCK_TIME_MS;
        }
    }

    public boolean isBlocked(String key) {
        if (isAdmin(key)) return false; // Never block admin
        Attempt attempt = attempts.get(key);
        if (attempt == null) return false;
        if (attempt.lockUntil > System.currentTimeMillis()) {
            return true;
        }
        if (attempt.lockUntil != 0) {
            // Unlock after lock period
            attempts.remove(key);
        }
        return false;
    }
}
