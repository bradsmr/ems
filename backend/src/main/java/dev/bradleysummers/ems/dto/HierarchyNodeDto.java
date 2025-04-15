package dev.bradleysummers.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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
    private String jobTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<HierarchyNodeDto> subordinates = new ArrayList<>();
}
