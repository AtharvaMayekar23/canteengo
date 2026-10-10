package canteengo_backend.service;

import canteengo_backend.model.Admin;
import canteengo_backend.repository.AdminRepository;
import canteengo_backend.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class AdminAccountInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final JdbcTemplate jdbcTemplate;

    public AdminAccountInitializer(
            AdminRepository adminRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            Environment environment,
            JdbcTemplate jdbcTemplate) {
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String email = environment.getProperty("CANTEENGO_ADMIN_EMAIL", "").trim().toLowerCase(Locale.ROOT);
        String password = environment.getProperty("CANTEENGO_ADMIN_PASSWORD", "");
        if (email.isBlank() && password.isBlank()) return;
        if (email.isBlank() || password.length() < 12) {
            throw new IllegalStateException("Set CANTEENGO_ADMIN_EMAIL and CANTEENGO_ADMIN_PASSWORD (at least 12 characters).");
        }
        if (studentRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException("The configured admin email is already registered as a student.");
        }

        Admin admin = adminRepository.findByEmailIgnoreCase(email).orElse(null);
        if (admin == null) {
            jdbcTemplate.queryForObject(
                "select setval(pg_get_serial_sequence('admins', 'id'), " +
                    "coalesce((select max(id) from admins), 0) + 1, false)",
                Long.class);
            admin = new Admin("Canteen Admin", email, "");
        }
        admin.setPasswordHash(passwordEncoder.encode(password));
        adminRepository.save(admin);
    }
}