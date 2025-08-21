import { NextResponse } from "next/server";
import { sendTeamInvitation } from "@/lib/email-service";

export async function GET() {
  try {
    // Test email service with the user's verified email
    const testResult = await sendTeamInvitation({
      to: "hussainaljarrah45@gmail.com", // Use verified email
      name: "Test User",
      businessName: "TEST Business",
      role: "STANDARD",
      token: "test-token-123",
      message: "This is a test invitation to verify email service",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return NextResponse.json({
      success: true,
      message: "Email test completed",
      result: testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Email test failed:", error);
    return NextResponse.json({
      success: false,
      message: "Email test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

