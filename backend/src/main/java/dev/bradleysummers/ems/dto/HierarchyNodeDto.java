package dev.bradleysummers.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HierarchyNodeDto {
    private Long id;
    private String name;
    private String role;
    private String department;
    private Long departmentId;
    private Long managerId;

    @Builder.Default
    private List<HierarchyNodeDto> subordinates = new ArrayList<>();
}
