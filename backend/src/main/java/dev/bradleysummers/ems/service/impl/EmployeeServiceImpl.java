package dev.bradleysummers.ems.service.impl;

import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.enums.Role;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import dev.bradleysummers.ems.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Employee create(Employee employee) {
        // Encrypt password before saving
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        return employeeRepository.save(employee);
    }

    @Override
    public Optional<Employee> findById(Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee currentUser = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Admin can view any employee
        if (currentUser.getRole() == Role.ADMIN) {
            return employeeRepository.findById(id);
        }
        
        // Users can view themselves
        if (currentUser.getId().equals(id)) {
            return employeeRepository.findById(id);
        }
        
        // Access denied - return empty
        return Optional.empty();
    }

    @Override
    public List<Employee> findAll() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee currentUser = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        if (currentUser.getRole() == Role.ADMIN) {
            return employeeRepository.findAll();
        } else {
            // Regular employees can only view themselves
            return employeeRepository.findAll().stream()
                    .filter(emp -> emp.equals(currentUser))
                    .collect(Collectors.toList());
        }
    }

    @Override
    public Employee update(Long id, Employee updatedEmployee) {
        return employeeRepository.findById(id)
                .map(existing -> {
                    validateManager(existing, updatedEmployee.getManager());

                    existing.setActive(updatedEmployee.isActive());
                    existing.setEmail(updatedEmployee.getEmail());
                    
                    // Only update password if a new one is provided
                    if (updatedEmployee.getPassword() != null && !updatedEmployee.getPassword().isEmpty()) {
                        existing.setPassword(passwordEncoder.encode(updatedEmployee.getPassword()));
                    }
                    
                    existing.setRole(updatedEmployee.getRole());
                    existing.setFirstName(updatedEmployee.getFirstName());
                    existing.setLastName(updatedEmployee.getLastName());
                    existing.setDepartment(updatedEmployee.getDepartment());
                    existing.setManager(updatedEmployee.getManager());

                    return employeeRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    @Override
    public void delete(Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee currentUser = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Only admins can delete employees
        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only administrators can delete employees");
        }
        
        // Admin cannot delete themselves
        if (currentUser.getId().equals(id)) {
            throw new RuntimeException("Administrators cannot delete their own account");
        }
        
        // Check if employee exists
        employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        
        // Remove this employee as manager from any employees they manage
        List<Employee> managedEmployees = employeeRepository.findByManagerId(id);
        for (Employee managed : managedEmployees) {
            managed.setManager(null);
            employeeRepository.save(managed);
        }
        
        employeeRepository.deleteById(id);
    }

    private void validateManager(Employee employee, Employee manager) {
        if (manager == null) return;

        // Prevent self-reference
        if (employee.getId() != null && employee.getId().equals(manager.getId())) {
            throw new IllegalArgumentException("An employee cannot be their own manager.");
        }

        // Prevent cycles
        Employee current = manager;
        while (current != null) {
            if (current.getId() != null && current.getId().equals(employee.getId())) {
                throw new IllegalArgumentException("Assigning this manager would create a management cycle.");
            }
            current = current.getManager();
        }
    }
}
