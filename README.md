# PR Sentinel — Frontend

## 🚀 Live URL
👉 **[Live here](https://pr-sentinel-lyzr-assignment.vercel.app/)**

<img width="1898" height="966" alt="App Screenshot" src="https://github.com/user-attachments/assets/88be8163-aec3-4507-9448-c5b4b7a2248a" />

<img width="1897" height="964" alt="App Screenshot" src="https://github.com/user-attachments/assets/7588c1e5-9541-4d3c-97a3-759811f6e52c" />

---

## 📘 About the Project

PR Sentinel provides an **AI-powered pull request review pipeline** that inspects code diffs, identifies potential issues, and outputs structured review comments.

This frontend interacts with a **Supabase Edge Function** that performs the actual review using one of several AI backends.

---

## 🧠 How the Review Pipeline Works

PR Sentinel’s review workflow:

### 1. **Read PR Diffs**
The client (`src/components/PRReviewForm.tsx`) sends either:
- a **PR URL** → server fetches raw GitHub diff using a PAT  
- a **manual diff** → raw pasted diff text is used directly

### 2. **Parse & Interpret Changes**
- The Supabase Edge Function passes the raw diff to an LLM prompt.  
- No explicit diff parser exists; the LLM interprets the diff text.

### 3. **Multi-Agent AI Reasoning**
Supported AI engines:
- `gemini`
- `lyzr`
- `kimi` (Groq)

Each receives a strict JSON-output prompt.

### 4. **Identify Issues**
Models categorize issues into:
- `security`
- `logic`
- `readability`

Each issue includes:
- `file`
- `line`
- `severity`
- `title`
- `description`
- `suggestion`

### 5. **Structured Output**
The server:
1. Validates AI output  
2. Applies fallbacks if needed  
3. Returns a typed JSON response to the frontend  

---

## 📂 Key Files

| File | Description |
|------|-------------|
| `supabase/functions/review-pr/index.ts` | Supabase Edge Function performing AI-powered review |
| `src/components/PRReviewForm.tsx` | Form for submitting PR URL or manual diff |
| `src/integrations/supabase/client.ts` | Supabase client setup |

---

## 🧩 Tools & Frameworks

- **Vite** — Dev tooling and build  
- **TypeScript** — Static typing  
- **React** — UI  
- **shadcn/ui** — Radix-based component system  
- **Tailwind CSS** — Utility-first styling  
- **Supabase Edge Functions (Deno)** — Serverless backend logic  
- **AI Backends:** Gemini, Lyzr, Groq/Kimi  

---

## 🚢 Deployment

### Frontend Deployment
Deploy easily to:
- **Vercel**
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**

### Backend (Supabase Edge Function)
The logic runs inside the Supabase Edge Function:  
`supabase/functions/review-pr/`

### Required Environment Variables
Set these in **Supabase**, Vercel, Netlify, or your secret manager:

- `GITHUB_PAT`
- `GEMINI_API_KEY`
- `LYZR_API_KEY`
- `GROQ_API_KEY`

### For Public Deployments
- Restrict CORS  
- Protect endpoints if needed  
- Do not expose backend review functionality without safeguards  

---

## 🔐 Protecting API Keys

- Never commit secrets; store them in `.env`
- `.env` is already included in `.gitignore`

### Remove a committed `.env`

```powershell
git rm --cached .env
git commit -m "Remove .env from repository"
git push
