package dev.bradleysummers.ems.controller;

import dev.bradleysummers.ems.dto.auth.AuthRequest;
import dev.bradleysummers.ems.dto.auth.AuthResponse;
import dev.bradleysummers.ems.dto.EmployeeResponseDto;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.mapper.EmployeeMapper;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import dev.bradleysummers.ems.security.JwtService;
import dev.bradleysummers.ems.security.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;

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
}
