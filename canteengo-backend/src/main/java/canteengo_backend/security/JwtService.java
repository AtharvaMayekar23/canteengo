package canteengo_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;

    public JwtService(@Value("${canteengo.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(UserPrincipal principal) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(principal.email())
                .claim("name", principal.name())
                .claim("contactNumber", principal.contactNumber() == null ? "" : principal.contactNumber())
                .claim("role", principal.role())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(8 * 60 * 60)))
                .signWith(key)
                .compact();
    }

    public UserPrincipal parseToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        String role = claims.get("role", String.class);
        String contactNumber = claims.get("contactNumber", String.class);
        if ("STUDENT".equals(role) && (contactNumber == null || contactNumber.isBlank())) {
            throw new IllegalArgumentException("Student token must contain a verified contact number.");
        }
        return new UserPrincipal(
                claims.getSubject(),
                claims.get("name", String.class),
            contactNumber,
            role);
    }
}