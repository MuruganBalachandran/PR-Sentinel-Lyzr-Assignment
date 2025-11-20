import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewIssue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'logic' | 'readability';
  title: string;
  description: string;
  suggestion: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prUrl, manualDiff, agentType = 'gemini' } = await req.json();
    
    let diff = '';
    let owner = 'manual';
    let repo = 'review';
    let prNumber = 0;

    if (manualDiff) {
      // Manual diff provided directly
      diff = manualDiff;
      console.log('Using manual diff, length:', diff.length);
    } else if (prUrl && typeof prUrl === 'string') {
      // Extract owner, repo, and PR number from URL
      // Format: https://github.com/owner/repo/pull/123
      const urlMatch = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
      if (!urlMatch) {
        return new Response(
          JSON.stringify({ error: 'Invalid GitHub PR URL format' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const prNumberStr = urlMatch[3];
      owner = urlMatch[1];
      repo = urlMatch[2];
      prNumber = parseInt(prNumberStr);
      
      const GITHUB_PAT = Deno.env.get('GITHUB_PAT');
      if (!GITHUB_PAT) {
        console.error('Missing GitHub PAT');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Fetching PR diff for ${owner}/${repo}#${prNumber}`);

      // Fetch PR diff from GitHub
      const prResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3.diff',
            'User-Agent': 'PR-Sentinel',
          },
        }
      );

      if (!prResponse.ok) {
        console.error('GitHub API error:', prResponse.status, await prResponse.text());
        return new Response(
          JSON.stringify({ error: `Failed to fetch PR: ${prResponse.statusText}` }), 
          { status: prResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      diff = await prResponse.text();
      console.log('PR diff fetched, length:', diff.length);
    } else {
      return new Response(
        JSON.stringify({ error: 'Either PR URL or manual diff is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const LYZR_API_KEY = Deno.env.get('LYZR_API_KEY');
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

    if (agentType === 'gemini' && !GEMINI_API_KEY) {
      console.error('Missing Gemini API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (agentType === 'lyzr' && !LYZR_API_KEY) {
      console.error('Missing Lyzr API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (agentType === 'kimi' && !GROQ_API_KEY) {
      console.error('Missing Groq API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let issues: ReviewIssue[] = [];

    if (agentType === 'kimi') {
      // Call Groq API with Kimi K2 model
      console.log('Using Kimi K2 Agent for review');
      
      const kimiPrompt = `You are a precise, evidence-only security & code reviewer for GitHub PRs. 
You NEVER guess, speculate, or hallucinate CVE numbers, severity, or vulnerability details.

Strict rules (violate any = invalid output):
1. CVE numbers and CVSS scores MUST come exclusively from one of these live sources only:
   - https://nvd.nist.gov
   - https://github.com/advisories
   - The official upstream changelog or release notes shown in the PR
   If it is not in one of those three places right now, you MUST say "security patch without published CVE yet" instead of inventing one.
2. Never reuse CVE numbers from other libraries or years.
3. Never call anything "Critical" unless the official CVSS base score is ≥9.0.
4. Always quote the upstream reason verbatim (Dependabot body, changelog, or commit message) as the source of truth.
5. For every finding you MUST output exactly this JSON structure:

[
  {
    "file": "path/to/file.js",
    "line": 42,
    "severity": "critical" | "high" | "medium" | "low",
    "category": "security" | "logic" | "readability",
    "title": "Brief issue title",
    "description": "Detailed explanation including:\\nDependency: <name>\\nFrom → To: <old> → <new>\\nUpstream reason (exact quote): \\"<quote>\\"\\nCVE: <CVE-XXXX-XXXXX with URL> or \\"none published yet\\"\\nCVSS base score: <X.X (Severity)> or \\"not published\\"\\nSource URL: <exact URL(s)>",
    "suggestion": "Assessment: <one-sentence conclusion>"
  }
]

PR Diff:
${diff}

Return ONLY the JSON array, no other text. Do not add suggestions, opinions, or extra text unless explicitly asked.`;

      const groqResponse = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2-instruct-0905',
            messages: [
              { role: 'user', content: kimiPrompt }
            ],
            temperature: 0.6,
            max_tokens: 4096,
            top_p: 1,
          })
        }
      );

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, errorText);
        
        let errorMessage = 'Kimi K2 Agent analysis failed';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorMessage = `Kimi K2: ${errorJson.error.message}`;
          }
        } catch {
          // Use default message if parsing fails
        }
        
        return new Response(
          JSON.stringify({ error: errorMessage }), 
          { status: groqResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const groqData = await groqResponse.json();
      console.log('Kimi K2 response received');

      const generatedText = groqData.choices?.[0]?.message?.content || '';
      
      // Extract JSON from markdown code blocks if present
      let issuesText = generatedText.trim();
      if (issuesText.startsWith('```json')) {
        issuesText = issuesText.slice(7);
      } else if (issuesText.startsWith('```')) {
        issuesText = issuesText.slice(3);
      }
      if (issuesText.endsWith('```')) {
        issuesText = issuesText.slice(0, -3);
      }
      issuesText = issuesText.trim();

      try {
        issues = JSON.parse(issuesText);
      } catch (parseError) {
        console.error('Failed to parse Kimi K2 response:', parseError);
        console.error('Raw response:', generatedText);
        return new Response(
          JSON.stringify({ error: 'Kimi K2 returned invalid format' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (agentType === 'lyzr') {
      // Call Lyzr Agent API
      console.log('Using Lyzr Agent for review');
      
      const lyzrPrompt = `You are a precise, evidence-only security & code reviewer for GitHub PRs. 
You NEVER guess, speculate, or hallucinate CVE numbers, severity, or vulnerability details.

Strict rules (violate any = invalid output):
1. CVE numbers and CVSS scores MUST come exclusively from one of these live sources only:
   - https://nvd.nist.gov
   - https://github.com/advisories
   - The official upstream changelog or release notes shown in the PR
   If it is not in one of those three places right now, you MUST say "security patch without published CVE yet" instead of inventing one.
2. Never reuse CVE numbers from other libraries or years.
3. Never call anything "Critical" unless the official CVSS base score is ≥9.0.
4. Always quote the upstream reason verbatim (Dependabot body, changelog, or commit message) as the source of truth.
5. For every finding you MUST output exactly this JSON structure:

[
  {
    "file": "path/to/file.js",
    "line": 42,
    "severity": "critical" | "high" | "medium" | "low",
    "category": "security" | "logic" | "readability",
    "title": "Brief issue title",
    "description": "Detailed explanation including:\\nDependency: <name>\\nFrom → To: <old> → <new>\\nUpstream reason (exact quote): \\"<quote>\\"\\nCVE: <CVE-XXXX-XXXXX with URL> or \\"none published yet\\"\\nCVSS base score: <X.X (Severity)> or \\"not published\\"\\nSource URL: <exact URL(s)>",
    "suggestion": "Assessment: <one-sentence conclusion>"
  }
]

PR Diff:
${diff}

Return ONLY the JSON array, no other text. Do not add suggestions, opinions, or extra text unless explicitly asked.`;

      const lyzrResponse = await fetch(
        'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': LYZR_API_KEY!,
          },
          body: JSON.stringify({
            user_id: "sarankumar131313@gmail.com",
            agent_id: "691d5ab9499310d238fb2035",
            session_id: `${owner}-${repo}-${prNumber}-${Date.now()}`,
            message: lyzrPrompt
          })
        }
      );

      if (!lyzrResponse.ok) {
        const errorText = await lyzrResponse.text();
        console.error('Lyzr API error:', lyzrResponse.status, errorText);
        
        let errorMessage = 'Lyzr Agent analysis failed';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error || errorJson.message) {
            errorMessage = `Lyzr: ${errorJson.error || errorJson.message}`;
          }
        } catch {
          // Use default message if parsing fails
        }
        
        return new Response(
          JSON.stringify({ error: errorMessage }), 
          { status: lyzrResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const lyzrData = await lyzrResponse.json();
      console.log('Lyzr response received:', JSON.stringify(lyzrData));
      
      // Parse Lyzr response - adjust based on actual API response format
      const generatedText = lyzrData.response || lyzrData.message || '';
      
      let issuesText = generatedText.trim();
      if (issuesText.startsWith('```json')) {
        issuesText = issuesText.slice(7);
      } else if (issuesText.startsWith('```')) {
        issuesText = issuesText.slice(3);
      }
      if (issuesText.endsWith('```')) {
        issuesText = issuesText.slice(0, -3);
      }
      issuesText = issuesText.trim();

      try {
        issues = JSON.parse(issuesText);
      } catch (parseError) {
        console.error('Failed initial JSON parse of Lyzr response:', parseError);
        console.error('Raw response:', generatedText);

        // Second attempt: extract JSON array between [ and ] if present
        try {
          const start = generatedText.indexOf('[');
          const end = generatedText.lastIndexOf(']');
          if (start !== -1 && end !== -1 && end > start) {
            const jsonSlice = generatedText.slice(start, end + 1);
            issues = JSON.parse(jsonSlice);
          } else {
            throw new Error('No JSON array found in Lyzr response');
          }
        } catch (secondError) {
          console.error('Failed secondary JSON parse of Lyzr response:', secondError);

          // Final fallback: show a single generic issue with cleaned text
          let cleaned = generatedText.trim();
          if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
          else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
          if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
          cleaned = cleaned.trim();
          // If the response looks like a single JSON array string, strip outer brackets
          if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
            cleaned = cleaned.slice(1, -1).trim();
          }

          let parsed = false;
          if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
            try {
              const singleIssue = JSON.parse(cleaned);
              issues = [singleIssue as ReviewIssue];
              parsed = true;
            } catch (jsonErr) {
              console.error('Failed to parse single-issue JSON from Lyzr fallback:', jsonErr);
            }
          }

          if (!parsed) {
            let finalText = cleaned.trim();
            if (finalText.startsWith('{') && finalText.endsWith('}')) {
              finalText = finalText.slice(1, -1).trim();
            }

            issues = [
              {
                file: 'lyzr-agent',
                line: 0,
                severity: 'medium',
                category: 'security',
                title: 'Lyzr Agent Analysis',
                description: finalText,
                suggestion: 'Assessment: See Lyzr agent analysis details above.',
              },
            ];
          }
        }
      }
    } else {
      // Call Gemini API for PR review
      console.log('Using Gemini AI for review');
      const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a precise, evidence-only security & code reviewer for GitHub PRs. 
You NEVER guess, speculate, or hallucinate CVE numbers, severity, or vulnerability details.

Strict rules (violate any = invalid output):
1. CVE numbers and CVSS scores MUST come exclusively from one of these live sources only:
   - https://nvd.nist.gov
   - https://github.com/advisories
   - The official upstream changelog or release notes shown in the PR
   If it is not in one of those three places right now, you MUST say "security patch without published CVE yet" instead of inventing one.
2. Never reuse CVE numbers from other libraries or years.
3. Never call anything "Critical" unless the official CVSS base score is ≥9.0.
4. Always quote the upstream reason verbatim (Dependabot body, changelog, or commit message) as the source of truth.
5. For every finding you MUST output exactly this JSON structure:

[
  {
    "file": "path/to/file.js",
    "line": 42,
    "severity": "critical" | "high" | "medium" | "low",
    "category": "security" | "logic" | "readability",
    "title": "Brief issue title",
    "description": "Detailed explanation including:\nDependency: <name>\nFrom → To: <old> → <new>\nUpstream reason (exact quote): \"<quote>\"\nCVE: <CVE-XXXX-XXXXX with URL> or \"none published yet\"\nCVSS base score: <X.X (Severity)> or \"not published\"\nSource URL: <exact URL(s)>",
    "suggestion": "Assessment: <one-sentence conclusion>"
  }
]

Example of correct output when no CVE exists yet:
Dependency: js-yaml
From → To: 4.1.0 → 4.1.1
Upstream reason (exact quote): "Fix prototype pollution issue in yaml merge (<<) operator."
CVE: none published yet
CVSS base score: not published
Source URL: https://github.com/nodeca/js-yaml/blob/master/Changelog.md
Assessment: This PR correctly applies the upstream security fix for prototype pollution.

PR Diff:
${diff}

Return ONLY the JSON array, no other text. Do not add suggestions, opinions, or extra text unless explicitly asked.`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          }
        })
      }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', geminiResponse.status, errorText);
        
        let errorMessage = 'AI analysis failed';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorMessage = `Gemini API: ${errorJson.error.message}`;
          }
        } catch {
          // Use default message if parsing fails
        }
        
        return new Response(
          JSON.stringify({ error: errorMessage }), 
          { status: geminiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const geminiData = await geminiResponse.json();
      console.log('Gemini response received');

      const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from markdown code blocks if present
      let issuesText = generatedText.trim();
      if (issuesText.startsWith('```json')) {
        issuesText = issuesText.slice(7);
      } else if (issuesText.startsWith('```')) {
        issuesText = issuesText.slice(3);
      }
      if (issuesText.endsWith('```')) {
        issuesText = issuesText.slice(0, -3);
      }
      issuesText = issuesText.trim();

      try {
        issues = JSON.parse(issuesText);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('Raw response:', generatedText);
        return new Response(
          JSON.stringify({ error: 'AI returned invalid format' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Review completed: ${issues.length} issues found`);

    return new Response(
      JSON.stringify({ 
        prUrl: prUrl || 'manual-diff',
        owner,
        repo,
        prNumber: typeof prNumber === 'string' ? parseInt(prNumber) : prNumber,
        issues,
        reviewedAt: new Date().toISOString(),
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in review-pr function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
