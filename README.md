# PR Sentinel — Frontend

## 🚀 Live Frontend

👉 **Live URL: [live here](https://pr-sentinel-lyzr-assignment.vercel.app/)

---

## 📘 About the Project

PR Sentinel provides an **AI-powered pull request review pipeline** that inspects code diffs, identifies potential issues, and outputs structured review comments.

This frontend connects to a Supabase Edge Function that performs the review using one of several AI backends.

---

## 🧠 How the Review Pipeline Works

PR Sentinel’s review flow operates in these steps:

### 1. **Read PR Diffs**
- The client (`src/components/PRReviewForm.tsx`) submits either:
  - a `prUrl` → server fetches raw PR diff using a GitHub PAT  
  - a `manualDiff` → raw pasted text is used directly

### 2. **Parse & Interpret Changes**
- The serverless function feeds the raw diff into an LLM prompt.
- No standalone diff parser is currently used — the LLM interprets the diff directly.

### 3. **Multi-Agent Reasoning**
- The backend supports multiple AI engines:
  - `gemini`
  - `lyzr`
  - `kimi` (Groq)
- Each is invoked with a strict JSON-output prompt.

### 4. **Identify Issues**
The AI categorizes findings as:

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
The function validates and parses the model output before returning it to the frontend.

### 📂 Key Files

| File | Description |
|------|-------------|
| `supabase/functions/review-pr/index.ts` | Serverless reviewer function |
| `src/components/PRReviewForm.tsx` | Main frontend form for submitting diffs |
| `src/integrations/supabase/client.ts` | Supabase client setup |

---

## 🛠️ Installation & Local Development

You can develop locally using any IDE.  
**Requirement:** Node.js + npm (or pnpm / yarn).

### Quick Start (PowerShell)

```powershell
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
