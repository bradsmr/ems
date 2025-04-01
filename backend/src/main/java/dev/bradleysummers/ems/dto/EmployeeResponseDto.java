package dev.bradleysummers.ems.dto;

import dev.bradleysummers.ems.enums.Role;
import lombok.Data;

@Data
public class EmployeeResponseDto {
    private Long id;
    private boolean active;
    private String email;
    private Role role;
    private String firstName;
    private String lastName;
    private String createdAt;
    private String updatedAt;
    private DepartmentDto department;
    private Long managerId;

    public void setDepartmentId(Long aLong) {
        this.department = null;
    }
}
