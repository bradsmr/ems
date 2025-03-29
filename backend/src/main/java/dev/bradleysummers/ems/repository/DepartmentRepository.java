package dev.bradleysummers.ems.repository;

import dev.bradleysummers.ems.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
