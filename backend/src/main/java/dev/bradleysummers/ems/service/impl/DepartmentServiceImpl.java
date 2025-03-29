package dev.bradleysummers.ems.service.impl;

import dev.bradleysummers.ems.entity.Department;
import dev.bradleysummers.ems.repository.DepartmentRepository;
import dev.bradleysummers.ems.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

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
        return departmentRepository.save(department);
    }

    @Override
    public Department update(Long id, Department updated) {
        return departmentRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    return departmentRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    @Override
    public void delete(Long id) {
        departmentRepository.deleteById(id);
    }
}
