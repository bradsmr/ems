package dev.bradleysummers.ems.controller;

import dev.bradleysummers.ems.dto.EmployeeRequestDto;
import dev.bradleysummers.ems.dto.EmployeeResponseDto;
import dev.bradleysummers.ems.entity.Department;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.mapper.EmployeeMapper;
import dev.bradleysummers.ems.service.DepartmentService;
import dev.bradleysummers.ems.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<EmployeeResponseDto>> getAllEmployees() {
        List<Employee> employees = employeeService.findAll();
        List<EmployeeResponseDto> response = employees.stream()
                .map(EmployeeMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> getEmployeeById(@PathVariable Long id) {
        return employeeService.findById(id)
                .map(EmployeeMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EmployeeResponseDto> createEmployee(@RequestBody EmployeeRequestDto dto) {
        Department department = departmentService.findById(dto.getDepartmentId());
        Employee manager = dto.getManagerId() != null
                ? employeeService.findById(dto.getManagerId()).orElse(null)
                : null;

        Employee employee = EmployeeMapper.toEntity(dto, department, manager);
        Employee saved = employeeService.create(employee);
        return ResponseEntity.ok(EmployeeMapper.toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeRequestDto dto) {

        Department department = departmentService.findById(dto.getDepartmentId());
        Employee manager = dto.getManagerId() != null
                ? employeeService.findById(dto.getManagerId()).orElse(null)
                : null;

        Employee updated = EmployeeMapper.toEntity(dto, department, manager);
        Employee saved = employeeService.update(id, updated);
        return ResponseEntity.ok(EmployeeMapper.toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
