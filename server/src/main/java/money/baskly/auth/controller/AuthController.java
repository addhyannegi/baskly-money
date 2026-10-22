package money.baskly.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import money.baskly.auth.dto.*;
import money.baskly.auth.security.JwtTokenProvider;
import money.baskly.auth.service.AuthService;
import money.baskly.auth.service.OtpService;
import money.baskly.auth.service.PasswordRecoveryService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;
    private final PasswordRecoveryService passwordRecoveryService;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthService authService,
                          OtpService otpService,
                          PasswordRecoveryService passwordRecoveryService,
                          JwtTokenProvider tokenProvider) {
        this.authService = authService;
        this.otpService = otpService;
        this.passwordRecoveryService = passwordRecoveryService;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Customer Sign-Up (Public Registration).
     * Strictly creates CUSTOMER accounts.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req,
                                                 HttpServletRequest request) {
        AuthResponse res = authService.registerCustomer(req);
        boolean isSecure = request.isSecure();
        ResponseCookie cookie = tokenProvider.createAuthCookie(res.getToken(), isSecure);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(res);
    }

    /**
     * User Sign-In (Email + Password).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req,
                                              HttpServletRequest request) {
        AuthResponse res = authService.login(req);
        boolean isSecure = request.isSecure();
        ResponseCookie cookie = tokenProvider.createAuthCookie(res.getToken(), isSecure);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(res);
    }

    /**
     * Google Authentication dispatcher: Handles both Sign-In and Sign-Up initiation
     * depending on the intent field ("SIGN_IN" vs "SIGN_UP").
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@Valid @RequestBody GoogleLoginRequest req,
                                                   HttpServletRequest request) {
        AuthResponse res = authService.loginWithGoogle(req.getIdToken(), req.getIntent());

        if ("ACCOUNT_NOT_FOUND".equals(res.getErrorCode())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }
        if ("ACCOUNT_EXISTS".equals(res.getErrorCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
        }

        if (res.isSuccess() && !res.isNeedsProfileCompletion() && res.getToken() != null) {
            boolean isSecure = request.isSecure();
            ResponseCookie cookie = tokenProvider.createAuthCookie(res.getToken(), isSecure);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(res);
        }

        return ResponseEntity.ok(res);
    }

    /**
     * Explicit Google Sign-In endpoint.
     */
    @PostMapping("/google/signin")
    public ResponseEntity<AuthResponse> googleSignIn(@Valid @RequestBody GoogleLoginRequest req,
                                                     HttpServletRequest request) {
        AuthResponse res = authService.signInWithGoogle(req.getIdToken());
        if ("ACCOUNT_NOT_FOUND".equals(res.getErrorCode())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }

        boolean isSecure = request.isSecure();
        ResponseCookie cookie = tokenProvider.createAuthCookie(res.getToken(), isSecure);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(res);
    }

    /**
     * Explicit Google Sign-Up initiation endpoint.
     */
    @PostMapping("/google/signup-init")
    public ResponseEntity<AuthResponse> googleSignUpInit(@Valid @RequestBody GoogleLoginRequest req) {
        AuthResponse res = authService.initiateGoogleSignUp(req.getIdToken());
        if ("ACCOUNT_EXISTS".equals(res.getErrorCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
        }
        return ResponseEntity.ok(res);
    }

    /**
     * Complete Customer Registration for Google users.
     */
    @PostMapping("/google/complete-registration")
    public ResponseEntity<AuthResponse> completeGoogleRegistration(
            @Valid @RequestBody GoogleCompleteRegistrationRequest req,
            HttpServletRequest request) {
        AuthResponse res = authService.completeGoogleRegistration(req);
        boolean isSecure = request.isSecure();
        ResponseCookie cookie = tokenProvider.createAuthCookie(res.getToken(), isSecure);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(res);
    }

    /**
     * Logout: Invalidates session and clears HTTP-Only cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        boolean isSecure = request.isSecure();
        ResponseCookie cookie = tokenProvider.createLogoutCookie(isSecure);
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("success", true, "message", "Logged out successfully."));
    }

    /**
     * Returns currently authenticated user session.
     */
    @GetMapping("/me")
    public ResponseEntity<UserSummaryDto> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = (String) auth.getPrincipal();
        UserSummaryDto user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * Request Email Verification OTP.
     */
    @PostMapping("/email-otp/send")
    public ResponseEntity<OtpService.SendOtpResult> sendOtp(@Valid @RequestBody SendOtpRequest req) {
        OtpService.SendOtpResult result = otpService.sendOtp(req.getEmail());
        if (!result.isSuccess()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Verify Email OTP and receive short-lived single-use grant token.
     */
    @PostMapping("/email-otp/verify")
    public ResponseEntity<OtpService.VerifyOtpResult> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        OtpService.VerifyOtpResult result = otpService.verifyOtp(req.getEmail(), req.getOtp());
        if (!result.isVerified()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Request Password Recovery.
     */
    @PostMapping("/password/forgot")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String msg = passwordRecoveryService.requestPasswordReset(req.getEmail());
        return ResponseEntity.ok(Map.of("success", true, "message", msg));
    }

    /**
     * Reset Password using recovery token.
     */
    @PostMapping("/password/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        passwordRecoveryService.resetPassword(req.getToken(), req.getNewPassword(), req.getConfirmPassword());
        return ResponseEntity.ok(Map.of("success", true, "message", "Password has been successfully reset. Please sign in with your new password."));
    }
}
