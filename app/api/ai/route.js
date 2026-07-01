import { NextResponse } from "next/server";

const MAX_TEXT_LENGTH = 5000;
const VALID_ACTIONS = ["explain", "explain_simple", "summarize", "translate", "examples"];

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body || typeof body.text !== "string" || typeof body.action !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { text, action } = body;

    if (text.length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured. Add AI_API_KEY to .env.local" },
        { status: 503 }
      );
    }

    const prompts = {
      explain: `Explain the following text simply and clearly:\n\n"${text}"`,
      explain_simple: `Explain the following text like I'm 12 years old:\n\n"${text}"`,
      summarize: `Summarize the following text in 2-3 sentences:\n\n"${text}"`,
      translate: `Translate the following text to English (or to the language detected if already English). Provide the translation:\n\n"${text}"`,
      examples: `Generate 3 practical real-world examples related to this concept:\n\n"${text}"`,
    };

    const prompt = prompts[action];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
