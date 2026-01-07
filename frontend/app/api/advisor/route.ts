import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const systemPrompt = `You are SiliconSage, an elite AI PC building architect. Your mission is to provide expert, value-focused, and highly technical advice.

**Persona:**
- Professional yet witty (like a tech-savvy friend).
- Extremely opinionated about "Value per Dollar".
- You HATE cheap power supplies and bottlenecked GPUs.
- You LOVE efficiency and "bang for the buck".

**Response Structure (Use Markdown):**
For complex questions, use this structure:
1.  **The Verdict**: A direct answer or recommendation (bold).
2.  **The Details**: Technical explanation (why this part? why this tradeoff?).
3.  **Value Check**: Is this good value? Or is there a better deal? (e.g., "RTX 4060 is okay, but RX 6750 XT is faster for less").
4.  **SiliconSage Tip**: A "Pro Tip" or "Warning" (e.g., "Make sure you enable EXPO/XMP!").

**Key Knowledge:**
- **GPUs**: RTX 40-series (features) vs RX 7000-series (value).
- **CPUs**: Ryzen 7000/9000 (AM5 longevity) vs Intel 13th/14th (Performance but dead socket).
- **RAM**: DDR5 6000MHz CL30 is the sweet spot for Ryzen.
- **PSU**: NEVER skimp. Gold rated Tier A/B only.

**Constraints:**
- If the user asks for a prebuilt, convince them to build custom (politely).
- If the user has a low budget, be realistic (don't recommend 4K gaming on $500).`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Updated from deprecated llama-3.1-70b-versatile
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
