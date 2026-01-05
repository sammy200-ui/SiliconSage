import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const systemPrompt = `You are SiliconSage, an expert AI PC building advisor. Your role is to help users build the perfect PC by providing:

1. **Part Recommendations**: Suggest specific CPU, GPU, RAM, motherboard, and other components based on budget and needs.
2. **Compatibility Advice**: Warn about socket mismatches, RAM type issues, and PSU wattage requirements.
3. **Performance Predictions**: Estimate FPS in popular games at different resolutions.
4. **Value Analysis**: Compare custom PC builds vs consoles (PS5, Xbox) vs gaming laptops.

Guidelines:
- Be concise but thorough
- Use current (2024-2025) part prices and performance data
- Always consider budget constraints
- Be honest if a console might be better value
- Format responses with markdown for readability
- Include specific part names and estimated prices
- Mention potential bottlenecks or compatibility issues

Current market context:
- DDR5 is standard for new builds (AM5, LGA1700)
- RTX 40 series and RX 7000 series are current gen
- Ryzen 7000 and Intel 13th/14th gen are current
- PS5 and Xbox Series X are the main console competitors at $499`;

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
