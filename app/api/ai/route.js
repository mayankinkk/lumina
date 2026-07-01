import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text, action } = await request.json();

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

    const prompt = prompts[action] || prompts.explain;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("AI API error:", error);
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
