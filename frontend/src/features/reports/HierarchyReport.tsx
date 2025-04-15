import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, ChevronDown, ChevronRight, Search, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OrgChartNode {
  id: number;
  name: string;
  role: string;
  department: string;
  departmentId: number;
  managerId: number | null;
  subordinates: OrgChartNode[];
}

interface FlattenedNode {
  id: number;
  name: string;
  role: string;
  department: string;
  departmentId: number;
  managerId: number | null;
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
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const token = propToken || localStorage.getItem("token") || "";
  const { user } = useCurrentUser();
  
  // Flatten the org chart data for table display
  const [flattenedData, setFlattenedData] = useState<FlattenedNode[]>([]);
  
  // Filter the data based on search, department, and expansion state
  const filteredData = useMemo(() => {
    return flattenedData.filter(employee => {
      // Filter by search query
      const matchesSearch = searchQuery === "" || 
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by department
      const matchesDepartment = selectedDepartment === "all" || 
        (employee.departmentId && employee.departmentId.toString() === selectedDepartment);
      
      // Apply visibility based on parent expansion state
      const isParentExpanded = employee.path.every(id => {
        if (id === employee.id) return true;
        const parent = flattenedData.find(e => e.id === id);
        return parent ? parent.isExpanded : true;
      });

      // Apply RBAC filtering
      let hasAccess = true;
      if (user && user.role === "EMPLOYEE") {
        // Employees can only see themselves and their manager
        hasAccess = employee.id === user.id || employee.managerId === user.id;
      }
      
      return matchesSearch && matchesDepartment && isParentExpanded && hasAccess;
    });
  }, [flattenedData, searchQuery, selectedDepartment, user]);

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

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/departments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [token]);

  useEffect(() => {
    const loadOrgChartData = async () => {
      setLoading(true);
      setError(null);
      
      // For demonstration, create mock data with more employees
      const mockData: OrgChartNode[] = [
        {
          id: 1,
          name: "John Smith",
          role: "ADMIN",
          department: "Executive",
          departmentId: 1,
          managerId: null,
          subordinates: [
            {
              id: 2,
              name: "Jane Doe",
              role: "EMPLOYEE",
              department: "Engineering",
              departmentId: 2,
              managerId: 1,
              subordinates: [
                {
                  id: 4,
                  name: "Bob Johnson",
                  role: "EMPLOYEE",
                  department: "Engineering",
                  departmentId: 2,
                  managerId: 2,
                  subordinates: [
                    {
                      id: 8,
                      name: "Alex Turner",
                      role: "EMPLOYEE",
                      department: "Engineering",
                      departmentId: 2,
                      managerId: 4,
                      subordinates: []
                    },
                    {
                      id: 9,
                      name: "Emma Wilson",
                      role: "EMPLOYEE",
                      department: "Engineering",
                      departmentId: 2,
                      managerId: 4,
                      subordinates: []
                    }
                  ]
                },
                {
                  id: 5,
                  name: "Alice Williams",
                  role: "EMPLOYEE",
                  department: "Engineering",
                  departmentId: 2,
                  managerId: 2,
                  subordinates: [
                    {
                      id: 10,
                      name: "David Lee",
                      role: "EMPLOYEE",
                      department: "Engineering",
                      departmentId: 2,
                      managerId: 5,
                      subordinates: []
                    }
                  ]
                }
              ]
            },
            {
              id: 3,
              name: "Mike Brown",
              role: "EMPLOYEE",
              department: "Marketing",
              departmentId: 3,
              managerId: 1,
              subordinates: [
                {
                  id: 6,
                  name: "Sarah Miller",
                  role: "EMPLOYEE",
                  department: "Marketing",
                  departmentId: 3,
                  managerId: 3,
                  subordinates: [
                    {
                      id: 11,
                      name: "Jennifer Parker",
                      role: "EMPLOYEE",
                      department: "Marketing",
                      departmentId: 3,
                      managerId: 6,
                      subordinates: []
                    }
                  ]
                },
                {
                  id: 7,
                  name: "Tom Wilson",
                  role: "EMPLOYEE",
                  department: "Marketing",
                  departmentId: 3,
                  managerId: 3,
                  subordinates: []
                }
              ]
            }
          ]
        }
      ];
      
      // Simulate API call delay
      setTimeout(() => {
        setFlattenedData(flattenOrgChart(mockData));
        setLoading(false);
      }, 1000);
      
      // Uncomment this when the backend API is ready
      /*
      try {
        const url = selectedDepartment && selectedDepartment !== "all"
          ? `http://localhost:8080/api/reports/orgchart?departmentId=${selectedDepartment}` 
          : "http://localhost:8080/api/reports/orgchart";
          
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
        setFlattenedData(flattenOrgChart(data));
      } catch (error) {
        console.error("Error fetching org chart data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch org chart data");
      } finally {
        setLoading(false);
      }
      */
    };

    loadOrgChartData();
  }, [token, selectedDepartment]);

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
      </TableRow>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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
            onValueChange={setSelectedDepartment}
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

      <Card>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full"/>
            <Skeleton className="h-8 w-full"/>
            <Skeleton className="h-8 w-full"/>
            <Skeleton className="h-8 w-full"/>
            <Skeleton className="h-8 w-full"/>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : filteredData.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-muted-foreground">No organization data available</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(employee => renderEmployeeRow(employee))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}