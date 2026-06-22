import { NextResponse } from "next/server";

// Clean JSON helper to strip markdown blocks if returned by LLM
function cleanJSONString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

interface LLMConfig {
  provider: "gemini" | "openai" | "anthropic";
  key: string;
  model?: string;
}

// Unified LLM Caller supporting multiple providers
async function callLLM(prompt: string, config: LLMConfig, responseSchema?: object) {
  const { provider, key, model } = config;

  if (provider === "gemini") {
    const modelName = model || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
    
    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    };

    if (responseSchema) {
      payload.generationConfig.responseMimeType = "application/json";
      payload.generationConfig.responseSchema = responseSchema;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) throw new Error("Empty response from Gemini API");
    return cleanJSONString(textOutput);

  } else if (provider === "openai") {
    const modelName = model || "gpt-4o-mini";
    const url = "https://api.openai.com/v1/chat/completions";

    const payload: any = {
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
    };

    if (responseSchema) {
      payload.response_format = { type: "json_object" };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const textOutput = data.choices?.[0]?.message?.content;
    if (!textOutput) throw new Error("Empty response from OpenAI API");
    return cleanJSONString(textOutput);

  } else if (provider === "anthropic") {
    const modelName = model || "claude-3-5-sonnet-20241022";
    const url = "https://api.anthropic.com/v1/messages";

    // System prompt addition for Claude to enforce strict JSON
    const systemPrompt = responseSchema 
      ? "Respond ONLY with a valid JSON object matching the requested schema. Do not enclose the output in markdown code blocks or add any explanations. Begin your response with '{' and end with '}'."
      : "You are a helpful recruitment agent assistant.";

    const payload = {
      model: modelName,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      system: systemPrompt,
      temperature: 0.7,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const textOutput = data.content?.[0]?.text;
    if (!textOutput) throw new Error("Empty response from Anthropic API");
    return cleanJSONString(textOutput);

  } else {
    throw new Error(`Unsupported API provider: ${provider}`);
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const body = await req.json();

    // Resolve API configuration from body or server environment variables
    const clientConfig = body.apiConfig || {};
    const provider = clientConfig.provider || "gemini";
    let key = clientConfig.key || "";
    const model = clientConfig.model || "";

    // Fallback to server env variables if key is not supplied by client
    if (!key) {
      if (provider === "gemini") {
        key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      } else if (provider === "openai") {
        key = process.env.OPENAI_API_KEY || "";
      } else if (provider === "anthropic") {
        key = process.env.ANTHROPIC_API_KEY || "";
      }
    }

    if (!key) {
      return NextResponse.json(
        { error: `API Key for provider '${provider}' is required. Please set it in the config popup or as an environment variable.` },
        { status: 400 }
      );
    }

    const config: LLMConfig = { provider, key, model };

    if (action === "init") {
      const { companyName, companyCulture, profilesHired, tone, outboundIntent } = body;

      if (!companyName || !outboundIntent) {
        return NextResponse.json(
          { error: "Company name and outbound campaign intent are required." },
          { status: 400 }
        );
      }

      const initPrompt = `
You are an expert recruitment strategist. Generate a customized recruiter agent persona and a 3-step candidate outreach sequence based on the company's context and hiring intent.

Company Context:
- Name: ${companyName}
- Culture/Vibe: ${companyCulture || "Professional and innovative"}
- Profiles they hire: ${profilesHired || "General technical roles"}
- Communication Tone: ${tone || "Balanced"}
- Campaign Goal / Outbound Intent: ${outboundIntent}

Task:
1. Synthesize a Recruiter Persona that represents the company authentically. Create a recruiter name, title, brief background, and tone guidelines.
2. Outline a 3-step outreach sequence tailored to this candidate persona.
   - Message 1 (Outreach): Highly personalized pitch, referencing the role and company culture. Keep it short.
   - Message 2 (Follow-up): Send 3 days later, sharing high-value context (e.g. funding news, a technical blog post, or team culture point).
   - Message 3 (Final Check): Send 7 days later, a brief no-pressure message to close the loop.

Output a JSON object matching this schema:
{
  "agentName": "A recruiter name",
  "agentTitle": "A recruitment-related job title at the company",
  "personaDescription": "Description of their personality, style, and approach",
  "pitchAngle": "What is the key selling point of this company for this campaign?",
  "systemGuidelines": [
    "Tone rule 1",
    "Tone rule 2",
    "Outreach rule 3"
  ],
  "outreachSequence": [
    {
      "step": 1,
      "subject": "Email subject line (if email is used)",
      "message": "The complete message text"
    },
    {
      "step": 2,
      "message": "The complete message text"
    },
    {
      "step": 3,
      "message": "The complete message text"
    }
  ]
}

CRITICAL FORMATTING GUIDELINE:
You must output ONLY a valid JSON object matching the schema.
Ensure all string values are correctly escaped. Any internal double quotes within the strings must be strictly escaped (e.g. using \\" or using single quotes instead).
Do not include any literal newlines inside string values (use \\n for newlines).
Do not add any explanations or markdown wrapping blocks.
`;

      const responseSchema = {
        type: "object",
        properties: {
          agentName: { type: "string" },
          agentTitle: { type: "string" },
          personaDescription: { type: "string" },
          pitchAngle: { type: "string" },
          systemGuidelines: {
            type: "array",
            items: { type: "string" }
          },
          outreachSequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "integer" },
                subject: { type: "string" },
                message: { type: "string" }
              },
              required: ["step", "message"]
            }
          }
        },
        required: ["agentName", "agentTitle", "personaDescription", "pitchAngle", "systemGuidelines", "outreachSequence"]
      };

      const result = await callLLM(initPrompt, config, responseSchema);
      try {
        return NextResponse.json(JSON.parse(result));
      } catch (err: any) {
        console.error("JSON parsing failed in init action. Raw response:", result);
        return NextResponse.json(
          { error: `Failed to parse LLM JSON response: ${err.message}. Raw output was: ${result}` },
          { status: 500 }
        );
      }

    } else if (action === "chat") {
      const { companyContext, agentPersona, conversationHistory, candidateReply } = body;

      if (!agentPersona || !candidateReply) {
        return NextResponse.json(
          { error: "Agent persona and candidate reply are required." },
          { status: 400 }
        );
      }

      // Format conversation history
      const formattedHistory = (conversationHistory || []).map((msg: any) => {
        const speaker = msg.sender === "agent" ? `${agentPersona.agentName} (${agentPersona.agentTitle})` : "Candidate";
        return `${speaker}: "${msg.text}"`;
      }).join("\n");

      const chatPrompt = `
You are the recruiting agent defined below:
Name: ${agentPersona.agentName}
Title: ${agentPersona.agentTitle}
Persona: ${agentPersona.personaDescription}
Pitch Angle: ${agentPersona.pitchAngle}
Guidelines:
${(agentPersona.systemGuidelines || []).map((g: string) => `- ${g}`).join("\n")}

Company Context:
- Name: ${companyContext.companyName}
- Culture: ${companyContext.companyCulture}
- Tone: ${companyContext.tone}

Conversation History so far:
${formattedHistory}

Candidate's Latest Reply:
"${candidateReply}"

Your task is to execute your reasoning loop and formulate your next response to the candidate.
Complete these steps internally and output them in the JSON schema:
1. Analysis: Analyze the candidate's sentiment, identify their core intent (e.g. interested, objecting to hybrid work, passive, asking about money), and list any objections.
2. Strategy: Formulate a tactical approach for this reply (e.g., address the objection with a specific cultural point, offer flexibility, suggest a call).
3. Initial Draft: Draft the response following your persona, guidelines, and company context.
4. Self-Review: Evaluate the initial draft against constraints (Conciseness, Tone match, Accuracy). Decide if it passes.
5. Refinement: If it didn't pass, rewrite it. Otherwise, explain why it passed.
6. Final Message: The finalized output message to send to the candidate. Keep it natural, warm, direct, and conversational. Do not include signature blocks or subject lines; write just the text of the message.

Output a JSON object matching this schema:
{
  "analysis": {
    "sentiment": "Positive / Negative / Neutral / Skeptical",
    "intent": "Brief description of the candidate's underlying intent",
    "keyObjections": ["list of objections, or empty"]
  },
  "strategy": "Your reasoning about how to handle the reply",
  "initialDraft": "The draft message",
  "selfReview": {
    "concisenessCheck": "Review comment about length/conciseness",
    "toneCheck": "Review comment about whether it matches the recruiter persona",
    "accuracyCheck": "Review comment verifying no false claims about the company/role",
    "passed": true_or_false
  },
  "refinement": "Refined message if needed, or explanation of why draft is good",
  "finalMessage": "The message to send to the candidate"
}

CRITICAL FORMATTING GUIDELINE:
You must output ONLY a valid JSON object matching the schema.
Ensure all string values are correctly escaped. Any internal double quotes within the strings must be strictly escaped (e.g. using \\" or using single quotes instead).
Do not include any literal newlines inside string values (use \\n for newlines).
Do not add any explanations or markdown wrapping blocks.
`;

      const responseSchema = {
        type: "object",
        properties: {
          analysis: {
            type: "object",
            properties: {
              sentiment: { type: "string" },
              intent: { type: "string" },
              keyObjections: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["sentiment", "intent", "keyObjections"]
          },
          strategy: { type: "string" },
          initialDraft: { type: "string" },
          selfReview: {
            type: "object",
            properties: {
              concisenessCheck: { type: "string" },
              toneCheck: { type: "string" },
              accuracyCheck: { type: "string" },
              passed: { type: "boolean" }
            },
            required: ["concisenessCheck", "toneCheck", "accuracyCheck", "passed"]
          },
          refinement: { type: "string" },
          finalMessage: { type: "string" }
        },
        required: ["analysis", "strategy", "initialDraft", "selfReview", "refinement", "finalMessage"]
      };

      const result = await callLLM(chatPrompt, config, responseSchema);
      try {
        return NextResponse.json(JSON.parse(result));
      } catch (err: any) {
        console.error("JSON parsing failed in chat action. Raw response:", result);
        return NextResponse.json(
          { error: `Failed to parse LLM JSON response: ${err.message}. Raw output was: ${result}` },
          { status: 500 }
        );
      }

    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Agent Handler error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during processing." },
      { status: 500 }
    );
  }
}
