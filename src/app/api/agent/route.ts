import { NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface Message {
  sender: "agent" | "candidate";
  text: string;
}

// Helper to call Gemini API
async function callGemini(prompt: string, apiKey: string, responseSchema?: object) {
  const url = `${GEMINI_API_URL}?key=${apiKey}`;
  
  const payload: any = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  if (responseSchema) {
    payload.generationConfig.responseMimeType = "application/json";
    payload.generationConfig.responseSchema = responseSchema;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API returned error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textOutput) {
      throw new Error("No response content from Gemini API");
    }

    return textOutput;
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Retrieve API key from request headers or environment variables
    const apiKey = 
      req.headers.get("x-gemini-key") || 
      process.env.GEMINI_API_KEY || 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is required. Please provide it in the headers or set GEMINI_API_KEY env variable." },
        { status: 400 }
      );
    }

    const body = await req.json();

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
`;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          agentName: { type: "STRING" },
          agentTitle: { type: "STRING" },
          personaDescription: { type: "STRING" },
          pitchAngle: { type: "STRING" },
          systemGuidelines: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          outreachSequence: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                step: { type: "INTEGER" },
                subject: { type: "STRING" },
                message: { type: "STRING" }
              },
              required: ["step", "message"]
            }
          }
        },
        required: ["agentName", "agentTitle", "personaDescription", "pitchAngle", "systemGuidelines", "outreachSequence"]
      };

      const result = await callGemini(initPrompt, apiKey, responseSchema);
      return NextResponse.json(JSON.parse(result));

    } else if (action === "chat") {
      const { companyContext, agentPersona, conversationHistory, candidateReply } = body;

      if (!agentPersona || !candidateReply) {
        return NextResponse.json(
          { error: "Agent persona and candidate reply are required." },
          { status: 400 }
        );
      }

      // Format conversation history
      const formattedHistory = (conversationHistory || []).map((msg: Message) => {
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
`;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          analysis: {
            type: "OBJECT",
            properties: {
              sentiment: { type: "STRING" },
              intent: { type: "STRING" },
              keyObjections: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["sentiment", "intent", "keyObjections"]
          },
          strategy: { type: "STRING" },
          initialDraft: { type: "STRING" },
          selfReview: {
            type: "OBJECT",
            properties: {
              concisenessCheck: { type: "STRING" },
              toneCheck: { type: "STRING" },
              accuracyCheck: { type: "STRING" },
              passed: { type: "BOOLEAN" }
            },
            required: ["concisenessCheck", "toneCheck", "accuracyCheck", "passed"]
          },
          refinement: { type: "STRING" },
          finalMessage: { type: "STRING" }
        },
        required: ["analysis", "strategy", "initialDraft", "selfReview", "refinement", "finalMessage"]
      };

      const result = await callGemini(chatPrompt, apiKey, responseSchema);
      return NextResponse.json(JSON.parse(result));

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
