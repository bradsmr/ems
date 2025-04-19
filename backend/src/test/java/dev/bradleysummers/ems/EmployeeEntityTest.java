package dev.bradleysummers.ems;

import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.enums.Role;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Employee entity
 */
public class EmployeeEntityTest {

    @Test
    void employeeBuilder_ShouldCreateValidEmployee() {
        // Create an employee using the builder pattern
        Employee employee = Employee.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("password123")
                .role(Role.EMPLOYEE)
                .active(true)
                .build();
        
        // Verify the employee properties
        assertEquals("John", employee.getFirstName());
        assertEquals("Doe", employee.getLastName());
        assertEquals("john.doe@example.com", employee.getEmail());
        assertEquals("password123", employee.getPassword());
        assertEquals(Role.EMPLOYEE, employee.getRole());
        assertTrue(employee.isActive());
    }
    
    @Test
    void employeeEquality_ShouldCompareAllRelevantFields() {
        // Create two identical employees
        Employee employee1 = Employee.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .build();
                
        Employee employee2 = Employee.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .build();
                
        // Create a different employee with same ID but different fields
        Employee employee3 = Employee.builder()
                .id(1L)
                .firstName("Jane")
                .lastName("Smith")
                .email("jane@example.com")
                .build();
        
        // Test equality
        assertEquals(employee1, employee1, "An employee should be equal to itself");
        assertEquals(employee1, employee2, "Employees with identical fields should be equal");
        assertNotEquals(employee1, employee3, "Employees with different fields should not be equal");
        
        // Test with different ID
        Employee employee4 = Employee.builder()
                .id(2L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .build();
                
        assertNotEquals(employee1, employee4, "Employees with different IDs should not be equal");
    }
}
