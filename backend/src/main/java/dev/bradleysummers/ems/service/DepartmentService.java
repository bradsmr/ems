package dev.bradleysummers.ems.service;

import dev.bradleysummers.ems.entity.Department;

import java.util.List;

public interface DepartmentService {
    Department findById(Long id);
    List<Department> findAll();
    Department create(Department department);
    Department update(Long id, Department updated);
    void delete(Long id);
}
