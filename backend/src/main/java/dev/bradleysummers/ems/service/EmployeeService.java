package dev.bradleysummers.ems.service;

import dev.bradleysummers.ems.entity.Employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeService {

    Employee create(Employee employee);

    Optional<Employee> findById(Long id);

    List<Employee> findAll();

    Employee update(Long id, Employee updatedEmployee);

    void delete(Long id);
}
