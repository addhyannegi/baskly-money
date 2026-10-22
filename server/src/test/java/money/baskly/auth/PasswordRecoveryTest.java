package money.baskly.auth;

import money.baskly.auth.model.AccountStatus;
import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;
import money.baskly.auth.repository.InMemoryAuthAccountRepository;
import money.baskly.auth.service.EmailService;
import money.baskly.auth.service.PasswordRecoveryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

class PasswordRecoveryTest {

    private InMemoryAuthAccountRepository repository;
    private EmailService emailService;
    private PasswordRecoveryService recoveryService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        repository = new InMemoryAuthAccountRepository();
        emailService = Mockito.mock(EmailService.class);
        recoveryService = new PasswordRecoveryService(repository, emailService);
    }

    @Test
    @DisplayName("Requesting password reset returns generic message and dispatches reset link")
    void testRequestPasswordResetGeneric() {
        String msg = recoveryService.requestPasswordReset("customer@baskly.money");
        assertTrue(msg.contains("instructions have been sent"));

        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetEmail(eq("customer@baskly.money"), linkCaptor.capture(), anyInt());

        String link = linkCaptor.getValue();
        assertTrue(link.contains("/reset-password?token="));

        // Non-existent user also gets generic response (prevents account enumeration)
        String msgNonExistent = recoveryService.requestPasswordReset("unknown@baskly.money");
        assertEquals(msg, msgNonExistent);
    }

    @Test
    @DisplayName("Resets password successfully with valid recovery token")
    void testSuccessfulReset() {
        recoveryService.requestPasswordReset("customer@baskly.money");

        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetEmail(eq("customer@baskly.money"), linkCaptor.capture(), anyInt());
        String link = linkCaptor.getValue();
        String token = link.substring(link.indexOf("token=") + 6);

        recoveryService.resetPassword(token, "BrandNewPass@2026", "BrandNewPass@2026");

        Optional<AuthAccount> accOpt = repository.findByEmail("customer@baskly.money");
        assertTrue(accOpt.isPresent());
        assertTrue(passwordEncoder.matches("BrandNewPass@2026", accOpt.get().getPasswordHash()));
    }

    @Test
    @DisplayName("Rejects token reuse")
    void testTokenReuseRejected() {
        recoveryService.requestPasswordReset("customer@baskly.money");

        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetEmail(eq("customer@baskly.money"), linkCaptor.capture(), anyInt());
        String link = linkCaptor.getValue();
        String token = link.substring(link.indexOf("token=") + 6);

        recoveryService.resetPassword(token, "BrandNewPass@2026", "BrandNewPass@2026");

        // Second attempt with same token fails
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                recoveryService.resetPassword(token, "AnotherPass@2026", "AnotherPass@2026"));
        assertTrue(ex.getMessage().contains("invalid or has expired"));
    }

    @Test
    @DisplayName("Rejects weak password during reset")
    void testWeakPasswordRejected() {
        recoveryService.requestPasswordReset("customer@baskly.money");

        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetEmail(eq("customer@baskly.money"), linkCaptor.capture(), anyInt());
        String link = linkCaptor.getValue();
        String token = link.substring(link.indexOf("token=") + 6);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                recoveryService.resetPassword(token, "weak", "weak"));
        assertTrue(ex.getMessage().contains("at least 8 characters"));
    }
}
