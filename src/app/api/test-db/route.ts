import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test basic connection
    await prisma.$connect();
    
    // Test a simple query
    const userCount = await prisma.user.count();
    
    // Test business query
    const businessCount = await prisma.business.count();
    
    // Test team member query
    const teamMemberCount = await prisma.teamMember.count();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        userCount,
        businessCount,
        teamMemberCount,
        connectionStatus: "Connected",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}



