package money.baskly.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private boolean success;
    private String message;
    private String errorCode; // e.g., ACCOUNT_NOT_FOUND, ACCOUNT_EXISTS
    private UserSummaryDto user;
    private String token;
    private boolean needsProfileCompletion;
    private GooglePrefillDto prefill;

    public AuthResponse() {}

    public static AuthResponse authenticated(String message, UserSummaryDto user, String token) {
        AuthResponse res = new AuthResponse();
        res.success = true;
        res.message = message;
        res.user = user;
        res.token = token;
        res.needsProfileCompletion = false;
        return res;
    }

    public static AuthResponse googleProfileCompletionRequired(GooglePrefillDto prefill) {
        AuthResponse res = new AuthResponse();
        res.success = true;
        res.message = "Google identity verified. Please complete your customer registration details.";
        res.needsProfileCompletion = true;
        res.prefill = prefill;
        return res;
    }

    public static AuthResponse accountNotFound(String message) {
        AuthResponse res = new AuthResponse();
        res.success = false;
        res.message = message;
        res.errorCode = "ACCOUNT_NOT_FOUND";
        return res;
    }

    public static AuthResponse accountExists(String message) {
        AuthResponse res = new AuthResponse();
        res.success = false;
        res.message = message;
        res.errorCode = "ACCOUNT_EXISTS";
        return res;
    }

    public static AuthResponse failure(String message) {
        AuthResponse res = new AuthResponse();
        res.success = false;
        res.message = message;
        return res;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public UserSummaryDto getUser() { return user; }
    public void setUser(UserSummaryDto user) { this.user = user; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public boolean isNeedsProfileCompletion() { return needsProfileCompletion; }
    public void setNeedsProfileCompletion(boolean needsProfileCompletion) { this.needsProfileCompletion = needsProfileCompletion; }

    public GooglePrefillDto getPrefill() { return prefill; }
    public void setPrefill(GooglePrefillDto prefill) { this.prefill = prefill; }
}
