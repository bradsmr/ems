package dev.bradleysummers.ems.controller;

import dev.bradleysummers.ems.dto.auth.AuthRequest;
import dev.bradleysummers.ems.dto.auth.AuthResponse;
import dev.bradleysummers.ems.dto.EmployeeResponseDto;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.mapper.EmployeeMapper;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import dev.bradleysummers.ems.security.JwtService;
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

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get the employee (user)
        Employee employee = employeeRepository.findByEmail(request.getEmail())
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
