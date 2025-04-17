package dev.bradleysummers.ems.controller;

import dev.bradleysummers.ems.dto.auth.SetupRequest;
import dev.bradleysummers.ems.dto.auth.AuthResponse;
import dev.bradleysummers.ems.entity.Department;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.enums.Role;
import dev.bradleysummers.ems.repository.DepartmentRepository;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import dev.bradleysummers.ems.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class SetupController {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @GetMapping("/status")
    public ResponseEntity<?> checkSetupStatus() {
        boolean needsSetup = employeeRepository.count() == 0;
        return ResponseEntity.ok(new SetupStatusResponse(needsSetup));
    }

    @PostMapping("/initialize")
    public ResponseEntity<AuthResponse> initializeSystem(@RequestBody SetupRequest request) {
        // Check if system is already initialized
        if (employeeRepository.count() > 0) {
            return ResponseEntity.badRequest().build();
        }

        // Create default department
        Department adminDepartment = departmentRepository.save(
            new Department(null, "Administration", "System Administration Department")
        );

        // Create admin user
        Employee admin = Employee.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .jobTitle("System Administrator")
                .active(true)
                .role(Role.ADMIN)
                .department(adminDepartment)
                .build();
        
        employeeRepository.save(admin);

        // Generate JWT token for the new admin
        String token = jwtService.generateToken(admin.getEmail());
        
        return ResponseEntity.ok(new AuthResponse(token));
    }

    // Response class for setup status
    private record SetupStatusResponse(boolean needsSetup) {}
}
