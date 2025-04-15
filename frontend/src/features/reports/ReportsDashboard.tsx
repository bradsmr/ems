import { GitBranchPlus } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
}

function ReportCard({ title, description, icon, path }: ReportCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <div className="rounded-md bg-primary/10 p-2">{icon}</div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-2 border-t bg-muted/50">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(path)}
        >
          View Report
        </Button>
      </CardFooter>
    </Card>
  );
}

interface Props {
  token: string;
}

export default function ReportsDashboard({ token }: Props) {
  const reports = [
    {
      id: "orgchart",
      title: "Organizational Chart",
      description: "View the organizational structure and reporting relationships",
      icon: <GitBranchPlus className="h-10 w-10 text-primary" />,
      path: "/reports/orgchart",
    },
    // Additional report cards can be added here in the future
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            path={report.path}
          />
        ))}
      </div>
    </div>
  );
}
