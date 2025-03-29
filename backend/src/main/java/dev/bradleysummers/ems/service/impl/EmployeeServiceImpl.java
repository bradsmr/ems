package dev.bradleysummers.ems.service.impl;

import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import dev.bradleysummers.ems.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    public Employee create(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Optional<Employee> findById(Long id) {
        return employeeRepository.findById(id);
    }

    @Override
    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    @Override
    public Employee update(Long id, Employee updatedEmployee) {
        return employeeRepository.findById(id)
                .map(existing -> {
                    existing.setActive(updatedEmployee.isActive());
                    existing.setEmail(updatedEmployee.getEmail());
                    existing.setPassword(updatedEmployee.getPassword());
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
        employeeRepository.deleteById(id);
    }
}
