````markdown
# PR Sentinel — Local project

## Live frontend

Live frontend: <YOUR_LIVE_FRONTEND_URL>  
Replace the placeholder with your deployed app URL (Vercel/Netlify/etc.).

## About the approach

PR Sentinel implements an AI-powered PR review pipeline with these steps:

- **Read PR diffs:** The client (`src/components/PRReviewForm.tsx`) submits either a `prUrl` or a `manualDiff` to a serverless function. For `prUrl` the function fetches the raw PR diff from the GitHub API using a PAT; for `manualDiff` it uses the pasted diff text directly.
- **Parse & understand changes:** The server passes the raw diff into an LLM prompt so the agent can reason about added/removed lines. (There is currently no dedicated diff parser in the repo; the AI consumes the diff text.)
- **Multi-agent reasoning:** The server can invoke multiple agent backends (`gemini`, `lyzr`, `kimi`) depending on the selected `agentType`. Each integration sends a strict prompt asking the model to output a JSON array of findings.
- **Identify issues:** The AI is instructed to categorize findings as `security`, `logic`, or `readability`, and include `file`, `line`, `severity`, `title`, `description`, and `suggestion` for each issue.
- **Structured review comments:** The function parses AI output (with parsing fallbacks) and returns a typed JSON result to the client for display.

Key files:
- Serverless reviewer: `supabase/functions/review-pr/index.ts`
- Client form: `src/components/PRReviewForm.tsx`
- Frontend Supabase client: `src/integrations/supabase/client.ts`

## How to install and run

You can work locally with your own IDE. The only requirement is Node.js & npm (or an alternative package manager).

Quick start (PowerShell):

```powershell
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

Alternatively, edit files directly on GitHub or use Codespaces.

## Tools & Frameworks used

- **Vite**: Development tooling and build
- **TypeScript**: Static typing
- **React**: UI
- **shadcn-ui**: UI components built on Radix
- **Tailwind CSS**: Utility-first styling
- **Supabase Functions (Deno)**: Serverless review function
- **Integrations**: optional external AI backends (`Gemini`, `Lyzr`, `Groq/Kimi`)

## Deployment

Deploy the frontend to Vercel, Netlify, or Cloudflare Pages. The review function is implemented as a Supabase Edge Function (Deno). For production:

- Put API keys and secrets in your hosting provider or Supabase secret manager (do not commit them).
- Ensure `GITHUB_PAT`, `GEMINI_API_KEY`, `LYZR_API_KEY`, or `GROQ_API_KEY` are set in the function environment.
- Restrict CORS and require authentication on sensitive endpoints if exposing review functionality to the public.

**Protecting API keys**

- Don't commit secrets. Use a local `.env` for development and add `.env` to `.gitignore`.
- For CI/deploy, use the provider's secret store or GitHub Actions Secrets.
- If sensitive values were committed, remove them from history (with `git filter-repo` or BFG) and rotate the keys immediately.

Git commands (PowerShell) to stop tracking a local `.env`:

```powershell
# Stop tracking .env and commit the change
git rm --cached .env; git commit -m "Remove .env from repository"; git push
```
