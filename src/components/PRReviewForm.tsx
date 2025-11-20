import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface PRReviewFormProps {
  onReviewComplete: (result: ReviewResult) => void;
}

export default function PRReviewForm({ onReviewComplete }: PRReviewFormProps) {
  const [prUrl, setPrUrl] = useState("");
  const [manualDiff, setManualDiff] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "diff">("url");
  const [isLoading, setIsLoading] = useState(false);
  const [agentType, setAgentType] = useState<"gemini" | "lyzr" | "kimi">("gemini");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMode === "url" && !prUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GitHub PR URL",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "diff" && !manualDiff.trim()) {
      toast({
        title: "Error",
        description: "Please paste a diff to review",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = inputMode === "url" 
        ? { prUrl: prUrl.trim(), agentType }
        : { manualDiff: manualDiff.trim(), agentType };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-pr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to review PR');
      }

      const result: ReviewResult = await response.json();
      
      toast({
        title: "Review Complete",
        description: `Found ${result.issues.length} issues in the PR`,
      });

      onReviewComplete(result);
      setPrUrl("");
      setManualDiff("");
    } catch (error) {
      console.error('Review error:', error);
      toast({
        title: "Review Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "url" | "diff")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">PR URL</TabsTrigger>
          <TabsTrigger value="diff">Manual Diff</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://github.com/owner/repo/pull/123"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" disabled={isLoading} className="min-w-[180px]">
                  {agentType === "gemini" && "Review with Gemini"}
                  {agentType === "lyzr" && "Review with Lyzr"}
                  {agentType === "kimi" && "Review with Kimi K2"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background z-50">
                <DropdownMenuItem onClick={() => setAgentType("gemini")}>
                  Review with Gemini
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAgentType("lyzr")}>
                  Review with Lyzr Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAgentType("kimi")}>
                  Review with Kimi K2
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reviewing...
                </>
              ) : (
                "Review"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Paste any public GitHub PR URL for AI-powered code review
          </p>
        </TabsContent>

        <TabsContent value="diff" className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your git diff here...&#10;&#10;Example:&#10;diff --git a/file.js b/file.js&#10;index 1234567..abcdefg 100644&#10;--- a/file.js&#10;+++ b/file.js&#10;@@ -1,3 +1,4 @@&#10;+const newVar = 'test';&#10; function example() {&#10;   return true;&#10; }"
              value={manualDiff}
              onChange={(e) => setManualDiff(e.target.value)}
              disabled={isLoading}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" disabled={isLoading} className="min-w-[180px]">
                    {agentType === "gemini" && "Review with Gemini"}
                    {agentType === "lyzr" && "Review with Lyzr"}
                    {agentType === "kimi" && "Review with Kimi K2"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background z-50">
                  <DropdownMenuItem onClick={() => setAgentType("gemini")}>
                    Review with Gemini
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentType("lyzr")}>
                    Review with Lyzr Agent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAgentType("kimi")}>
                    Review with Kimi K2
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  "Review Diff"
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Paste a git diff output for AI-powered code review
          </p>
        </TabsContent>
      </Tabs>
    </form>
  );
}
