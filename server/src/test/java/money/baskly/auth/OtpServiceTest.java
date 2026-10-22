package money.baskly.auth;

import money.baskly.auth.service.EmailService;
import money.baskly.auth.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;

class OtpServiceTest {

    private EmailService emailService;
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        emailService = Mockito.mock(EmailService.class);
        otpService = new OtpService(emailService);
    }

    @Test
    @DisplayName("Sends 6-digit OTP and dispatches through EmailService")
    void testSendOtpSuccess() {
        String email = "investor@example.com";
        OtpService.SendOtpResult result = otpService.sendOtp(email);

        assertTrue(result.isSuccess());
        assertEquals(60, result.getCooldownRemainingSeconds());

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendOtpEmail(Mockito.eq(email), otpCaptor.capture(), Mockito.eq(5));

        String generatedOtp = otpCaptor.getValue();
        assertNotNull(generatedOtp);
        assertEquals(6, generatedOtp.length());
        assertTrue(generatedOtp.matches("^\\d{6}$"));
    }

    @Test
    @DisplayName("Enforces 60-second resend cooldown")
    void testResendCooldown() {
        String email = "cooldown@example.com";
        otpService.sendOtp(email);

        // Immediate second attempt
        OtpService.SendOtpResult secondResult = otpService.sendOtp(email);
        assertFalse(secondResult.isSuccess());
        assertTrue(secondResult.getCooldownRemainingSeconds() > 0);
        assertTrue(secondResult.getMessage().contains("Please wait"));
    }

    @Test
    @DisplayName("Verifies OTP successfully and returns single-use verification grant")
    void testSuccessfulVerification() {
        String email = "verify@example.com";
        otpService.sendOtp(email);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendOtpEmail(Mockito.eq(email), otpCaptor.capture(), Mockito.eq(5));
        String code = otpCaptor.getValue();

        OtpService.VerifyOtpResult result = otpService.verifyOtp(email, code);
        assertTrue(result.isVerified());
        assertNotNull(result.getGrantToken());
        assertTrue(result.getGrantToken().startsWith("grant_"));

        // Single-use guarantee: verifying again with the same OTP fails
        OtpService.VerifyOtpResult secondVerify = otpService.verifyOtp(email, code);
        assertFalse(secondVerify.isVerified());
    }

    @Test
    @DisplayName("Rejects incorrect OTP and tracks failed attempts")
    void testIncorrectOtp() {
        String email = "wrong@example.com";
        otpService.sendOtp(email);

        OtpService.VerifyOtpResult result = otpService.verifyOtp(email, "000000");
        assertFalse(result.isVerified());
        assertTrue(result.getMessage().contains("Invalid OTP code"));
        assertTrue(result.getMessage().contains("4 attempt(s) remaining"));
    }

    @Test
    @DisplayName("Invalidates OTP after 5 failed verification attempts")
    void testExceedMaxAttempts() {
        String email = "maxattempts@example.com";
        otpService.sendOtp(email);

        for (int i = 0; i < 4; i++) {
            otpService.verifyOtp(email, "111111");
        }

        // 5th attempt
        OtpService.VerifyOtpResult fifthResult = otpService.verifyOtp(email, "111111");
        assertFalse(fifthResult.isVerified());
        assertTrue(fifthResult.getMessage().contains("invalidated"));
    }

    @Test
    @DisplayName("Verification grant token is single-use and bound to email")
    void testGrantTokenConsumption() {
        String email = "token@example.com";
        String grant = otpService.createGoogleVerificationGrant(email);

        // First consumption with correct email succeeds
        boolean consumed = otpService.consumeVerificationGrant(grant, email);
        assertTrue(consumed);

        // Second consumption fails (atomic single-use)
        boolean consumedAgain = otpService.consumeVerificationGrant(grant, email);
        assertFalse(consumedAgain);
    }

    @Test
    @DisplayName("Verification grant token cannot be used with a different email")
    void testGrantTokenEmailMismatch() {
        String grant = otpService.createGoogleVerificationGrant("alice@example.com");
        boolean consumed = otpService.consumeVerificationGrant(grant, "bob@example.com");
        assertFalse(consumed);
    }
}
