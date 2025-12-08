import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { instructionId } = await request.json();

    if (!instructionId) {
      return NextResponse.json(
        { error: "Instruction ID is required" },
        { status: 400 }
      );
    }

    // Increment download count
    await db.instruction.update({
      where: { id: instructionId },
      data: { downloads: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking download:", error);
    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    );
  }
}

