package money.baskly.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token is required.")
    private String idToken;

    private String intent; // "SIGN_IN" or "SIGN_UP" (defaults to "SIGN_IN" if omitted)

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }
}
