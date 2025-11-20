````markdown
# PR Sentinel — Local project

## Project info

This repository contains the PR Sentinel frontend. Edit locally or use your preferred deployment platform.

## How can I edit this code?

You can work locally with your own IDE. The only requirement is Node.js & npm (or an alternative package manager).

Quick start:

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

Alternatively, edit files directly on GitHub or use Codespaces if you prefer.

## What technologies are used for this project?

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Deploy using your preferred hosting provider (Netlify, Vercel, Cloudflare Pages, etc.) and follow their documentation for Vite/React apps.

**Protecting API Keys**

- **Don't commit secrets:** Keep real API keys and tokens out of source control. Use a local `.env` file for development and never commit it.
- **Use the included example:** Copy `.env.example` to `.env` and populate the real values locally.
- **Ignore `.env`:** This repository includes `.env` in `.gitignore`. If you previously committed a `.env`, untrack it (commands below).
- **Remove secrets from git history:** If secrets were committed earlier, remove them from the repository history (with `git filter-repo` or BFG) and rotate the exposed keys immediately.

- **Git commands (PowerShell):**

```powershell
# Stop tracking .env and commit the change
git rm --cached .env; git commit -m "Remove .env from repository"; git push

# If you need to remove secrets from history, consider using git filter-repo or BFG:
# 1) Install git-filter-repo, then:
#    git filter-repo --path .env --invert-paths
# 2) Or use the BFG Repo-Cleaner (https://rtyley.github.io/bfg-repo-cleaner/)

# After cleaning history, rotate any exposed keys immediately.
```

- **CI / GitHub:** Put production secrets in GitHub Actions Secrets or your hosting provider's secret manager, then reference them in your deployment pipeline instead of committing them.

If you want, I can run the `git rm --cached .env` command for you and prepare a commit. I can also guide you through removing secrets from history if needed — this is destructive, so I will only run it with your explicit approval.

````
# PR Sentinel — Local project

## Project info

This repository contains the PR Sentinel frontend. Edit locally or use your preferred deployment platform.

## How can I edit this code?

You can work locally with your own IDE. The only requirement is Node.js & npm (or an alternative package manager).

Quick start:

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

Alternatively, edit files directly on GitHub or use Codespaces if you prefer.

## What technologies are used for this project?

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Deploy using your preferred hosting provider (Netlify, Vercel, Cloudflare Pages, etc.) and follow their documentation for Vite/React apps.
