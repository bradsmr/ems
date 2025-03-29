package dev.bradleysummers.ems.dto;

import dev.bradleysummers.ems.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private Role role;
    private Long departmentId;
    private Long managerId;
}
