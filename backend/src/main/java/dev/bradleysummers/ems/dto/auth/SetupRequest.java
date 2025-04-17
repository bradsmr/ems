package dev.bradleysummers.ems.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetupRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}
