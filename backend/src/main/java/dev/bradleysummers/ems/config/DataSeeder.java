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

import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    // Set to track used email addresses
    private final Set<String> usedEmails = new HashSet<>();

    @Override
    public void run(String... args) throws Exception {
        if (departmentRepository.count() == 0 && employeeRepository.count() == 0) {
            // A much larger list of first and last names to enable unique combinations
            List<String> firstNames = List.of(
                    "James", "Emily", "Michael", "Sarah", "John", "Jessica", "Robert", "Ashley",
                    "David", "Amanda", "William", "Jennifer", "Joseph", "Elizabeth", "Charles",
                    "Stephanie", "Thomas", "Melissa", "Daniel", "Nicole", "Matthew", "Heather",
                    "Anthony", "Rebecca", "Donald", "Laura", "Mark", "Amy", "Paul", "Michelle",
                    "Steven", "Kimberly", "Andrew", "Lisa", "Kenneth", "Donna", "Joshua", "Karen",
                    "Kevin", "Carol", "Brian", "Nancy", "George", "Barbara", "Timothy", "Betty",
                    "Ronald", "Sandra", "Jason", "Margaret", "Edward", "Susan", "Jeffrey", "Dorothy",
                    "Ryan", "Patricia", "Jacob", "Mary", "Gary", "Sharon", "Nicholas", "Linda"
            );

            List<String> lastNames = List.of(
                    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
                    "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore",
                    "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis",
                    "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Green",
                    "Baker", "Adams", "Nelson", "Hill", "Campbell", "Mitchell", "Roberts", "Carter",
                    "Phillips", "Evans", "Turner", "Torres", "Parker", "Collins", "Edwards", "Stewart",
                    "Flores", "Morris", "Nguyen", "Murphy", "Rivera", "Cook", "Rogers", "Morgan",
                    "Peterson", "Cooper", "Reed", "Bailey", "Bell", "Gomez", "Kelly", "Howard"
            );

            // Create departments
            Department engineering = departmentRepository.save(new Department(null, "Engineering", "Software & Platform"));
            Department hr = departmentRepository.save(new Department(null, "HR", "People Ops"));
            Department sales = departmentRepository.save(new Department(null, "Sales", "Revenue"));
            Department marketing = departmentRepository.save(new Department(null, "Marketing", "Brand & Outreach"));
            Department finance = departmentRepository.save(new Department(null, "Finance", "Accounting & Budgeting"));
            Department operations = departmentRepository.save(new Department(null, "Operations", "Business Operations"));

            List<Department> departments = List.of(engineering, hr, sales, marketing, finance, operations);

            // Create admin
            String adminEmail = "admin@initech.com";
            usedEmails.add(adminEmail);
            employeeRepository.save(Employee.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("password"))
                    .firstName("Admin")
                    .lastName("User")
                    .active(true)
                    .role(Role.ADMIN)
                    .department(engineering)
                    .build());

            // Create department managers
            List<Employee> managers = new ArrayList<>();
            for (Department dept : departments) {
                String managerEmail = dept.getName().toLowerCase() + ".manager@initech.com";
                usedEmails.add(managerEmail);

                Employee manager = Employee.builder()
                        .email(managerEmail)
                        .password(passwordEncoder.encode("password"))
                        .firstName(dept.getName())
                        .lastName("Manager")
                        .active(true)
                        .role(Role.EMPLOYEE)
                        .department(dept)
                        .build();
                managers.add(employeeRepository.save(manager));
            }

            List<Employee> seededEmployees = new ArrayList<>();
            Random random = new Random();

            // Seed employees with unique name combinations to create unique emails
            for (int i = 0; i < 25; i++) {
                Department dept = departments.get(random.nextInt(departments.size()));

                // Keep trying name combinations until we find one that produces a unique email
                String firstName;
                String lastName;
                String email;

                do {
                    firstName = firstNames.get(random.nextInt(firstNames.size()));
                    lastName = lastNames.get(random.nextInt(lastNames.size()));
                    email = (firstName + "." + lastName + "@initech.com").toLowerCase();
                } while (usedEmails.contains(email));

                usedEmails.add(email);

                // Select a manager from the same department
                Employee deptManager = managers.stream()
                        .filter(m -> m.getDepartment().getId().equals(dept.getId()))
                        .findFirst()
                        .orElse(managers.get(0));

                Employee employee = Employee.builder()
                        .email(email)
                        .password(passwordEncoder.encode("password"))
                        .firstName(firstName)
                        .lastName(lastName)
                        .active(true)
                        .role(Role.EMPLOYEE)
                        .department(dept)
                        .manager(deptManager)
                        .build();

                seededEmployees.add(employeeRepository.save(employee));
            }

            // After seeding initial employees, add more with managers from the employee pool
            for (int i = 0; i < 25; i++) {
                Department dept = departments.get(random.nextInt(departments.size()));

                // Keep trying name combinations until we find one that produces a unique email
                String firstName;
                String lastName;
                String email;

                do {
                    firstName = firstNames.get(random.nextInt(firstNames.size()));
                    lastName = lastNames.get(random.nextInt(lastNames.size()));
                    email = (firstName + "." + lastName + "@initech.com").toLowerCase();
                } while (usedEmails.contains(email));

                usedEmails.add(email);

                // Filter potential managers for this department
                List<Employee> potentialManagers = new ArrayList<>();
                for (Employee e : seededEmployees) {
                    if (e.getDepartment().getId().equals(dept.getId())) {
                        potentialManagers.add(e);
                    }
                }

                // Fallback to department manager if needed
                if (potentialManagers.isEmpty()) {
                    potentialManagers.add(managers.stream()
                            .filter(m -> m.getDepartment().getId().equals(dept.getId()))
                            .findFirst()
                            .orElse(managers.get(0)));
                }

                Employee manager = potentialManagers.get(random.nextInt(potentialManagers.size()));

                Employee employee = Employee.builder()
                        .email(email)
                        .password(passwordEncoder.encode("password"))
                        .firstName(firstName)
                        .lastName(lastName)
                        .active(true)
                        .role(Role.EMPLOYEE)
                        .department(dept)
                        .manager(manager)
                        .build();

                seededEmployees.add(employee);
            }

            employeeRepository.saveAll(seededEmployees);
        }
    }
}