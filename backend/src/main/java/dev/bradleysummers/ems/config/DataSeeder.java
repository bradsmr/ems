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
            Department engineering = departmentRepository.save(
                    Department.builder().name("Engineering").description("Software & Platform").build()
            );

            Department hr = departmentRepository.save(
                    Department.builder().name("HR").description("People Operations").build()
            );

            Department sales = departmentRepository.save(
                    Department.builder().name("Sales").description("Revenue Generation").build()
            );

            Department marketing = departmentRepository.save(
                    Department.builder().name("Marketing").description("Brand & Outreach").build()
            );

            // Admin
            Employee admin = employeeRepository.save(
                    Employee.builder()
                            .email("admin@company.com")
                            .password(passwordEncoder.encode("password"))
                            .role(Role.ADMIN)
                            .firstName("Admin")
                            .lastName("User")
                            .active(true)
                            .department(engineering)
                            .build()
            );

            // Managers
            Employee engManager = employeeRepository.save(newEmployee("eng.manager@company.com", "Emily", "Engman", engineering));
            Employee hrManager = employeeRepository.save(newEmployee("hr.manager@company.com", "Henry", "Harrison", hr));
            Employee salesManager = employeeRepository.save(newEmployee("sales.manager@company.com", "Sara", "Saleson", sales));
            Employee mktManager = employeeRepository.save(newEmployee("marketing.manager@company.com", "Molly", "Marketer", marketing));

            // Employees with managers assigned
            List<Employee> employees = List.of(
                    newEmployee("alice.engineer@company.com", "Alice", "Anderson", engineering, engManager),
                    newEmployee("bob.engineer@company.com", "Bob", "Baxter", engineering, engManager),
                    newEmployee("carol.hr@company.com", "Carol", "Clark", hr, hrManager),
                    newEmployee("dave.hr@company.com", "Dave", "Dover", hr, hrManager),
                    newEmployee("ellen.sales@company.com", "Ellen", "Evans", sales, salesManager),
                    newEmployee("frank.sales@company.com", "Frank", "Foster", sales, salesManager),
                    newEmployee("grace.marketing@company.com", "Grace", "Geller", marketing, mktManager),
                    newEmployee("hank.marketing@company.com", "Hank", "Hudson", marketing, mktManager)
            );

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
