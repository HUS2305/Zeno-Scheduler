import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/nextauth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No session" });
    }

    // Get current user's team member info
    const currentTeamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      select: { businessId: true, id: true, name: true, email: true, role: true, status: true }
    });

    if (!currentTeamMember) {
      return NextResponse.json({ error: "No team member found" });
    }

    const now = new Date();
    const nowISO = now.toISOString();
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of day

    // Test different date comparison approaches
    const test1 = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: { gt: now },
      },
    });

    const test2 = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: { gt: nowISO },
      },
    });

    const test3 = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: { gt: nowDate },
      },
    });

    const test4 = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        // No date filter
      },
    });

    const test5 = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: { gte: now },
      },
    });

    // Get a sample invitation to see its exact date format
    const sampleInvitation = await prisma.teamInvitation.findFirst({
      where: { businessId: currentTeamMember.businessId },
      select: { id: true, email: true, expiresAt: true, createdAt: true }
    });

    return NextResponse.json({
      success: true,
      message: "Date issue debug",
      data: {
        currentTeamMember,
        currentTime: {
          now: now.toISOString(),
          nowISO: nowISO,
          nowDate: nowDate.toISOString(),
          nowTimestamp: now.getTime(),
        },
        
        // Test results
        test1_count: test1.length, // gt: now
        test2_count: test2.length, // gt: nowISO
        test3_count: test3.length, // gt: nowDate
        test4_count: test4.length, // no date filter
        test5_count: test5.length, // gte: now
        
        // Sample invitation
        sampleInvitation: sampleInvitation ? {
          id: sampleInvitation.id,
          email: sampleInvitation.email,
          expiresAt: sampleInvitation.expiresAt?.toISOString(),
          createdAt: sampleInvitation.createdAt?.toISOString(),
          expiresAtTimestamp: sampleInvitation.expiresAt?.getTime(),
          nowTimestamp: now.getTime(),
          isExpired: sampleInvitation.expiresAt ? sampleInvitation.expiresAt < now : null,
        } : null,
        
        // Raw query test
        rawQuery: {
          businessId: currentTeamMember.businessId,
          acceptedAt: null,
          expiresAt: { gt: now },
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Date issue debug failed:", error);
    return NextResponse.json({
      success: false,
      message: "Date issue debug failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}





