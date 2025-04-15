package dev.bradleysummers.ems.service;

import dev.bradleysummers.ems.dto.HierarchyNodeDto;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final EmployeeRepository employeeRepository;

    public List<HierarchyNodeDto> generateHierarchyReport(Long departmentId) {
        List<Employee> allEmployees = employeeRepository.findAll();
        
        // Filter by department if specified
        if (departmentId != null) {
            allEmployees = allEmployees.stream()
                    .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(departmentId))
                    .collect(Collectors.toList());
        }
        
        // Create a map of all employees by ID for easy lookup
        Map<Long, HierarchyNodeDto> nodeMap = new HashMap<>();
        
        // First pass: create all nodes
        for (Employee employee : allEmployees) {
            HierarchyNodeDto node = HierarchyNodeDto.builder()
                    .id(employee.getId())
                    .name(employee.getFirstName() + " " + employee.getLastName())
                    .role(employee.getRole().toString())
                    .department(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                    .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                    .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                    .subordinates(new ArrayList<>())
                    .build();
            
            nodeMap.put(employee.getId(), node);
        }
        
        // Second pass: build the hierarchy
        List<HierarchyNodeDto> rootNodes = new ArrayList<>();
        
        for (Employee employee : allEmployees) {
            HierarchyNodeDto node = nodeMap.get(employee.getId());
            
            if (employee.getManager() == null) {
                // This is a root node (no manager)
                rootNodes.add(node);
            } else {
                // This employee has a manager, add it as a subordinate
                HierarchyNodeDto managerNode = nodeMap.get(employee.getManager().getId());
                if (managerNode != null) {
                    managerNode.getSubordinates().add(node);
                } else if (departmentId == null) {
                    // If we're not filtering by department and the manager isn't in our list,
                    // treat this as a root node
                    rootNodes.add(node);
                }
            }
        }
        
        return rootNodes;
    }
}
