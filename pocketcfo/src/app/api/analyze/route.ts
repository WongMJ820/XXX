// ═══════════════════════════════════════════════════════════════
// PocketCFO — Decision Engine API Route (Server-side)
// POST /api/analyze
// Receives raw transaction text, calls Z.AI, writes to Firestore
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import zai from "@/lib/zai";
import { POCKETCFO_SYSTEM_PROMPT, CONTEXT_TEMPLATE } from "@/lib/prompts";
import type { PocketCFODecision } from "@/lib/types";
import { DEMO_COMPANY, DEMO_HEALTH } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawInput } = body as { rawInput: string };

    if (!rawInput || rawInput.trim().length === 0) {
      return NextResponse.json(
        { error: "No input provided" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ZAI_API_KEY) {
      return NextResponse.json(
        { error: "Z.AI API key not configured. Add ZAI_API_KEY to .env.local" },
        { status: 503 }
      );
    }

    console.log("[PocketCFO] Using API key prefix:", process.env.ZAI_API_KEY?.slice(0, 8) + "...");
    console.log("[PocketCFO] Using base URL:", process.env.ZAI_BASE_URL);

    // Build company context from Firestore (demo mode uses mock data)
    const companyContext = JSON.stringify(
      {
        company: DEMO_COMPANY,
        health: DEMO_HEALTH,
      },
      null,
      2
    );

    const userMessage = CONTEXT_TEMPLATE(companyContext, rawInput);

    console.log("[PocketCFO] Calling Z.AI with input:", rawInput.substring(0, 50) + "...");

    // Call Z.AI GLM-5
    const completion = await zai.chat.completions.create({
      model: "glm-5",
      messages: [
        { role: "system", content: POCKETCFO_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseContent = completion.choices[0]?.message?.content;
    console.log("[PocketCFO] Z.AI Response received:", responseContent);

    if (!responseContent) {
      return NextResponse.json(
        { error: "Empty response from AI engine" },
        { status: 502 }
      );
    }

    try {
      const aiDecision: PocketCFODecision = JSON.parse(responseContent);

      return NextResponse.json({
        success: true,
        decision: aiDecision,
        timestamp: new Date().toISOString(),
      });
    } catch (parseError) {
      console.error("[PocketCFO] JSON Parse Error:", parseError, "Content:", responseContent);
      return NextResponse.json(
        { error: "AI returned invalid JSON format" },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("[PocketCFO] Decision Engine Error:", error);
    
    // Check for specific API errors
    const status = error?.status || 500;
    const message = error?.message || "Unknown error occurred";

    return NextResponse.json(
      { error: `Decision engine failed (${status}): ${message}` },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}