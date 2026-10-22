package money.baskly.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import money.baskly.auth.dto.LoginRequest;
import money.baskly.auth.dto.RegisterRequest;
import money.baskly.auth.dto.SendOtpRequest;
import money.baskly.auth.dto.VerifyOtpRequest;
import money.baskly.auth.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmailService emailService;

    @Test
    @DisplayName("POST /api/auth/email-otp/send & /verify workflow succeeds")
    void testOtpWorkflow() throws Exception {
        String testEmail = "controller.otp@baskly.money";

        SendOtpRequest sendReq = new SendOtpRequest();
        sendReq.setEmail(testEmail);

        mockMvc.perform(post("/api/auth/email-otp/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        String otp = emailService.getLastTestOtp(testEmail);
        assertNotNull(otp);

        VerifyOtpRequest verifyReq = new VerifyOtpRequest();
        verifyReq.setEmail(testEmail);
        verifyReq.setOtp(otp);

        mockMvc.perform(post("/api/auth/email-otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.grantToken").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/auth/login sets HTTP-Only baskly_session cookie")
    void testLoginSetsHttpOnlyCookie() throws Exception {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("customer@baskly.money");
        loginReq.setPassword("CustomerPassword@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("baskly_session"))
                .andExpect(cookie().httpOnly("baskly_session", true))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.user.defaultDashboardPath").value("/dashboard/customer"));
    }

    @Test
    @DisplayName("POST /api/auth/register fails with 400 when missing mandatory fields")
    void testRegisterMissingMandatoryFields() throws Exception {
        RegisterRequest emptyReq = new RegisterRequest();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/auth/logout clears baskly_session cookie")
    void testLogoutClearsCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("baskly_session", 0))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/auth/me returns 401 when unauthenticated")
    void testMeUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/google for unknown user returns 404 ACCOUNT_NOT_FOUND")
    void testGoogleSignInUnknownUserReturns404() throws Exception {
        money.baskly.auth.dto.GoogleLoginRequest req = new money.baskly.auth.dto.GoogleLoginRequest();
        req.setIdToken("mock_google_unknown_visitor@gmail.com");
        req.setIntent("SIGN_IN");

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("No account found for this Google account. Please create an account first."));
    }

    @Test
    @DisplayName("POST /api/auth/google for new user with SIGN_UP intent returns 200 with prefill")
    void testGoogleSignUpNewUserReturnsPrefill() throws Exception {
        money.baskly.auth.dto.GoogleLoginRequest req = new money.baskly.auth.dto.GoogleLoginRequest();
        req.setIdToken("mock_google_fresh_user@gmail.com");
        req.setIntent("SIGN_UP");

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.needsProfileCompletion").value(true))
                .andExpect(jsonPath("$.prefill.email").value("fresh_user@gmail.com"))
                .andExpect(jsonPath("$.prefill.googleVerificationGrant").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/auth/google for existing user with SIGN_UP intent returns 409 ACCOUNT_EXISTS")
    void testGoogleSignUpExistingUserReturns409() throws Exception {
        money.baskly.auth.dto.GoogleLoginRequest req = new money.baskly.auth.dto.GoogleLoginRequest();
        req.setIdToken("mock_google_customer@baskly.money");
        req.setIntent("SIGN_UP");

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_EXISTS"))
                .andExpect(jsonPath("$.message").value("An account already exists for this Google account. Please sign in instead."));
    }

    @Test
    @DisplayName("POST /api/auth/google for existing user with SIGN_IN intent sets baskly_session cookie")
    void testGoogleSignInExistingUserSetsCookie() throws Exception {
        money.baskly.auth.dto.GoogleLoginRequest req = new money.baskly.auth.dto.GoogleLoginRequest();
        req.setIdToken("mock_google_customer@baskly.money");
        req.setIntent("SIGN_IN");

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("baskly_session"))
                .andExpect(cookie().httpOnly("baskly_session", true))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.email").value("customer@baskly.money"))
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"));
    }
}
