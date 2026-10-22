package money.baskly.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

@Component
public class JwtTokenProvider {

    public static final String COOKIE_NAME = "baskly_session";

    private final SecretKey key;
    private final long tokenValidityMillis;

    public JwtTokenProvider(
            @Value("${app.auth.jwt-secret:baskly-production-ready-jwt-signing-key-32-chars-long!}") String jwtSecret,
            @Value("${app.auth.jwt-validity-seconds:86400}") long validitySeconds
    ) {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.tokenValidityMillis = validitySeconds * 1000L;
    }

    public String generateToken(AuthAccount account) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + tokenValidityMillis);

        return Jwts.builder()
                .subject(account.getId())
                .claim("email", account.getEmail())
                .claim("role", account.getRole().name())
                .claim("name", account.getFullName())
                .claim("avatar", account.getAvatar())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public String getUserIdFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).get("email", String.class);
    }

    public Role getRoleFromToken(String token) {
        String roleStr = getClaims(token).get("role", String.class);
        return Role.fromString(roleStr);
    }

    public String resolveToken(HttpServletRequest request) {
        // 1. Check HttpOnly cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // 2. Fallback to Authorization: Bearer <token>
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }

        return null;
    }

    public ResponseCookie createAuthCookie(String token, boolean isSecure) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(Duration.ofMillis(tokenValidityMillis))
                .sameSite("Lax")
                .build();
    }

    public ResponseCookie createLogoutCookie(boolean isSecure) {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite("Lax")
                .build();
    }
}
