package money.baskly.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);

    @Value("${app.auth.google.client-id:}")
    private String configuredClientId;

    @Value("${app.auth.dev-mode:true}")
    private boolean devMode;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class GoogleIdentity {
        private final String googleId;
        private final String email;
        private final boolean emailVerified;
        private final String givenName;
        private final String familyName;
        private final String name;
        private final String picture;

        public GoogleIdentity(String googleId, String email, boolean emailVerified,
                              String givenName, String familyName, String name, String picture) {
            this.googleId = googleId;
            this.email = email;
            this.emailVerified = emailVerified;
            this.givenName = givenName;
            this.familyName = familyName;
            this.name = name;
            this.picture = picture;
        }

        public String getGoogleId() { return googleId; }
        public String getEmail() { return email; }
        public boolean isEmailVerified() { return emailVerified; }
        public String getGivenName() { return givenName; }
        public String getFamilyName() { return familyName; }
        public String getName() { return name; }
        public String getPicture() { return picture; }
    }

    /**
     * Validates Google ID Token server-side.
     */
    public GoogleIdentity verifyGoogleIdToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Google ID token cannot be empty.");
        }

        // Development and test-mode simulated token handling
        if (devMode) {
            if (idToken.startsWith("mock_invalid_") || idToken.equals("invalid_token")) {
                throw new IllegalArgumentException("Invalid Google credentials: token signature or structure invalid.");
            }
            if (idToken.startsWith("mock_expired_")) {
                throw new IllegalArgumentException("Google token has expired.");
            }
            if (idToken.startsWith("mock_unverified_")) {
                throw new IllegalArgumentException("Google account email address is not verified by Google.");
            }
            if (idToken.startsWith("dev_google_") || idToken.startsWith("mock_google_")) {
                String email = idToken.replace("dev_google_", "").replace("mock_google_", "");
                if (!email.contains("@")) email = "investor@gmail.com";
                log.info("[Dev Mode] Bypassing Google network tokeninfo for simulated token: {}", email);
                return new GoogleIdentity(
                        "goog_" + Math.abs(email.hashCode()),
                        email.toLowerCase(),
                        true,
                        "Rohan",
                        "Investor",
                        "Rohan Investor",
                        "https://api.dicebear.com/7.x/initials/svg?seed=RohanInvestor"
                );
            }
        }

        try {
            // Authoritative server-side verification via Google's tokeninfo endpoint
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new IllegalArgumentException("Failed to verify Google token with Google identity services.");
            }

            JsonNode root = objectMapper.readTree(response.getBody());

            String sub = root.path("sub").asText(null);
            String email = root.path("email").asText(null);
            boolean emailVerified = root.path("email_verified").asBoolean(false);
            String givenName = root.path("given_name").asText("");
            String familyName = root.path("family_name").asText("");
            String name = root.path("name").asText(givenName + " " + familyName);
            String picture = root.path("picture").asText(null);
            String aud = root.path("aud").asText(null);
            String iss = root.path("iss").asText("");
            long exp = root.path("exp").asLong(0);

            if (sub == null || email == null) {
                throw new IllegalArgumentException("Google ID token missing subject or email claim.");
            }

            if (!emailVerified) {
                throw new IllegalArgumentException("Google account email address is not verified by Google.");
            }

            long nowSeconds = java.time.Instant.now().getEpochSecond();
            if (exp > 0 && nowSeconds > exp) {
                throw new IllegalArgumentException("Google token has expired.");
            }

            if (!iss.isEmpty() && !iss.equals("accounts.google.com") && !iss.equals("https://accounts.google.com")) {
                throw new IllegalArgumentException("Google token issuer is invalid: " + iss);
            }

            if (configuredClientId != null && !configuredClientId.isBlank()) {
                if (!configuredClientId.equals(aud)) {
                    log.error("Google token audience mismatch. Expected: {}, Got: {}", configuredClientId, aud);
                    throw new IllegalArgumentException("Google token audience does not match configured client ID.");
                }
            }

            return new GoogleIdentity(sub, email.toLowerCase(), emailVerified, givenName, familyName, name, picture);
        } catch (Exception ex) {
            log.error("Error validating Google ID token: {}", ex.getMessage());
            throw new IllegalArgumentException("Invalid Google credentials: " + ex.getMessage(), ex);
        }
    }
}
