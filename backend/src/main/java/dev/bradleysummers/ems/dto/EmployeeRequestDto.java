package dev.bradleysummers.ems.dto;

import dev.bradleysummers.ems.enums.Role;
import lombok.Data;

@Data
public class EmployeeRequestDto {
    private boolean active;
    private String email;
    private String password;
    private Role role;
    private String firstName;
    private String lastName;
    private Long departmentId;
    private Long managerId;
}
