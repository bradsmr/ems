package dev.bradleysummers.ems.controller;

import dev.bradleysummers.ems.dto.auth.AuthRequest;
import dev.bradleysummers.ems.dto.auth.AuthResponse;
import dev.bradleysummers.ems.dto.EmployeeResponseDto;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.enums.Role;
import dev.bradleysummers.ems.mapper.EmployeeMapper;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import dev.bradleysummers.ems.security.JwtService;
import dev.bradleysummers.ems.security.LoginAttemptService;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        String email = request.getEmail();
        if (loginAttemptService.isBlocked(email)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                "Too many failed login attempts. Please try again later."
            );
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    email,
                    request.getPassword()
                )
            );
            // Success: reset attempts
            loginAttemptService.loginSucceeded(email);
        } catch (DisabledException | BadCredentialsException ex) {
            loginAttemptService.loginFailed(email);
            throw ex;
        }

        // Get the employee (user)
        Employee employee = employeeRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Generate JWT
        String token = jwtService.generateToken(employee.getEmail());

        return new AuthResponse(token);
    }

    @GetMapping("/me")
    public EmployeeResponseDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee employee = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return EmployeeMapper.toDto(employee);
    }
    
    @GetMapping("/guest-access")
    public ResponseEntity<AuthResponse> createGuestAccess() {
        // Check if a guest user already exists
        String guestEmail = "guest@demo.com";
        
        Employee guestUser = employeeRepository.findByEmail(guestEmail)
                .orElseGet(() -> {
                    // Create a new guest user if one doesn't exist
                    Employee guest = Employee.builder()
                            .email(guestEmail)
                            .password(passwordEncoder.encode("guest123")) // Using a fixed password since it's just a demo account
                            .firstName("Guest")
                            .lastName("User")
                            .jobTitle("Demo User")
                            .role(Role.GUEST)
                            .active(true)
                            .build();
                    
                    return employeeRepository.save(guest);
                });
        
        // Generate JWT token for the guest user
        String token = jwtService.generateToken(guestUser.getEmail());
        
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
