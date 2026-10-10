package canteengo_backend.service;

import canteengo_backend.model.Admin;
import canteengo_backend.model.Student;
import canteengo_backend.repository.AdminRepository;
import canteengo_backend.repository.StudentRepository;
import canteengo_backend.security.JwtService;
import canteengo_backend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class AuthenticationService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(
            StudentRepository studentRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResult registerStudent(String name, String email, String contactNumber, String password) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedPhone = normalizePhone(contactNumber);
        validateCredentials(name, normalizedEmail, normalizedPhone, password);
        if (studentRepository.existsByEmailIgnoreCase(normalizedEmail)
                || adminRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already uses this email.");
        }

        Student student = studentRepository.save(
                new Student(name.trim(), normalizedEmail, normalizedPhone, passwordEncoder.encode(password)));
        return createResult(student.getEmail(), student.getName(), student.getContactNumber(), "STUDENT");
    }

    public AuthResult login(String email, String password, String requestedRole, String contactNumber) {
        String normalizedEmail = normalizeEmail(email);
        String role = requestedRole == null ? "STUDENT" : requestedRole.trim().toUpperCase(Locale.ROOT);
        if ("ADMIN".equals(role)) {
            Admin admin = adminRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(AuthenticationService::invalidCredentials);
            String storedPassword = admin.getPasswordHash();
            if (storedPassword != null && passwordEncoder.matches(password, storedPassword)) {
                return createResult(admin.getEmail(), admin.getName(), null, "ADMIN");
            }
            if (storedPassword != null && !storedPassword.startsWith("$2")
                    && MessageDigest.isEqual(
                            storedPassword.getBytes(StandardCharsets.UTF_8),
                            password.getBytes(StandardCharsets.UTF_8))) {
                admin.setPasswordHash(passwordEncoder.encode(password));
                adminRepository.save(admin);
                return createResult(admin.getEmail(), admin.getName(), null, "ADMIN");
            }
            throw invalidCredentials();
        }
        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByEmailIgnoreCase(normalizedEmail)
                    .filter(account -> passwordEncoder.matches(password, account.getPasswordHash()))
                    .orElseThrow(AuthenticationService::invalidCredentials);
                return createResult(student.getEmail(), student.getName(), student.getContactNumber(), "STUDENT");
        }
        throw invalidCredentials();
    }

    private AuthResult createResult(String email, String name, String contactNumber, String role) {
        UserPrincipal principal = new UserPrincipal(email, name, contactNumber, role);
        return new AuthResult(jwtService.createToken(principal), email, name, contactNumber, role);
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("[\\s()-]", "").trim();
    }

    private static void validateCredentials(String name, String email, String phone, String password) {
        if (name == null || name.isBlank() || email.isBlank()
                || !phone.matches("\\+?[1-9][0-9]{7,14}")
                || password == null || password.length() < 8 || password.length() > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Name, valid email and phone are required; password must be 8 to 72 characters.");
        }
    }

    private static ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email, password, or account type.");
    }

    public record AuthResult(String token, String email, String name, String contactNumber, String role) {}
}