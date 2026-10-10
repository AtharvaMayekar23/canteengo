package canteengo_backend.controller;

import canteengo_backend.service.AuthenticationService;
import canteengo_backend.security.UserPrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public AuthenticationService.AuthResult register(@Valid @RequestBody RegisterRequest request) {
        return authenticationService.registerStudent(
            request.name(), request.email(), request.contactNumber(), request.password());
    }

    @PostMapping("/login")
    public AuthenticationService.AuthResult login(@Valid @RequestBody LoginRequest request) {
        return authenticationService.login(
            request.email(), request.password(), request.role(), request.contactNumber());
    }

    @GetMapping("/me")
    public CurrentUser currentUser(@org.springframework.security.core.annotation.AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign-in required.");
        }
        return new CurrentUser(principal.email(), principal.name(), principal.contactNumber(), principal.role());
    }

    public record CurrentUser(String email, String name, String contactNumber, String role) {}

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 24) String contactNumber,
            @Size(min = 8, max = 72) String password) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String role,
            String contactNumber) {}
}