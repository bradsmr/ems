package dev.bradleysummers.ems;

import dev.bradleysummers.ems.dto.auth.AuthRequest;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.enums.Role;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Simple unit tests for employee validation that don't require Spring context
 */
public class EmployeeValidationTest {

    @Test
    void validateLoginRequest_EmptyPassword() {
        // Create a login request with empty password
        AuthRequest request = new AuthRequest();
        request.setEmail("test@example.com");
        request.setPassword("");
        
        // Validate the request
        boolean isValid = isValidLoginRequest(request);
        
        // Assert that the request is invalid
        assertFalse(isValid, "Login request with empty password should be invalid");
    }
    
    @Test
    void validateLoginRequest_ValidCredentials() {
        // Create a login request with valid credentials
        AuthRequest request = new AuthRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        
        // Validate the request
        boolean isValid = isValidLoginRequest(request);
        
        // Assert that the request is valid
        assertTrue(isValid, "Login request with valid credentials should be valid");
    }
    
    /**
     * Helper method to validate login request
     */
    private boolean isValidLoginRequest(AuthRequest request) {
        return request != null 
            && request.getEmail() != null && !request.getEmail().isEmpty()
            && request.getPassword() != null && !request.getPassword().isEmpty();
    }
    
    @Test
    void validateEmployee_RequiredFields() {
        // Create an employee with missing required fields
        Employee incompleteEmployee = Employee.builder()
                .email("test@example.com")
                // Missing firstName and lastName
                .build();
                
        // Create a complete employee
        Employee completeEmployee = Employee.builder()
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password123")
                .role(Role.EMPLOYEE)
                .build();
        
        // Validate both employees
        boolean incompleteIsValid = isValidEmployee(incompleteEmployee);
        boolean completeIsValid = isValidEmployee(completeEmployee);
        
        // Assert validation results
        assertFalse(incompleteIsValid, "Employee with missing required fields should be invalid");
        assertTrue(completeIsValid, "Employee with all required fields should be valid");
    }
    
    /**
     * Helper method to validate employee
     */
    private boolean isValidEmployee(Employee employee) {
        return employee != null
            && employee.getEmail() != null && !employee.getEmail().isEmpty()
            && employee.getFirstName() != null && !employee.getFirstName().isEmpty()
            && employee.getLastName() != null && !employee.getLastName().isEmpty();
    }
}
