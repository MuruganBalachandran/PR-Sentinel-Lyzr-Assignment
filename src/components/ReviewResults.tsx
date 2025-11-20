import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Bug, Eye, ExternalLink } from "lucide-react";

interface ReviewIssue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'logic' | 'readability';
  title: string;
  description: string;
  suggestion: string;
}

interface ReviewResult {
  prUrl: string;
  owner: string;
  repo: string;
  prNumber: number;
  issues: ReviewIssue[];
  reviewedAt: string;
}

interface ReviewResultsProps {
  result: ReviewResult;
}

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

const categoryIcons = {
  security: AlertTriangle,
  logic: Bug,
  readability: Eye,
};

export default function ReviewResults({ result }: ReviewResultsProps) {
  const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
  const highCount = result.issues.filter(i => i.severity === 'high').length;
  const mediumCount = result.issues.filter(i => i.severity === 'medium').length;
  const lowCount = result.issues.filter(i => i.severity === 'low').length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Review Results for PR #{result.prNumber}
          </h2>
          <a 
            href={result.prUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
          >
            {result.owner}/{result.repo}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && <Badge variant="destructive">{criticalCount} Critical</Badge>}
          {highCount > 0 && <Badge className="bg-orange-500">{highCount} High</Badge>}
          {mediumCount > 0 && <Badge className="bg-yellow-500 text-black">{mediumCount} Medium</Badge>}
          {lowCount > 0 && <Badge variant="secondary">{lowCount} Low</Badge>}
        </div>
      </div>

      {result.issues.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">
            🎉 No issues found! This PR looks good.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {result.issues.map((issue, index) => {
            const Icon = categoryIcons[issue.category];
            return (
              <Card key={index} className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${severityColors[issue.severity]}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {issue.file}:{issue.line}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {issue.category}
                    </Badge>
                    <Badge 
                      className={`${severityColors[issue.severity]} text-white capitalize`}
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                </div>
                
                <div className="pl-14 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Problem:</p>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Suggestion:</p>
                    <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
