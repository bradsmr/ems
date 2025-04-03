package dev.bradleysummers.ems.config;

import dev.bradleysummers.ems.entity.Department;
import dev.bradleysummers.ems.entity.Employee;
import dev.bradleysummers.ems.enums.Role;
import dev.bradleysummers.ems.repository.DepartmentRepository;
import dev.bradleysummers.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (departmentRepository.count() == 0 && employeeRepository.count() == 0) {
            // Create departments
            Department engineering = departmentRepository.save(new Department(null, "Engineering", "Software & Platform"));
            Department hr = departmentRepository.save(new Department(null, "HR", "People Ops"));
            Department sales = departmentRepository.save(new Department(null, "Sales", "Revenue"));
            Department marketing = departmentRepository.save(new Department(null, "Marketing", "Brand & Outreach"));

            List<Department> departments = List.of(engineering, hr, sales, marketing);

            // Create default admin user
            employeeRepository.save(
                    Employee.builder()
                            .email("admin@company.com")
                            .password(passwordEncoder.encode("password"))
                            .firstName("Admin")
                            .lastName("User")
                            .active(true)
                            .role(Role.ADMIN)
                            .department(engineering)
                            .build()
            );

            // Generate managers per department
            List<Employee> managers = departments.stream()
                    .map(dept -> employeeRepository.save(
                            Employee.builder()
                                    .email(dept.getName().toLowerCase() + ".manager@company.com")
                                    .password(passwordEncoder.encode("password"))
                                    .firstName(dept.getName() + "Mgr")
                                    .lastName("Leader")
                                    .active(true)
                                    .role(Role.EMPLOYEE)
                                    .department(dept)
                                    .build()
                    ))
                    .toList();

            // Create a standard test user
            employeeRepository.save(
                    Employee.builder()
                            .email("user@company.com")
                            .password(passwordEncoder.encode("password"))
                            .firstName("Standard")
                            .lastName("User")
                            .active(true)
                            .role(Role.EMPLOYEE)
                            .department(engineering)
                            .manager(managers.get(0)) // Engineering manager
                            .build()
            );

            // Generate bulk employees with random names
            List<Employee> employees = new java.util.ArrayList<>();
            for (int i = 1; i <= 200; i++) {
                Department dept = departments.get(i % departments.size());
                Employee manager = managers.get(i % managers.size());

                employees.add(Employee.builder()
                        .email("user" + i + "@company.com")
                        .password(passwordEncoder.encode("password"))
                        .firstName("First" + i)
                        .lastName("Last" + i)
                        .active(true)
                        .role(Role.EMPLOYEE)
                        .department(dept)
                        .manager(manager)
                        .build());
            }

            employeeRepository.saveAll(employees);
        }
    }

    private Employee newEmployee(String email, String firstName, String lastName, Department department) {
        return Employee.builder()
                .email(email)
                .password(passwordEncoder.encode("password"))
                .role(Role.EMPLOYEE)
                .firstName(firstName)
                .lastName(lastName)
                .active(true)
                .department(department)
                .build();
    }

    private Employee newEmployee(String email, String firstName, String lastName, Department department, Employee manager) {
        return Employee.builder()
                .email(email)
                .password(passwordEncoder.encode("password"))
                .role(Role.EMPLOYEE)
                .firstName(firstName)
                .lastName(lastName)
                .active(true)
                .department(department)
                .manager(manager)
                .build();
    }
}
