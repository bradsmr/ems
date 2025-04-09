package dev.bradleysummers.ems.service.impl;

import dev.bradleysummers.ems.entity.Department;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.enums.Role;
import dev.bradleysummers.ems.repository.DepartmentRepository;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import dev.bradleysummers.ems.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public Department findById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    @Override
    public List<Department> findAll() {
        return departmentRepository.findAll();
    }

    @Override
    public Department create(Department department) {
        // Check if user is admin - matching the pattern used in EmployeeServiceImpl
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee currentUser = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        // Only admins can create departments
        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only administrators can create departments");
        }

        return departmentRepository.save(department);
    }

    @Override
    public Department update(Long id, Department updated) {
        // Check if user is admin
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee currentUser = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        // Only admins can update departments
        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only administrators can update departments");
        }

        return departmentRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    return departmentRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // Check if department exists
        findById(id);

        // Check if user is admin
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee currentUser = employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        // Only admins can delete departments
        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only administrators can delete departments");
        }

        // Find any employees in this department and set their department to null
        List<Employee> employeesInDepartment = employeeRepository.findByDepartmentId(id);
        for (Employee employee : employeesInDepartment) {
            employee.setDepartment(null);
            employeeRepository.save(employee);
        }

        // Now delete the department
        departmentRepository.deleteById(id);
    }
}