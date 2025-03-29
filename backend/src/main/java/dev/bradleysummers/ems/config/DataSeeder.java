package dev.bradleysummers.ems.config;

import dev.bradleysummers.ems.entity.Department;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.enums.Role;
import dev.bradleysummers.ems.repository.DepartmentRepository;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (departmentRepository.count() == 0) {
            Department dev = departmentRepository.save(
                    Department.builder()
                            .name("Engineering")
                            .description("Software & Platform")
                            .build()
            );

            Department hr = departmentRepository.save(
                    Department.builder()
                            .name("HR")
                            .description("People Operations")
                            .build()
            );


            Employee admin = Employee.builder()
                    .email("admin@company.com")
                    .password("password")
                    .role(Role.ADMIN)
                    .firstName("Admin")
                    .lastName("User")
                    .active(true)
                    .department(dev)
                    .build();

            employeeRepository.save(admin);
        }
    }
}
