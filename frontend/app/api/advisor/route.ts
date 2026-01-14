import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const systemPrompt = `You are SiliconSage, an expert AI PC building advisor. Provide helpful, concise advice about PC builds.

**Your Style:**
- Friendly and professional
- Focus on value and performance
- Give direct, actionable advice
- Keep responses concise (2-3 short paragraphs max)

**IMPORTANT - Formatting Rules:**
- Do NOT use markdown headers (no #, ##, ###)
- Do NOT use bullet points with asterisks
- Write in natural flowing paragraphs
- You can use **bold** for emphasis on key points
- Keep responses SHORT and easy to read

**Your Knowledge:**
- GPUs: RTX 40-series vs RX 7000-series tradeoffs
- CPUs: Ryzen vs Intel current generation
- RAM: DDR5 sweet spots for different platforms
- PSU: Never cheap out on power supply

Example good response format:
"That's a solid CPU choice! The Ryzen 7 5800X3D offers excellent gaming performance thanks to its 3D V-Cache technology.

**Value tip:** At current prices, it's one of the best gaming CPUs per dollar. Just make sure your motherboard has the latest BIOS update."`;


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
