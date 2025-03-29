package dev.bradleysummers.ems.repository;

import dev.bradleysummers.ems.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}
