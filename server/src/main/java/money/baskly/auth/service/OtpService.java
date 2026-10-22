package money.baskly.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    public static final int OTP_EXPIRY_MINUTES = 5;
    public static final int RESEND_COOLDOWN_SECONDS = 60;
    public static final int MAX_VERIFICATION_ATTEMPTS = 5;
    public static final int GRANT_TOKEN_VALIDITY_MINUTES = 15;

    @Value("${app.auth.dev-mode:true}")
    private boolean devMode;

    private final EmailService emailService;

    // Email -> Active OtpSession
    private final Map<String, OtpSession> activeOtps = new ConcurrentHashMap<>();

    // GrantToken -> Email
    private final Map<String, VerificationGrant> activeGrants = new ConcurrentHashMap<>();

    public OtpService(EmailService emailService) {
        this.emailService = emailService;
    }

    public static class OtpSession {
        private final String code;
        private final Instant createdAt;
        private final Instant expiresAt;
        private Instant lastSentAt;
        private int failedAttempts;

        public OtpSession(String code, Instant createdAt, Instant expiresAt) {
            this.code = code;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
            this.lastSentAt = createdAt;
            this.failedAttempts = 0;
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }

        public boolean isCooldownActive() {
            long elapsedSeconds = Duration.between(lastSentAt, Instant.now()).getSeconds();
            return elapsedSeconds < RESEND_COOLDOWN_SECONDS;
        }

        public long getCooldownRemainingSeconds() {
            long elapsedSeconds = Duration.between(lastSentAt, Instant.now()).getSeconds();
            return Math.max(0, RESEND_COOLDOWN_SECONDS - elapsedSeconds);
        }
    }

    public static class VerificationGrant {
        private final String grantToken;
        private final String email;
        private final Instant expiresAt;
        private final String googleId;
        private final String avatar;

        public VerificationGrant(String grantToken, String email, Instant expiresAt) {
            this(grantToken, email, expiresAt, null, null);
        }

        public VerificationGrant(String grantToken, String email, Instant expiresAt, String googleId, String avatar) {
            this.grantToken = grantToken;
            this.email = email;
            this.expiresAt = expiresAt;
            this.googleId = googleId;
            this.avatar = avatar;
        }

        public String getGrantToken() { return grantToken; }
        public String getEmail() { return email; }
        public Instant getExpiresAt() { return expiresAt; }
        public String getGoogleId() { return googleId; }
        public String getAvatar() { return avatar; }

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    public static class SendOtpResult {
        private final boolean success;
        private final String message;
        private final long cooldownSeconds;
        private final String testOtp; // null in production

        public SendOtpResult(boolean success, String message, long cooldownSeconds, String testOtp) {
            this.success = success;
            this.message = message;
            this.cooldownSeconds = cooldownSeconds;
            this.testOtp = testOtp;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public long getCooldownRemainingSeconds() { return cooldownSeconds; }
        public String getTestOtp() { return testOtp; }
    }

    public static class VerifyOtpResult {
        private final boolean verified;
        private final String message;
        private final String grantToken;

        public VerifyOtpResult(boolean verified, String message, String grantToken) {
            this.verified = verified;
            this.message = message;
            this.grantToken = grantToken;
        }

        public boolean isVerified() { return verified; }
        public String getMessage() { return message; }
        public String getGrantToken() { return grantToken; }
    }

    /**
     * Sends a 6-digit OTP to the specified email address.
     * Enforces resend cooldown, invalidates old OTPs, and handles dev mode.
     */
    public SendOtpResult sendOtp(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank() || !rawEmail.contains("@")) {
            return new SendOtpResult(false, "A valid email address is required.", 0, null);
        }

        String email = rawEmail.trim().toLowerCase();
        OtpSession existing = activeOtps.get(email);

        if (existing != null && !existing.isExpired() && existing.isCooldownActive()) {
            long remaining = existing.getCooldownRemainingSeconds();
            return new SendOtpResult(false, 
                    "Please wait " + remaining + " seconds before requesting a new OTP.", 
                    remaining, null);
        }

        // Generate cryptographically secure 6-digit numeric OTP
        int number = 100000 + RANDOM.nextInt(900000);
        String otpCode = String.valueOf(number);

        Instant now = Instant.now();
        Instant expiry = now.plus(Duration.ofMinutes(OTP_EXPIRY_MINUTES));
        OtpSession newSession = new OtpSession(otpCode, now, expiry);
        activeOtps.put(email, newSession);

        // Send via Email Service
        emailService.sendOtpEmail(email, otpCode, OTP_EXPIRY_MINUTES);

        String testOtp = devMode ? otpCode : null;
        return new SendOtpResult(true, "Verification OTP sent to " + email, RESEND_COOLDOWN_SECONDS, testOtp);
    }

    /**
     * Verifies the provided OTP code.
     * Enforces attempt limits, expiration, and single-use invalidation.
     * Returns a short-lived single-use grant token upon success.
     */
    public VerifyOtpResult verifyOtp(String rawEmail, String otpCode) {
        if (rawEmail == null || rawEmail.isBlank() || otpCode == null || otpCode.isBlank()) {
            return new VerifyOtpResult(false, "Email and OTP code are required.", null);
        }

        String email = rawEmail.trim().toLowerCase();
        OtpSession session = activeOtps.get(email);

        if (session == null) {
            return new VerifyOtpResult(false, "No OTP request found. Please request a new verification code.", null);
        }

        if (session.isExpired()) {
            activeOtps.remove(email);
            return new VerifyOtpResult(false, "OTP has expired. Please request a new one.", null);
        }

        if (session.failedAttempts >= MAX_VERIFICATION_ATTEMPTS) {
            activeOtps.remove(email);
            return new VerifyOtpResult(false, "Too many failed attempts. This OTP has been invalidated.", null);
        }

        if (!session.code.trim().equals(otpCode.trim())) {
            session.failedAttempts++;
            int attemptsLeft = MAX_VERIFICATION_ATTEMPTS - session.failedAttempts;
            if (attemptsLeft <= 0) {
                activeOtps.remove(email);
                return new VerifyOtpResult(false, "Too many incorrect attempts. OTP invalidated.", null);
            }
            return new VerifyOtpResult(false, "Invalid OTP code. " + attemptsLeft + " attempt(s) remaining.", null);
        }

        // Correct OTP: Invalidate OTP session immediately (single-use)
        activeOtps.remove(email);

        // Issue short-lived, single-use verification grant token
        String grantToken = "grant_" + UUID.randomUUID().toString().replace("-", "");
        Instant grantExpiry = Instant.now().plus(Duration.ofMinutes(GRANT_TOKEN_VALIDITY_MINUTES));
        activeGrants.put(grantToken, new VerificationGrant(grantToken, email, grantExpiry));

        return new VerifyOtpResult(true, "Email successfully verified.", grantToken);
    }

    /**
     * Validates and atomically consumes the verification grant token.
     * Returns the VerificationGrant if valid, or null if missing, expired, or email mismatch.
     */
    public VerificationGrant consumeAndGetGrant(String grantToken, String rawEmail) {
        if (grantToken == null || grantToken.isBlank() || rawEmail == null) {
            return null;
        }

        String email = rawEmail.trim().toLowerCase();
        VerificationGrant grant = activeGrants.remove(grantToken); // Atomic single-use removal

        if (grant == null) {
            return null;
        }

        if (grant.isExpired()) {
            return null;
        }

        if (!grant.email.equalsIgnoreCase(email)) {
            return null;
        }

        return grant;
    }

    /**
     * Validates and consumes the verification grant token.
     * Ensures that the token is valid, matches the email, and cannot be reused.
     */
    public boolean consumeVerificationGrant(String grantToken, String rawEmail) {
        return consumeAndGetGrant(grantToken, rawEmail) != null;
    }

    /**
     * Creates a pre-verified grant token for Google-authenticated users
     * whose email was verified directly by Google.
     */
    public String createGoogleVerificationGrant(String rawEmail, String googleId, String avatar) {
        String email = rawEmail.trim().toLowerCase();
        String grantToken = "google_grant_" + UUID.randomUUID().toString().replace("-", "");
        Instant grantExpiry = Instant.now().plus(Duration.ofMinutes(GRANT_TOKEN_VALIDITY_MINUTES));
        activeGrants.put(grantToken, new VerificationGrant(grantToken, email, grantExpiry, googleId, avatar));
        return grantToken;
    }

    public String createGoogleVerificationGrant(String rawEmail) {
        return createGoogleVerificationGrant(rawEmail, null, null);
    }
}
