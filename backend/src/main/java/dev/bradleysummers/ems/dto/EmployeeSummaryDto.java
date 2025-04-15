package dev.bradleysummers.ems.dto;

import lombok.Data;

@Data
public class EmployeeSummaryDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String jobTitle;
}
