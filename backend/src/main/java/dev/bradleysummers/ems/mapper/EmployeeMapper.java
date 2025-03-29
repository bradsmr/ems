package dev.bradleysummers.ems.mapper;

import dev.bradleysummers.ems.dto.EmployeeRequestDto;
import dev.bradleysummers.ems.dto.EmployeeResponseDto;
import dev.bradleysummers.ems.entity.Department;
import dev.bradleysummers.ems.entity.Employee;

public class EmployeeMapper {

    public static Employee toEntity(EmployeeRequestDto dto, Department department, Employee manager) {
        return Employee.builder()
                .active(dto.isActive())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .role(dto.getRole())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .department(department)
                .manager(manager)
                .build();
    }

    public static EmployeeResponseDto toDto(Employee employee) {
        EmployeeResponseDto dto = new EmployeeResponseDto();
        dto.setId(employee.getId());
        dto.setActive(employee.isActive());
        dto.setEmail(employee.getEmail());
        dto.setRole(employee.getRole());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setCreatedAt(employee.getCreatedAt() != null ? employee.getCreatedAt().toString() : null);
        dto.setUpdatedAt(employee.getUpdatedAt() != null ? employee.getUpdatedAt().toString() : null);
        dto.setDepartmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null);
        dto.setManagerId(employee.getManager() != null ? employee.getManager().getId() : null);
        return dto;
    }
}
