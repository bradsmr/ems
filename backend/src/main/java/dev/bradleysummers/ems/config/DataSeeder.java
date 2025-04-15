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

    // Set of email addresses already in use
    private final Set<String> usedEmails = new HashSet<>();

    @Override
    public void run(String... args) throws Exception {
        if (departmentRepository.count() == 0 && employeeRepository.count() == 0) {
            // Create departments with descriptions
            Department executive = departmentRepository.save(new Department(null, "Executive", "Leadership Team"));
            Department engineering = departmentRepository.save(new Department(null, "Engineering", "Software & Platform Development"));
            Department hr = departmentRepository.save(new Department(null, "HR", "Human Resources & People Operations"));
            Department sales = departmentRepository.save(new Department(null, "Sales", "Revenue Generation & Client Relations"));
            Department marketing = departmentRepository.save(new Department(null, "Marketing", "Brand Management & Market Strategy"));
            Department finance = departmentRepository.save(new Department(null, "Finance", "Financial Planning & Accounting"));
            Department operations = departmentRepository.save(new Department(null, "Operations", "Business Operations & Logistics"));
            Department customerSupport = departmentRepository.save(new Department(null, "Customer Support", "Client Services & Support"));

            // Create the company structure
            Map<String, Employee> employeeMap = new HashMap<>();

            // Create admin user
            String adminEmail = "admin@initech.com";
            usedEmails.add(adminEmail);
            Employee admin = Employee.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("password"))
                    .firstName("Admin")
                    .lastName("User")
                    .jobTitle("System Administrator")
                    .active(true)
                    .role(Role.ADMIN)
                    .department(engineering)
                    .build();
            employeeRepository.save(admin);

            // 1. President/CEO (Executive Department)
            Employee ceo = createEmployee(
                "Robert", "Chen", "President & CEO",
                "robert.chen@initech.com", "password",
                Role.EMPLOYEE, executive, null);
            employeeMap.put("ceo", ceo);

            // 2. C-Suite Executives (reporting to CEO)
            Employee cto = createEmployee(
                "Michael", "Rodriguez", "Chief Technology Officer",
                "michael.rodriguez@initech.com", "password",
                Role.EMPLOYEE, executive, ceo);
            employeeMap.put("cto", cto);

            Employee cfo = createEmployee(
                "Jennifer", "Williams", "Chief Financial Officer",
                "jennifer.williams@initech.com", "password",
                Role.EMPLOYEE, executive, ceo);
            employeeMap.put("cfo", cfo);

            Employee cmo = createEmployee(
                "David", "Thompson", "Chief Marketing Officer",
                "david.thompson@initech.com", "password",
                Role.EMPLOYEE, executive, ceo);
            employeeMap.put("cmo", cmo);

            Employee coo = createEmployee(
                "Sarah", "Johnson", "Chief Operations Officer",
                "sarah.johnson@initech.com", "password",
                Role.EMPLOYEE, executive, ceo);
            employeeMap.put("coo", coo);

            Employee chro = createEmployee(
                "Emily", "Martinez", "Chief HR Officer",
                "emily.martinez@initech.com", "password",
                Role.ADMIN, executive, ceo);
            employeeMap.put("chro", chro);

            // 3. Directors (reporting to C-Suite)
            // Engineering Directors
            Employee dirEngSoftware = createEmployee(
                "James", "Wilson", "Director of Software Engineering",
                "james.wilson@initech.com", "password",
                Role.EMPLOYEE, engineering, cto);
            employeeMap.put("dirEngSoftware", dirEngSoftware);

            Employee dirEngInfra = createEmployee(
                "Thomas", "Garcia", "Director of Infrastructure",
                "thomas.garcia@initech.com", "password",
                Role.EMPLOYEE, engineering, cto);
            employeeMap.put("dirEngInfra", dirEngInfra);

            // HR Director
            Employee dirHR = createEmployee(
                "Jessica", "Taylor", "Director of HR",
                "jessica.taylor@initech.com", "password",
                Role.EMPLOYEE, hr, chro);
            employeeMap.put("dirHR", dirHR);

            // Sales Director
            Employee dirSales = createEmployee(
                "William", "Brown", "Director of Sales",
                "william.brown@initech.com", "password",
                Role.EMPLOYEE, sales, coo);
            employeeMap.put("dirSales", dirSales);

            // Marketing Director
            Employee dirMarketing = createEmployee(
                "Elizabeth", "Anderson", "Director of Marketing",
                "elizabeth.anderson@initech.com", "password",
                Role.EMPLOYEE, marketing, cmo);
            employeeMap.put("dirMarketing", dirMarketing);

            // Finance Director
            Employee dirFinance = createEmployee(
                "Joseph", "Smith", "Director of Finance",
                "joseph.smith@initech.com", "password",
                Role.EMPLOYEE, finance, cfo);
            employeeMap.put("dirFinance", dirFinance);

            // Operations Director
            Employee dirOperations = createEmployee(
                "Stephanie", "Davis", "Director of Operations",
                "stephanie.davis@initech.com", "password",
                Role.EMPLOYEE, operations, coo);
            employeeMap.put("dirOperations", dirOperations);

            // Customer Support Director
            Employee dirSupport = createEmployee(
                "Daniel", "Martin", "Director of Customer Support",
                "daniel.martin@initech.com", "password",
                Role.EMPLOYEE, customerSupport, coo);
            employeeMap.put("dirSupport", dirSupport);

            // 4. Managers (reporting to Directors)
            // Engineering Managers
            Employee mgrBackend = createEmployee(
                "Anthony", "Lee", "Backend Engineering Manager", 
                "anthony.lee@initech.com", "password", 
                Role.EMPLOYEE, engineering, dirEngSoftware);
            employeeMap.put("mgrBackend", mgrBackend);
            
            Employee mgrFrontend = createEmployee(
                "Nicole", "White", "Frontend Engineering Manager", 
                "nicole.white@initech.com", "password", 
                Role.EMPLOYEE, engineering, dirEngSoftware);
            employeeMap.put("mgrFrontend", mgrFrontend);
            
            Employee mgrDevOps = createEmployee(
                "Mark", "Harris", "DevOps Manager", 
                "mark.harris@initech.com", "password", 
                Role.EMPLOYEE, engineering, dirEngInfra);
            employeeMap.put("mgrDevOps", mgrDevOps);
            
            // HR Managers
            Employee mgrRecruitment = createEmployee(
                "Michelle", "Clark", "Recruitment Manager", 
                "michelle.clark@initech.com", "password", 
                Role.EMPLOYEE, hr, dirHR);
            employeeMap.put("mgrRecruitment", mgrRecruitment);
            
            Employee mgrCompensation = createEmployee(
                "Steven", "Lewis", "Compensation & Benefits Manager", 
                "steven.lewis@initech.com", "password", 
                Role.EMPLOYEE, hr, dirHR);
            employeeMap.put("mgrCompensation", mgrCompensation);
            
            // Sales Managers
            Employee mgrSalesNA = createEmployee(
                "Laura", "Robinson", "North America Sales Manager", 
                "laura.robinson@initech.com", "password", 
                Role.EMPLOYEE, sales, dirSales);
            employeeMap.put("mgrSalesNA", mgrSalesNA);
            
            Employee mgrSalesEU = createEmployee(
                "Paul", "Walker", "Europe Sales Manager", 
                "paul.walker@initech.com", "password", 
                Role.EMPLOYEE, sales, dirSales);
            employeeMap.put("mgrSalesEU", mgrSalesEU);
            
            // Marketing Managers
            Employee mgrDigitalMarketing = createEmployee(
                "Kimberly", "Young", "Digital Marketing Manager", 
                "kimberly.young@initech.com", "password", 
                Role.EMPLOYEE, marketing, dirMarketing);
            employeeMap.put("mgrDigitalMarketing", mgrDigitalMarketing);
            
            // Finance Managers
            Employee mgrAccounting = createEmployee(
                "Andrew", "Allen", "Accounting Manager", 
                "andrew.allen@initech.com", "password", 
                Role.EMPLOYEE, finance, dirFinance);
            employeeMap.put("mgrAccounting", mgrAccounting);
            
            // Operations Managers
            Employee mgrSupplyChain = createEmployee(
                "Karen", "King", "Supply Chain Manager", 
                "karen.king@initech.com", "password", 
                Role.EMPLOYEE, operations, dirOperations);
            employeeMap.put("mgrSupplyChain", mgrSupplyChain);
            
            // Customer Support Managers
            Employee mgrTechSupport = createEmployee(
                "Jason", "Wright", "Technical Support Manager", 
                "jason.wright@initech.com", "password", 
                Role.EMPLOYEE, customerSupport, dirSupport);
            employeeMap.put("mgrTechSupport", mgrTechSupport);
            
            // 5. Regular Employees (reporting to Managers)
            // Backend Engineers
            createEmployee("Ryan", "Scott", "Senior Backend Engineer", 
                "ryan.scott@initech.com", "password", Role.EMPLOYEE, engineering, mgrBackend);
            
            createEmployee("Jacob", "Green", "Backend Engineer", 
                "jacob.green@initech.com", "password", Role.EMPLOYEE, engineering, mgrBackend);
            
            createEmployee("Gary", "Baker", "Backend Engineer", 
                "gary.baker@initech.com", "password", Role.EMPLOYEE, engineering, mgrBackend);
            
            // Frontend Engineers
            createEmployee("Nicholas", "Adams", "Senior Frontend Engineer", 
                "nicholas.adams@initech.com", "password", Role.EMPLOYEE, engineering, mgrFrontend);
            
            createEmployee("Patricia", "Nelson", "Frontend Engineer", 
                "patricia.nelson@initech.com", "password", Role.EMPLOYEE, engineering, mgrFrontend);
            
            createEmployee("Mary", "Hill", "UI/UX Designer", 
                "mary.hill@initech.com", "password", Role.EMPLOYEE, engineering, mgrFrontend);
            
            // DevOps Engineers
            createEmployee("Sharon", "Campbell", "DevOps Engineer", 
                "sharon.campbell@initech.com", "password", Role.EMPLOYEE, engineering, mgrDevOps);
            
            createEmployee("Linda", "Mitchell", "Systems Administrator", 
                "linda.mitchell@initech.com", "password", Role.EMPLOYEE, engineering, mgrDevOps);
            
            // HR Team
            createEmployee("Dorothy", "Roberts", "Recruiter", 
                "dorothy.roberts@initech.com", "password", Role.EMPLOYEE, hr, mgrRecruitment);
            
            createEmployee("Susan", "Carter", "HR Specialist", 
                "susan.carter@initech.com", "password", Role.EMPLOYEE, hr, mgrRecruitment);
            
            createEmployee("Margaret", "Phillips", "Benefits Coordinator", 
                "margaret.phillips@initech.com", "password", Role.EMPLOYEE, hr, mgrCompensation);
            
            // Sales Team
            createEmployee("Sandra", "Evans", "Senior Sales Representative", 
                "sandra.evans@initech.com", "password", Role.EMPLOYEE, sales, mgrSalesNA);
            
            createEmployee("Betty", "Turner", "Sales Representative", 
                "betty.turner@initech.com", "password", Role.EMPLOYEE, sales, mgrSalesNA);
            
            createEmployee("Barbara", "Torres", "Sales Representative", 
                "barbara.torres@initech.com", "password", Role.EMPLOYEE, sales, mgrSalesEU);
            
            createEmployee("Nancy", "Parker", "Sales Representative", 
                "nancy.parker@initech.com", "password", Role.EMPLOYEE, sales, mgrSalesEU);
            
            // Marketing Team
            createEmployee("Carol", "Collins", "Digital Marketing Specialist", 
                "carol.collins@initech.com", "password", Role.EMPLOYEE, marketing, mgrDigitalMarketing);
            
            createEmployee("Donna", "Edwards", "Content Creator", 
                "donna.edwards@initech.com", "password", Role.EMPLOYEE, marketing, mgrDigitalMarketing);
            
            createEmployee("Lisa", "Stewart", "Social Media Coordinator", 
                "lisa.stewart@initech.com", "password", Role.EMPLOYEE, marketing, mgrDigitalMarketing);
            
            // Finance Team
            createEmployee("Amy", "Flores", "Senior Accountant", 
                "amy.flores@initech.com", "password", Role.EMPLOYEE, finance, mgrAccounting);
            
            createEmployee("Melissa", "Morris", "Financial Analyst", 
                "melissa.morris@initech.com", "password", Role.EMPLOYEE, finance, mgrAccounting);
            
            createEmployee("Heather", "Nguyen", "Payroll Specialist", 
                "heather.nguyen@initech.com", "password", Role.EMPLOYEE, finance, mgrAccounting);
            
            // Operations Team
            createEmployee("Rebecca", "Murphy", "Logistics Coordinator", 
                "rebecca.murphy@initech.com", "password", Role.EMPLOYEE, operations, mgrSupplyChain);
            
            createEmployee("Amanda", "Rivera", "Operations Analyst", 
                "amanda.rivera@initech.com", "password", Role.EMPLOYEE, operations, mgrSupplyChain);
            
            // Customer Support Team
            createEmployee("Ashley", "Cook", "Technical Support Specialist", 
                "ashley.cook@initech.com", "password", Role.EMPLOYEE, customerSupport, mgrTechSupport);
            
            createEmployee("Jennifer", "Rogers", "Customer Service Representative", 
                "jennifer.rogers@initech.com", "password", Role.EMPLOYEE, customerSupport, mgrTechSupport);
            
            createEmployee("Elizabeth", "Morgan", "Customer Service Representative", 
                "elizabeth.morgan@initech.com", "password", Role.EMPLOYEE, customerSupport, mgrTechSupport);
        }
    }

    private Employee createEmployee(String firstName, String lastName, String jobTitle,
                                   String email, String password, Role role,
                                   Department department, Employee manager) {
        usedEmails.add(email);

        Employee employee = Employee.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .jobTitle(jobTitle)
                .active(true)
                .role(role)
                .department(department)
                .manager(manager)
                .build();

        return employeeRepository.save(employee);
    }
}