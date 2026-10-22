package money.baskly.auth.service;

import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.repository.AuthAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordRecoveryService {

    private static final Logger log = LoggerFactory.getLogger(PasswordRecoveryService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    public static final int RECOVERY_TOKEN_EXPIRY_MINUTES = 15;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final AuthAccountRepository accountRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ResetToken -> ResetRecord
    private final Map<String, ResetRecord> resetTokens = new ConcurrentHashMap<>();

    public PasswordRecoveryService(AuthAccountRepository accountRepository, EmailService emailService) {
        this.accountRepository = accountRepository;
        this.emailService = emailService;
    }

    public static class ResetRecord {
        private final String token;
        private final String email;
        private final Instant expiresAt;

        public ResetRecord(String token, String email, Instant expiresAt) {
            this.token = token;
            this.email = email;
            this.expiresAt = expiresAt;
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }

        public String getEmail() { return email; }
    }

    /**
     * Initiates password recovery.
     * Always returns generic success message to prevent account enumeration.
     */
    public String requestPasswordReset(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank() || !rawEmail.contains("@")) {
            return "If an account exists with this email, password reset instructions have been sent.";
        }

        String email = rawEmail.trim().toLowerCase();
        Optional<AuthAccount> accountOpt = accountRepository.findByEmail(email);

        if (accountOpt.isPresent()) {
            byte[] bytes = new byte[32];
            RANDOM.nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

            Instant expiry = Instant.now().plus(Duration.ofMinutes(RECOVERY_TOKEN_EXPIRY_MINUTES));
            resetTokens.put(token, new ResetRecord(token, email, expiry));

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(email, resetLink, RECOVERY_TOKEN_EXPIRY_MINUTES);
            log.info("Password reset token generated for {}", email);
        } else {
            log.info("Password reset requested for non-existent email (silent generic response): {}", email);
        }

        return "If an account exists with this email, password reset instructions have been sent.";
    }

    /**
     * Resets the password using a valid recovery token.
     */
    public void resetPassword(String token, String newPassword, String confirmPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Password reset token is required.");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("New password cannot be empty.");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        validatePasswordStrength(newPassword);

        // Atomic removal (single-use guarantee)
        ResetRecord record = resetTokens.remove(token);
        if (record == null || record.isExpired()) {
            throw new IllegalArgumentException("Password reset link is invalid or has expired. Please request a new one.");
        }

        AuthAccount account = accountRepository.findByEmail(record.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User account could not be found."));

        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setUpdatedAt(Instant.now());
        accountRepository.save(account);

        log.info("Password successfully updated for user {}", record.getEmail());
    }

    public static void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }

        if (!hasUpper || !hasLower || !hasDigit) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
        }
    }
}
