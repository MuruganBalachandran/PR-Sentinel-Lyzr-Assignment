import PRCard from "./PRCard";

const mockPRs = [
  {
    title: "Add authentication middleware with JWT token validation",
    repo: "vercel/next.js",
    prNumber: 14521,
    author: "shadcn",
    timeAgo: "2 hours ago",
    status: "complete" as const,
    issuesCount: 3,
    severity: "high" as const,
    diffPreview: "+ const token = req.headers.authorization?.split(' ')[1];",
  },
  {
    title: "Refactor database connection pool for better performance",
    repo: "prisma/prisma",
    prNumber: 8923,
    author: "alex_dev",
    timeAgo: "5 hours ago",
    status: "analyzing" as const,
  },
  {
    title: "Implement rate limiting for API endpoints",
    repo: "stripe/stripe-node",
    prNumber: 2341,
    author: "jane_smith",
    timeAgo: "1 day ago",
    status: "complete" as const,
    issuesCount: 0,
    severity: "low" as const,
  },
  {
    title: "Update dependencies and fix security vulnerabilities",
    repo: "nodejs/node",
    prNumber: 51234,
    author: "security_bot",
    timeAgo: "3 hours ago",
    status: "complete" as const,
    issuesCount: 12,
    severity: "critical" as const,
    diffPreview: "- express: ^4.17.1\n+ express: ^4.19.2",
  },
  {
    title: "Add TypeScript strict mode and fix type errors",
    repo: "facebook/react",
    prNumber: 28456,
    author: "typescript_guru",
    timeAgo: "6 hours ago",
    status: "complete" as const,
    issuesCount: 5,
    severity: "medium" as const,
    diffPreview: '+ "strict": true,\n+ "noImplicitAny": true,',
  },
  {
    title: "Optimize image loading with lazy loading and WebP format",
    repo: "vercel/next.js",
    prNumber: 14522,
    author: "perf_optimizer",
    timeAgo: "8 hours ago",
    status: "complete" as const,
    issuesCount: 1,
    severity: "low" as const,
  },
];

const PRFeed = () => {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Live PR Reviews</h2>
        <p className="text-muted-foreground">Real-time analysis with Gemini 2.5 Flash</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPRs.map((pr, index) => (
          <PRCard key={`${pr.repo}-${pr.prNumber}`} {...pr} />
        ))}
      </div>
    </section>
  );
};

export default PRFeed;
