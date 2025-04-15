import { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, ChevronDown, ChevronRight, Search, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrgChartNode {
  id: number;
  name: string;
  role: string;
  department: string;
  departmentId: number;
  managerId: number | null;
  jobTitle: string;
  subordinates: OrgChartNode[];
  createdAt?: string;
  updatedAt?: string;
}

interface FlattenedNode {
  id: number;
  name: string;
  role: string;
  department: string;
  departmentId: number;
  managerId: number | null;
  jobTitle: string;
  createdAt?: string;
  updatedAt?: string;
  level: number;
  hasSubordinates: boolean;
  isExpanded: boolean;
  path: number[];
}

function flattenOrgChart(
  nodes: OrgChartNode[], 
  level = 0, 
  result: FlattenedNode[] = [], 
  parentPath: number[] = []
): FlattenedNode[] {
  for (const node of nodes) {
    const currentPath = [...parentPath, node.id];
    const hasSubordinates = node.subordinates && node.subordinates.length > 0;
    
    result.push({
      id: node.id,
      name: node.name,
      role: node.role,
      department: node.department,
      departmentId: node.departmentId,
      managerId: node.managerId,
      jobTitle: node.jobTitle,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      level,
      hasSubordinates,
      isExpanded: true,
      path: currentPath
    });
    
    if (hasSubordinates) {
      flattenOrgChart(node.subordinates, level + 1, result, currentPath);
    }
  }
  
  return result;
}

interface Props {
  token?: string;
}

export default function OrgChartReport({ token: propToken }: Props = {}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flattenedData, setFlattenedData] = useState<FlattenedNode[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const token = propToken || localStorage.getItem("token") || "";
  const { user } = useCurrentUser();
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Update current date and time
  useEffect(() => {
    const now = new Date();
    setCurrentDateTime(now.toLocaleString());
  }, []);

  // Load org chart data - always fetch all employees
  useEffect(() => {
    const loadOrgChartData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Always fetch all employees regardless of department selection
        const url = "http://localhost:8080/api/reports/orgchart";
        
        console.log("Fetching org chart data from:", url);
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch org chart data: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Org chart data:", data);
        
        if (Array.isArray(data)) {
          setFlattenedData(flattenOrgChart(data));
        } else {
          console.error("Org chart data is not an array:", data);
          setError("Invalid data format received from server");
        }
      } catch (error) {
        console.error("Error fetching org chart data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch org chart data");
      } finally {
        setLoading(false);
      }
    };

    loadOrgChartData();
  }, [token]);  // Only reload when token changes, not when department changes

  // Filter the data based on search, department, and expansion state
  const filteredDataMemo = useMemo(() => {
    return flattenedData.filter(employee => {
      // Filter by search query
      const matchesSearch = searchQuery === "" || 
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by department
      const matchesDepartment = 
        selectedDepartment === "all" || 
        (employee.departmentId && employee.departmentId.toString() === selectedDepartment);
      
      // Filter by visibility (based on expansion state)
      let isVisible = true;
      
      // Check if any ancestor is collapsed
      for (let i = 0; i < employee.path.length - 1; i++) {
        const ancestorId = employee.path[i];
        const ancestor = flattenedData.find(node => node.id === ancestorId);
        if (ancestor && !ancestor.isExpanded) {
          isVisible = false;
          break;
        }
      }
      
      // Apply RBAC filtering
      let hasAccess = true;
      if (user && user.role === "EMPLOYEE") {
        // Employees can only see themselves and their direct reports
        hasAccess = employee.id === user.id || employee.managerId === user.id;
      }
      
      return matchesSearch && matchesDepartment && isVisible && hasAccess;
    });
  }, [flattenedData, searchQuery, selectedDepartment, user]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/departments", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch departments: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Departments data:", data); // Debug log
        
        // Make sure we have all departments
        if (Array.isArray(data) && data.length > 0) {
          // Log each department for debugging
          data.forEach((dept, index) => {
            console.log(`Department ${index}: ID=${dept.id}, Name=${dept.name}`);
          });
          setDepartments(data);
        } else {
          console.error("Departments data is empty or not an array:", data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    
    loadDepartments();
  }, [token]);

  // Toggle expand/collapse of a node
  const handleToggleExpand = (id: number) => {
    setFlattenedData(prev => 
      prev.map(employee => {
        if (employee.id === id) {
          return { ...employee, isExpanded: !employee.isExpanded };
        }
        return employee;
      })
    );
  };

  // Function to render a row with the correct indentation
  const renderEmployeeRow = (employee: FlattenedNode) => {
    return (
      <TableRow key={employee.id}>
        <TableCell className="py-2">
          <div 
            className="flex items-center" 
            style={{ paddingLeft: `${employee.level * 24}px` }}
          >
            {employee.hasSubordinates ? (
              <button 
                onClick={() => handleToggleExpand(employee.id)}
                className="mr-1 p-1 rounded-full hover:bg-muted-foreground/10"
              >
                {employee.isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6"></div>
            )}
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1 rounded-full">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span>{employee.name}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>{employee.department || "—"}</TableCell>
        <TableCell>
          <div className="flex items-center">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  {employee.role === "ADMIN" ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">{employee.role.toLowerCase()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
        <TableCell>{employee.jobTitle}</TableCell>
        <TableCell>{employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : "—"}</TableCell>
      </TableRow>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/reports")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={selectedDepartment}
            onValueChange={(value) => {
              console.log(`Selected department changed to: ${value}`);
              setSelectedDepartment(value);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 mt-4">
          <Skeleton className="h-10 w-full"/>
          <Skeleton className="h-10 w-full"/>
          <Skeleton className="h-10 w-full"/>
          <Skeleton className="h-10 w-full"/>
          <Skeleton className="h-10 w-full"/>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 mt-8">{error}</div>
      ) : filteredDataMemo.length === 0 ? (
        <div className="flex justify-center items-center h-64 mt-8">
          <p className="text-muted-foreground">No organization data available</p>
        </div>
      ) : (
        <div className="bg-white border rounded-md" ref={componentRef}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Organizational Chart Report</h2>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>
                {selectedDepartment === "all" 
                  ? "All Departments" 
                  : `Department: ${departments.find(d => d.id.toString() === selectedDepartment)?.name || ""}`}
              </span>
              <span>Generated: {currentDateTime}</span>
            </div>
          </div>
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDataMemo.map(employee => renderEmployeeRow(employee))}
            </TableBody>
          </Table>
          <div className="p-4 border-t text-xs text-muted-foreground">
            <p>Initech Employee Management System • Total Employees: {filteredDataMemo.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
