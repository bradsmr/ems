import { useState } from "react";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HierarchyNode {
  id: number;
  name: string;
  role: string;
  department: string;
  departmentId: number;
  managerId: number | null;
  subordinates: HierarchyNode[];
}

interface TreeNodeProps {
  node: HierarchyNode;
  level: number;
}

function TreeNode({ node, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasSubordinates = node.subordinates && node.subordinates.length > 0;
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-300";
      case "MANAGER":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <div className="mb-2">
      <div 
        className={`flex items-center p-2 rounded-md hover:bg-muted transition-colors ${
          level === 0 ? "bg-primary/10" : ""
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {hasSubordinates ? (
          <button 
            onClick={toggleExpanded}
            className="mr-1 p-1 rounded-full hover:bg-muted-foreground/10"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6"></div>
        )}
        
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-primary/20 p-1 rounded-full">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{node.name}</div>
            <div className="text-xs text-muted-foreground">
              {node.department || "No Department"}
            </div>
          </div>
        </div>
        
        <Badge variant="outline" className={`ml-2 ${getRoleBadgeColor(node.role)}`}>
          {node.role}
        </Badge>
      </div>
      
      {expanded && hasSubordinates && (
        <div className="ml-6 pl-4 border-l border-border">
          {node.subordinates.map((subordinate) => (
            <TreeNode 
              key={subordinate.id} 
              node={subordinate} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface OrganizationTreeProps {
  data: HierarchyNode[];
}

export default function OrganizationTree({ data }: OrganizationTreeProps) {
  return (
    <div className="p-4">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} level={0} />
      ))}
    </div>
  );
}
