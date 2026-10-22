package money.baskly.auth.service;

import money.baskly.auth.dto.*;
import money.baskly.auth.model.AccountStatus;
import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;
import money.baskly.auth.repository.AuthAccountRepository;
import money.baskly.auth.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.Optional;
import java.util.Set;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private static final Set<String> ALLOWED_GENDERS = Set.of(
            "Male", "Female", "Transgender", "Non-binary", "Prefer not to say", "Other"
    );

    private final AuthAccountRepository accountRepository;
    private final OtpService otpService;
    private final GoogleAuthService googleAuthService;
    private final JwtTokenProvider tokenProvider;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(AuthAccountRepository accountRepository,
                       OtpService otpService,
                       GoogleAuthService googleAuthService,
                       JwtTokenProvider tokenProvider) {
        this.accountRepository = accountRepository;
        this.otpService = otpService;
        this.googleAuthService = googleAuthService;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Public Customer Registration.
     * Enforces all mandatory fields, calendar age >= 18, OTP verification grant, and BCrypt hashing.
     * Public registration ALWAYS assigns the CUSTOMER role.
     */
    public AuthResponse registerCustomer(RegisterRequest req) {
        // 1. Sanitize & Normalize Inputs
        String firstName = req.getFirstName() != null ? req.getFirstName().trim() : "";
        String middleName = req.getMiddleName() != null ? req.getMiddleName().trim() : null;
        String lastName = req.getLastName() != null ? req.getLastName().trim() : "";
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";

        if (firstName.isEmpty() || lastName.isEmpty()) {
            throw new IllegalArgumentException("First name and last name cannot be empty.");
        }

        // 2. Validate Calendar Age >= 18
        validateMinimumAge(req.getDateOfBirth());

        // 3. Validate Gender
        if (req.getGender() == null || !ALLOWED_GENDERS.contains(req.getGender())) {
            throw new IllegalArgumentException("Please select a valid gender option from the list.");
        }

        // 4. Validate Terms & Conditions Explicit Acceptance
        if (req.getTermsAccepted() == null || !req.getTermsAccepted()) {
            throw new IllegalArgumentException("You must explicitly agree to the Terms and Conditions to register.");
        }

        // 5. Check Email Uniqueness
        if (accountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email address already exists. Please sign in.");
        }

        // 6. Authoritative Server-side Verification Grant Validation (Bound to Email)
        boolean grantValid = otpService.consumeVerificationGrant(req.getEmailVerificationGrant(), email);
        if (!grantValid) {
            throw new IllegalArgumentException("Email verification token is invalid or has expired. Please verify your email with OTP.");
        }

        // 7. Password Matching & Strength Validation
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match.");
        }
        PasswordRecoveryService.validatePasswordStrength(req.getPassword());

        // 8. Construct Account Model - Role is STRICTLY forced to CUSTOMER
        AuthAccount account = new AuthAccount(
                null,
                firstName,
                middleName,
                lastName,
                req.getDateOfBirth(),
                email,
                true, // Email verified through valid server grant
                req.getMobileCountryCode() != null ? req.getMobileCountryCode() : "+91",
                req.getMobileNumber() != null ? req.getMobileNumber().trim() : "",
                req.getAddressLine1() != null ? req.getAddressLine1().trim() : "",
                req.getAddressLine2() != null ? req.getAddressLine2().trim() : null,
                req.getCity() != null ? req.getCity().trim() : "",
                req.getState() != null ? req.getState().trim() : "",
                req.getCountry() != null ? req.getCountry().trim() : "",
                req.getGender(),
                req.getTermsVersion() != null ? req.getTermsVersion() : "v1.0",
                Instant.now(),
                passwordEncoder.encode(req.getPassword()),
                AccountStatus.ACTIVE,
                Role.CUSTOMER, // Strict Public Registration Restriction
                null,
                "https://api.dicebear.com/7.x/initials/svg?seed=" + firstName + lastName
        );

        AuthAccount saved = accountRepository.save(account);
        log.info("Successfully registered new CUSTOMER account: {}", email);

        String token = tokenProvider.generateToken(saved);
        return AuthResponse.authenticated("Registration successful. Welcome to Baskly.money!", 
                UserSummaryDto.fromAccount(saved), token);
    }

    /**
     * Password-based Sign-In.
     */
    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
        String password = req.getPassword();

        Optional<AuthAccount> accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            // Generic message to prevent account enumeration
            throw new IllegalArgumentException("Invalid email or password.");
        }

        AuthAccount account = accountOpt.get();

        if (account.getPasswordHash() == null) {
            throw new IllegalArgumentException("This account was created with Google. Please use Google Sign-In or reset your password.");
        }

        if (!passwordEncoder.matches(password, account.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        if (account.getAccountStatus() == AccountStatus.DISABLED) {
            throw new IllegalStateException("Your account has been deactivated. Please contact support.");
        }

        account.setLastLoginAt(Instant.now());
        accountRepository.save(account);

        String token = tokenProvider.generateToken(account);
        return AuthResponse.authenticated("Sign in successful.", UserSummaryDto.fromAccount(account), token);
    }

    /**
     * Google Sign-In: Authenticates existing Google-linked users.
     * If the account does NOT exist, returns accountNotFound error without creating an account.
     */
    public AuthResponse signInWithGoogle(String idToken) {
        GoogleAuthService.GoogleIdentity identity = googleAuthService.verifyGoogleIdToken(idToken);
        String email = identity.getEmail().toLowerCase();

        // Search for existing account by googleId or verified email
        Optional<AuthAccount> accountOpt = accountRepository.findByGoogleId(identity.getGoogleId());
        if (accountOpt.isEmpty()) {
            accountOpt = accountRepository.findByEmail(email);
        }

        if (accountOpt.isEmpty()) {
            return AuthResponse.accountNotFound("No account found for this Google account. Please create an account first.");
        }

        AuthAccount account = accountOpt.get();

        if (account.getAccountStatus() == AccountStatus.DISABLED) {
            throw new IllegalStateException("Your account has been deactivated. Please contact support.");
        }

        // Link googleId if not yet linked
        if (account.getGoogleId() == null) {
            account.setGoogleId(identity.getGoogleId());
        }
        if (account.getAvatar() == null && identity.getPicture() != null) {
            account.setAvatar(identity.getPicture());
        }
        account.setLastLoginAt(Instant.now());
        accountRepository.save(account);

        String token = tokenProvider.generateToken(account);
        return AuthResponse.authenticated("Google sign-in successful.", UserSummaryDto.fromAccount(account), token);
    }

    /**
     * Google Sign-Up Initiation:
     * Verifies Google token, checks for duplicates, and provides prefill + Google verification grant.
     */
    public AuthResponse initiateGoogleSignUp(String idToken) {
        GoogleAuthService.GoogleIdentity identity = googleAuthService.verifyGoogleIdToken(idToken);
        String email = identity.getEmail().toLowerCase();

        // Check if an account already exists
        Optional<AuthAccount> accountOpt = accountRepository.findByGoogleId(identity.getGoogleId());
        if (accountOpt.isEmpty()) {
            accountOpt = accountRepository.findByEmail(email);
        }

        if (accountOpt.isPresent()) {
            return AuthResponse.accountExists("An account already exists for this Google account. Please sign in instead.");
        }

        // New User: Create Google verification grant bound to email, googleId, and avatar
        String grantToken = otpService.createGoogleVerificationGrant(email, identity.getGoogleId(), identity.getPicture());
        GooglePrefillDto prefill = new GooglePrefillDto(
                identity.getGivenName(),
                identity.getFamilyName(),
                email,
                identity.getPicture(),
                grantToken
        );

        return AuthResponse.googleProfileCompletionRequired(prefill);
    }

    /**
     * Google Authentication dispatcher accepting optional intent ("SIGN_IN" or "SIGN_UP").
     */
    public AuthResponse loginWithGoogle(String idToken, String intent) {
        if ("SIGN_UP".equalsIgnoreCase(intent)) {
            return initiateGoogleSignUp(idToken);
        }
        return signInWithGoogle(idToken);
    }

    public AuthResponse loginWithGoogle(String idToken) {
        return loginWithGoogle(idToken, "SIGN_IN");
    }

    /**
     * Completes registration for users authenticating via Google.
     * Enforces:
     * - Valid, single-use Google verification grant bound to the email
     * - Mandatory Email OTP verification grant bound to the same email
     * - Minimum calendar age >= 18
     * - Gender selection from allowed values
     * - Mandatory password and confirmation meeting security policy
     * - Explicit Terms and Conditions agreement
     * - Strictly assigns Role.CUSTOMER
     */
    public AuthResponse completeGoogleRegistration(GoogleCompleteRegistrationRequest req) {
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";

        // 1. Authoritative Google grant validation (bound to email, single-use)
        OtpService.VerificationGrant googleGrant = otpService.consumeAndGetGrant(req.getGoogleVerificationGrant(), email);
        if (googleGrant == null) {
            throw new IllegalArgumentException("Google verification session expired or invalid. Please sign in with Google again.");
        }

        // 2. Mandatory Email OTP verification grant validation (bound to same email, single-use)
        boolean otpValid = otpService.consumeVerificationGrant(req.getEmailVerificationGrant(), email);
        if (!otpValid) {
            throw new IllegalArgumentException("Email OTP verification token is invalid or has expired. Please verify your email with OTP.");
        }

        // 3. Prevent duplicate account creation
        if (accountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists. Please sign in instead.");
        }

        // 4. Validate Minimum Age >= 18
        validateMinimumAge(req.getDateOfBirth());

        // 5. Validate Gender
        if (req.getGender() == null || !ALLOWED_GENDERS.contains(req.getGender())) {
            throw new IllegalArgumentException("Please select a valid gender option from the list.");
        }

        // 6. Validate Terms & Conditions
        if (req.getTermsAccepted() == null || !req.getTermsAccepted()) {
            throw new IllegalArgumentException("You must explicitly agree to the Terms and Conditions to register.");
        }

        // 7. Mandatory Password & Confirmation Validation
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match.");
        }
        PasswordRecoveryService.validatePasswordStrength(req.getPassword());

        String avatarUrl = googleGrant.getAvatar();
        if (avatarUrl == null || avatarUrl.isBlank()) {
            avatarUrl = "https://api.dicebear.com/7.x/initials/svg?seed=" + req.getFirstName() + req.getLastName();
        }

        AuthAccount account = new AuthAccount(
                null,
                req.getFirstName().trim(),
                req.getMiddleName() != null ? req.getMiddleName().trim() : null,
                req.getLastName().trim(),
                req.getDateOfBirth(),
                email,
                true, // Verified via Google identity AND email OTP
                req.getMobileCountryCode() != null ? req.getMobileCountryCode() : "+91",
                req.getMobileNumber().trim(),
                req.getAddressLine1().trim(),
                req.getAddressLine2() != null ? req.getAddressLine2().trim() : null,
                req.getCity().trim(),
                req.getState().trim(),
                req.getCountry().trim(),
                req.getGender(),
                req.getTermsVersion() != null ? req.getTermsVersion() : "v1.0",
                Instant.now(),
                passwordEncoder.encode(req.getPassword()),
                AccountStatus.ACTIVE,
                Role.CUSTOMER, // Strict Public Registration Restriction: CUSTOMER only
                googleGrant.getGoogleId(),
                avatarUrl
        );

        AuthAccount saved = accountRepository.save(account);
        log.info("Successfully registered new Google CUSTOMER: {}", email);

        String token = tokenProvider.generateToken(saved);
        return AuthResponse.authenticated("Registration completed successfully. Welcome to Baskly.money!",
                UserSummaryDto.fromAccount(saved), token);
    }

    public UserSummaryDto getCurrentUser(String userId) {
        AuthAccount account = accountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User session not found."));
        return UserSummaryDto.fromAccount(account);
    }

    /**
     * Authoritative Calendar Date calculation for Minimum Age 18.
     * Accurately checks year, month, and day-of-month boundaries.
     */
    public static void validateMinimumAge(LocalDate dob) {
        if (dob == null) {
            throw new IllegalArgumentException("Date of birth is required.");
        }
        LocalDate today = LocalDate.now();
        if (dob.isAfter(today)) {
            throw new IllegalArgumentException("Date of birth cannot be in the future.");
        }
        Period period = Period.between(dob, today);
        if (period.getYears() < 18) {
            throw new IllegalArgumentException("You must be at least 18 years of age to register on Baskly.money.");
        }
    }
}
