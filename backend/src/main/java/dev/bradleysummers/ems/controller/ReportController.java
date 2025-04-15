package dev.bradleysummers.ems.controller;

import dev.bradleysummers.ems.dto.HierarchyNodeDto;
import dev.bradleysummers.ems.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/orgchart")
    public ResponseEntity<List<HierarchyNodeDto>> getOrgChart(
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(reportService.generateHierarchyReport(departmentId));
    }
}
