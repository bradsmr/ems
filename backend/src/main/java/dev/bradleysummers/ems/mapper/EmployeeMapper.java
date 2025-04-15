package dev.bradleysummers.ems.mapper;

import dev.bradleysummers.ems.dto.DepartmentDto;
import dev.bradleysummers.ems.dto.EmployeeRequestDto;
import dev.bradleysummers.ems.dto.EmployeeResponseDto;
import dev.bradleysummers.ems.dto.EmployeeSummaryDto;
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
                .jobTitle(dto.getJobTitle())
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
        dto.setJobTitle(employee.getJobTitle());
        dto.setCreatedAt(employee.getCreatedAt() != null ? employee.getCreatedAt().toString() : null);
        dto.setUpdatedAt(employee.getUpdatedAt() != null ? employee.getUpdatedAt().toString() : null);

        if (employee.getDepartment() != null) {
            Department dept = employee.getDepartment();
            DepartmentDto deptDto = new DepartmentDto();
            deptDto.setId(dept.getId());
            deptDto.setName(dept.getName());
            dto.setDepartment(deptDto);
        }

        if (employee.getManager() != null) {
            Employee manager = employee.getManager();
            EmployeeSummaryDto managerDto = new EmployeeSummaryDto();
            managerDto.setId(manager.getId());
            managerDto.setFirstName(manager.getFirstName());
            managerDto.setLastName(manager.getLastName());
            managerDto.setEmail(manager.getEmail());
            managerDto.setJobTitle(manager.getJobTitle());
            dto.setManager(managerDto);
        }

        return dto;
    }

    public static EmployeeSummaryDto toSummaryDto(Employee employee) {
        EmployeeSummaryDto dto = new EmployeeSummaryDto();
        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setJobTitle(employee.getJobTitle());
        return dto;
    }
}
