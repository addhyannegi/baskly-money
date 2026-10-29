package money.baskly.auth;

import money.baskly.auth.dto.*;
import money.baskly.auth.model.AccountStatus;
import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;
import money.baskly.auth.repository.InMemoryAuthAccountRepository;
import money.baskly.auth.security.JwtTokenProvider;
import money.baskly.auth.service.AuthService;
import money.baskly.auth.service.EmailService;
import money.baskly.auth.service.GoogleAuthService;
import money.baskly.auth.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private InMemoryAuthAccountRepository repository;
    private OtpService otpService;
    private GoogleAuthService googleAuthService;
    private JwtTokenProvider tokenProvider;
    private EmailService emailService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        repository = new InMemoryAuthAccountRepository();
        emailService = Mockito.mock(EmailService.class);
        otpService = new OtpService(emailService);
        googleAuthService = Mockito.mock(GoogleAuthService.class);
        tokenProvider = new JwtTokenProvider("test-secret-key-that-is-at-least-32-chars-long!", 3600);
        authService = new AuthService(repository, otpService, googleAuthService, tokenProvider);
    }

    private RegisterRequest createValidRequest(String email) {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Vikram");
        req.setLastName("Malhotra");
        req.setDateOfBirth(LocalDate.now().minusYears(25)); // 25 years old
        req.setEmail(email);
        req.setMobileNumber("9876543299");
        req.setAddressLine1("12 Brigade Road");
        req.setCity("Bengaluru");
        req.setState("Karnataka");
        req.setCountry("India");
        req.setGender("Male");
        req.setPassword("SecurePass@123");
        req.setConfirmPassword("SecurePass@123");
        req.setTermsAccepted(true);
        return req;
    }

    @Test
    @DisplayName("Successfully registers Customer with verified OTP grant and assigns CUSTOMER role")
    void testSuccessfulCustomerRegistration() {
        String email = "vikram.m@example.com";
        otpService.sendOtp(email);
        // Verify with generated OTP
        String otp = emailService.getLastTestOtp(email);
        // In unit test where emailService is mocked, we can create a grant directly
        String grant = otpService.createGoogleVerificationGrant(email);

        RegisterRequest req = createValidRequest(email);
        req.setEmailVerificationGrant(grant);

        AuthResponse res = authService.registerCustomer(req);

        assertTrue(res.isSuccess());
        assertNotNull(res.getUser());
        assertEquals("CUSTOMER", res.getUser().getRole());
        assertEquals(email, res.getUser().getEmail());
        assertNotNull(res.getToken());

        // Verify in repository
        Optional<AuthAccount> savedOpt = repository.findByEmail(email);
        assertTrue(savedOpt.isPresent());
        AuthAccount saved = savedOpt.get();
        assertEquals(Role.CUSTOMER, saved.getRole());
        assertTrue(saved.isEmailVerified());
        assertNotEquals("SecurePass@123", saved.getPasswordHash()); // Hashed
    }

    @Test
    @DisplayName("Rejects registration if customer is under 18 years old")
    void testUnderageRejection() {
        String email = "minor@example.com";
        String grant = otpService.createGoogleVerificationGrant(email);

        RegisterRequest req = createValidRequest(email);
        req.setDateOfBirth(LocalDate.now().minusYears(17).minusDays(364)); // under 18
        req.setEmailVerificationGrant(grant);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.registerCustomer(req));
        assertTrue(ex.getMessage().contains("at least 18 years of age"));
    }

    @Test
    @DisplayName("Rejects registration if password and confirm password do not match")
    void testPasswordMismatch() {
        String email = "mismatch@example.com";
        String grant = otpService.createGoogleVerificationGrant(email);

        RegisterRequest req = createValidRequest(email);
        req.setEmailVerificationGrant(grant);
        req.setConfirmPassword("DifferentPass@123");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.registerCustomer(req));
        assertTrue(ex.getMessage().contains("do not match"));
    }

    @Test
    @DisplayName("Rejects registration if Terms and Conditions are not accepted")
    void testTermsNotAccepted() {
        String email = "noterms@example.com";
        String grant = otpService.createGoogleVerificationGrant(email);

        RegisterRequest req = createValidRequest(email);
        req.setEmailVerificationGrant(grant);
        req.setTermsAccepted(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.registerCustomer(req));
        assertTrue(ex.getMessage().contains("Terms and Conditions"));
    }

    @Test
    @DisplayName("Rejects duplicate email registration")
    void testDuplicateEmail() {
        String email = "duplicate@example.com";
        String grant1 = otpService.createGoogleVerificationGrant(email);
        RegisterRequest req1 = createValidRequest(email);
        req1.setEmailVerificationGrant(grant1);
        authService.registerCustomer(req1);

        // Try second time with new grant
        String grant2 = otpService.createGoogleVerificationGrant(email);
        RegisterRequest req2 = createValidRequest(email);
        req2.setEmailVerificationGrant(grant2);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.registerCustomer(req2));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    @DisplayName("Rejects registration with invalid or already consumed OTP grant token")
    void testInvalidVerificationGrant() {
        RegisterRequest req = createValidRequest("nogrant@example.com");
        req.setEmailVerificationGrant("fake_or_reused_grant");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.registerCustomer(req));
        assertTrue(ex.getMessage().contains("verification token is invalid"));
    }

    @Test
    @DisplayName("Successful login with correct credentials and returns JWT session")
    void testSuccessfulLogin() {
        // Pre-seeded customer account from InMemoryAuthAccountRepository
        LoginRequest req = new LoginRequest();
        req.setEmail("customer@baskly.money");
        req.setPassword("CustomerPassword@123");

        AuthResponse res = authService.login(req);
        assertTrue(res.isSuccess());
        assertNotNull(res.getToken());
        assertEquals("CUSTOMER", res.getUser().getRole());
        assertEquals("/portal", res.getUser().getDefaultDashboardPath());
    }

    @Test
    @DisplayName("Login with invalid password returns generic failure message")
    void testInvalidPasswordLogin() {
        LoginRequest req = new LoginRequest();
        req.setEmail("customer@baskly.money");
        req.setPassword("WrongPassword@999");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.login(req));
        assertEquals("Invalid email or password.", ex.getMessage());
    }

    @Test
    @DisplayName("Login with unknown email returns generic failure message")
    void testUnknownEmailLogin() {
        LoginRequest req = new LoginRequest();
        req.setEmail("nonexistent@baskly.money");
        req.setPassword("SomePass@123");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.login(req));
        assertEquals("Invalid email or password.", ex.getMessage());
    }

    @Test
    @DisplayName("Disabled account cannot log in")
    void testDisabledAccountLogin() {
        Optional<AuthAccount> accOpt = repository.findByEmail("customer@baskly.money");
        assertTrue(accOpt.isPresent());
        AuthAccount acc = accOpt.get();
        acc.setAccountStatus(AccountStatus.DISABLED);
        repository.save(acc);

        LoginRequest req = new LoginRequest();
        req.setEmail("customer@baskly.money");
        req.setPassword("CustomerPassword@123");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                authService.login(req));
        assertTrue(ex.getMessage().contains("deactivated"));
    }

    @Test
    @DisplayName("1. Existing Google user signs in successfully")
    void testExistingGoogleUserSignIn() {
        // Pre-seeded customer has email customer@baskly.money
        when(googleAuthService.verifyGoogleIdToken("mock_existing_google_token")).thenReturn(
                new GoogleAuthService.GoogleIdentity("goog_customer_999", "customer@baskly.money", true,
                        "Customer", "User", "Customer User", "https://avatar.url")
        );

        AuthResponse res = authService.signInWithGoogle("mock_existing_google_token");
        assertTrue(res.isSuccess());
        assertNotNull(res.getUser());
        assertEquals("customer@baskly.money", res.getUser().getEmail());
        assertEquals("CUSTOMER", res.getUser().getRole());
        assertNotNull(res.getToken());
    }

    @Test
    @DisplayName("2. Unknown Google account attempting sign-in receives registration prompt")
    void testUnknownGoogleUserSignInReceivesPrompt() {
        when(googleAuthService.verifyGoogleIdToken("mock_unknown_google_token")).thenReturn(
                new GoogleAuthService.GoogleIdentity("goog_unknown_999", "unknown@gmail.com", true,
                        "Unknown", "Person", "Unknown Person", null)
        );

        AuthResponse res = authService.signInWithGoogle("mock_unknown_google_token");
        assertFalse(res.isSuccess());
        assertEquals("ACCOUNT_NOT_FOUND", res.getErrorCode());
        assertTrue(res.getMessage().contains("No account found for this Google account. Please create an account first."));
    }

    @Test
    @DisplayName("3. New Google user starts registration and receives a prefilled verified email")
    void testNewGoogleUserRegistrationInit() {
        when(googleAuthService.verifyGoogleIdToken("mock_new_google_token")).thenReturn(
                new GoogleAuthService.GoogleIdentity("sub_google_123", "newgoogle@example.com", true,
                        "Aarav", "Sharma", "Aarav Sharma", "https://avatar.url")
        );

        AuthResponse res = authService.initiateGoogleSignUp("mock_new_google_token");
        assertTrue(res.isNeedsProfileCompletion());
        assertNotNull(res.getPrefill());
        assertEquals("newgoogle@example.com", res.getPrefill().getEmail());
        assertEquals("Aarav", res.getPrefill().getFirstName());
        assertEquals("Sharma", res.getPrefill().getLastName());
        assertNotNull(res.getPrefill().getGoogleVerificationGrant());
    }

    @Test
    @DisplayName("4. Existing Google user attempting registration is not duplicated")
    void testExistingGoogleUserRegistrationBlocked() {
        when(googleAuthService.verifyGoogleIdToken("mock_existing_google_token")).thenReturn(
                new GoogleAuthService.GoogleIdentity("goog_customer_999", "customer@baskly.money", true,
                        "Customer", "User", "Customer User", "https://avatar.url")
        );

        AuthResponse res = authService.initiateGoogleSignUp("mock_existing_google_token");
        assertFalse(res.isSuccess());
        assertEquals("ACCOUNT_EXISTS", res.getErrorCode());
        assertTrue(res.getMessage().contains("An account already exists for this Google account. Please sign in instead."));
    }

    @Test
    @DisplayName("5. Invalid Google ID token is rejected")
    void testInvalidGoogleTokenRejected() {
        when(googleAuthService.verifyGoogleIdToken("invalid_token")).thenThrow(
                new IllegalArgumentException("Invalid Google credentials: token signature or structure invalid.")
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.signInWithGoogle("invalid_token"));
        assertTrue(ex.getMessage().contains("Invalid Google credentials"));
    }

    @Test
    @DisplayName("6. Expired Google ID token is rejected")
    void testExpiredGoogleTokenRejected() {
        when(googleAuthService.verifyGoogleIdToken("expired_token")).thenThrow(
                new IllegalArgumentException("Google token has expired.")
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.signInWithGoogle("expired_token"));
        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("7. Unverified Google email is rejected")
    void testUnverifiedGoogleEmailRejected() {
        when(googleAuthService.verifyGoogleIdToken("unverified_token")).thenThrow(
                new IllegalArgumentException("Google account email address is not verified by Google.")
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.signInWithGoogle("unverified_token"));
        assertTrue(ex.getMessage().contains("not verified"));
    }

    @Test
    @DisplayName("8. Google Registration without Email OTP verification fails")
    void testGoogleRegistrationWithoutOtpFails() {
        String email = "google.reg@example.com";
        String googleGrant = otpService.createGoogleVerificationGrant(email, "goog_123", null);

        GoogleCompleteRegistrationRequest req = new GoogleCompleteRegistrationRequest();
        req.setEmail(email);
        req.setGoogleVerificationGrant(googleGrant);
        req.setEmailVerificationGrant("missing_or_fake_otp_grant");
        req.setFirstName("Rohan");
        req.setLastName("Investor");
        req.setDateOfBirth(LocalDate.now().minusYears(22));
        req.setMobileNumber("9876543210");
        req.setAddressLine1("10 MG Road");
        req.setCity("Mumbai");
        req.setState("Maharashtra");
        req.setCountry("India");
        req.setGender("Male");
        req.setPassword("SecurePass@123");
        req.setConfirmPassword("SecurePass@123");
        req.setTermsAccepted(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.completeGoogleRegistration(req));
        assertTrue(ex.getMessage().contains("Email OTP verification token is invalid"));
    }

    @Test
    @DisplayName("9. OTP verified for a different email cannot authorize registration")
    void testOtpVerifiedForDifferentEmailRejected() {
        String intendedEmail = "intended.user@example.com";
        String attackerEmail = "attacker@example.com";

        // Issue OTP grant for attacker's email
        String attackerOtpGrant = otpService.createGoogleVerificationGrant(attackerEmail);
        String googleGrant = otpService.createGoogleVerificationGrant(intendedEmail, "goog_intended", null);

        GoogleCompleteRegistrationRequest req = new GoogleCompleteRegistrationRequest();
        req.setEmail(intendedEmail); // trying to register intended email
        req.setGoogleVerificationGrant(googleGrant);
        req.setEmailVerificationGrant(attackerOtpGrant); // using attacker's OTP grant
        req.setFirstName("Intended");
        req.setLastName("User");
        req.setDateOfBirth(LocalDate.now().minusYears(24));
        req.setMobileNumber("9876543210");
        req.setAddressLine1("10 MG Road");
        req.setCity("Mumbai");
        req.setState("Maharashtra");
        req.setCountry("India");
        req.setGender("Male");
        req.setPassword("SecurePass@123");
        req.setConfirmPassword("SecurePass@123");
        req.setTermsAccepted(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.completeGoogleRegistration(req));
        assertTrue(ex.getMessage().contains("Email OTP verification token is invalid"));
    }

    @Test
    @DisplayName("10. Expired or reused verification grants are rejected")
    void testExpiredOrReusedVerificationGrant() {
        String email = "reused.grant@example.com";
        String googleGrant = otpService.createGoogleVerificationGrant(email, "goog_reused", null);
        String otpGrant = otpService.createGoogleVerificationGrant(email);

        GoogleCompleteRegistrationRequest req = new GoogleCompleteRegistrationRequest();
        req.setEmail(email);
        req.setGoogleVerificationGrant(googleGrant);
        req.setEmailVerificationGrant(otpGrant);
        req.setFirstName("Rohan");
        req.setLastName("User");
        req.setDateOfBirth(LocalDate.now().minusYears(26));
        req.setMobileNumber("9876543210");
        req.setAddressLine1("10 MG Road");
        req.setCity("Mumbai");
        req.setState("Maharashtra");
        req.setCountry("India");
        req.setGender("Male");
        req.setPassword("SecurePass@123");
        req.setConfirmPassword("SecurePass@123");
        req.setTermsAccepted(true);

        // First registration succeeds
        AuthResponse res = authService.completeGoogleRegistration(req);
        assertTrue(res.isSuccess());

        // Reusing the same consumed grant fails
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.completeGoogleRegistration(req));
        assertTrue(ex.getMessage().contains("expired or invalid"));
    }

    @Test
    @DisplayName("11. Google registration with missing password is rejected")
    void testMissingPasswordRejected() {
        String email = "nopassword@example.com";
        String googleGrant = otpService.createGoogleVerificationGrant(email, "goog_nopass", null);
        String otpGrant = otpService.createGoogleVerificationGrant(email);

        GoogleCompleteRegistrationRequest req = new GoogleCompleteRegistrationRequest();
        req.setEmail(email);
        req.setGoogleVerificationGrant(googleGrant);
        req.setEmailVerificationGrant(otpGrant);
        req.setFirstName("NoPass");
        req.setLastName("User");
        req.setDateOfBirth(LocalDate.now().minusYears(22));
        req.setMobileNumber("9876543210");
        req.setAddressLine1("10 MG Road");
        req.setCity("Mumbai");
        req.setState("Maharashtra");
        req.setCountry("India");
        req.setGender("Male");
        req.setPassword(""); // Missing password
        req.setConfirmPassword("");
        req.setTermsAccepted(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.completeGoogleRegistration(req));
        assertTrue(ex.getMessage().contains("Password is required"));
    }

    @Test
    @DisplayName("14. Public registration strictly creates CUSTOMER role, never privileged roles")
    void testPublicRegistrationStrictlyAssignsCustomerRole() {
        String email = "strictlycustomer@example.com";
        String grant = otpService.createGoogleVerificationGrant(email);

        RegisterRequest req = createValidRequest(email);
        req.setEmailVerificationGrant(grant);

        AuthResponse res = authService.registerCustomer(req);
        assertTrue(res.isSuccess());
        assertEquals("CUSTOMER", res.getUser().getRole());

        AuthAccount saved = repository.findByEmail(email).orElseThrow();
        assertEquals(Role.CUSTOMER, saved.getRole());
        assertNotEquals(Role.ADMIN, saved.getRole());
        assertNotEquals(Role.FUND_MANAGER, saved.getRole());
        assertNotEquals(Role.SUPPORT, saved.getRole());
    }

    @Test
    @DisplayName("18. Dashboard routing paths respect all four authenticated roles")
    void testRoleDashboardPaths() {
        assertEquals("/portal", Role.CUSTOMER.getDefaultDashboardPath());
        assertEquals("/dashboard/admin", Role.ADMIN.getDefaultDashboardPath());
        assertEquals("/dashboard/fund-manager", Role.FUND_MANAGER.getDefaultDashboardPath());
        assertEquals("/dashboard/support", Role.SUPPORT.getDefaultDashboardPath());
    }
}
