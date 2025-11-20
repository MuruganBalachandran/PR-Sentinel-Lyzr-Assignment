import { Clock, GitPullRequest, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PRCardProps {
  title: string;
  repo: string;
  prNumber: number;
  author: string;
  authorAvatar?: string;
  timeAgo: string;
  status: "analyzing" | "complete" | "issues";
  issuesCount?: number;
  severity?: "critical" | "high" | "medium" | "low";
  diffPreview?: string;
}

const PRCard = ({
  title,
  repo,
  prNumber,
  author,
  authorAvatar,
  timeAgo,
  status,
  issuesCount = 0,
  severity = "medium",
  diffPreview,
}: PRCardProps) => {
  const severityColors = {
    critical: "border-error/50 shadow-[0_0_20px_hsl(var(--error)/0.3)]",
    high: "border-warning/50 shadow-[0_0_20px_hsl(var(--warning)/0.3)]",
    medium: "border-primary/30",
    low: "border-success/30",
  };

  const severityBadges = {
    critical: { label: "Critical", className: "bg-error/20 text-error border-error/30" },
    high: { label: "High", className: "bg-warning/20 text-warning border-warning/30" },
    medium: { label: "Medium", className: "bg-primary/20 text-primary border-primary/30" },
    low: { label: "Low", className: "bg-success/20 text-success border-success/30" },
  };

  return (
    <div
      className={`glass group hover:glass-intense rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        status === "complete" && issuesCount > 0 ? severityColors[severity] : "border-white/5"
      } cursor-pointer animate-fade-in`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-white/10">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{repo}</span>
              <span className="opacity-50">#{prNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{author}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {status === "analyzing" && (
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary-glow animate-glow" />
            <span className="text-xs font-medium">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold mb-3 line-clamp-2 group-hover:text-primary-glow transition-colors">
        {title}
      </h3>

      {/* Status & Issues */}
      {status === "complete" && (
        <div className="flex items-center gap-2 mb-3">
          {issuesCount > 0 ? (
            <>
              <AlertCircle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">{issuesCount} issues found</span>
              <Badge className={severityBadges[severity].className}>{severityBadges[severity].label}</Badge>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">All clear! Ready to merge</span>
            </>
          )}
        </div>
      )}

      {/* Diff Preview */}
      {diffPreview && (
        <div className="glass rounded-lg p-3 mb-3 border border-white/5">
          <code className="text-xs text-muted-foreground font-mono line-clamp-2">{diffPreview}</code>
        </div>
      )}

      {/* Action */}
      <Button variant="premium" size="sm" className="w-full mt-2">
        <GitPullRequest className="w-4 h-4" />
        View Review
      </Button>
    </div>
  );
};

export default PRCard;
