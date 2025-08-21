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

    // Get ALL invitations in the database (no filters)
    const allInvitations = await prisma.teamInvitation.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        businessId: true,
        acceptedAt: true,
        expiresAt: true,
        createdAt: true
      }
    });

    // Get invitations for the current business (no filters)
    const businessInvitations = await prisma.teamInvitation.findMany({
      where: { businessId: currentTeamMember.businessId },
      select: {
        id: true,
        email: true,
        name: true,
        businessId: true,
        acceptedAt: true,
        expiresAt: true,
        createdAt: true
      }
    });

    // Test the exact query from the team page
    const teamPageQuery = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Test with a hardcoded business ID from debug-invitations
    const hardcodedQuery = await prisma.teamInvitation.findMany({
      where: {
        businessId: "6887e529375836ca77827faf", // From your debug data
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: "Real issue debug",
      data: {
        currentTeamMember,
        currentTime: new Date().toISOString(),
        businessIdFromTeamMember: currentTeamMember.businessId,
        businessIdFromDebug: "6887e529375836ca77827faf",
        businessIdsMatch: currentTeamMember.businessId === "6887e529375836ca77827faf",
        
        // Raw counts
        allInvitationsCount: allInvitations.length,
        businessInvitationsCount: businessInvitations.length,
        teamPageQueryCount: teamPageQuery.length,
        hardcodedQueryCount: hardcodedQuery.length,
        
        // Sample data
        allInvitations: allInvitations.slice(0, 3),
        businessInvitations: businessInvitations.slice(0, 3),
        teamPageQuery: teamPageQuery.slice(0, 3),
        hardcodedQuery: hardcodedQuery.slice(0, 3),
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Real issue debug failed:", error);
    return NextResponse.json({
      success: false,
      message: "Real issue debug failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


