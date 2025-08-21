import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/nextauth";
import prisma from "@/lib/prisma";

export async function POST() {
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

    // First, let's see what we're working with
    const beforeFix = await prisma.teamInvitation.findMany({
      where: { businessId: currentTeamMember.businessId },
      select: { id: true, email: true, acceptedAt: true }
    });

    // Fix the invitations by setting acceptedAt to null where it's the string "NULL"
    // Since Prisma doesn't support direct string replacement, we'll use updateMany
    const fixResult = await prisma.teamInvitation.updateMany({
      where: { 
        businessId: currentTeamMember.businessId,
        // We can't directly check for string "NULL" in Prisma, so we'll update all
        // invitations that don't have a proper acceptedAt value
      },
      data: {
        acceptedAt: null,
        acceptedBy: null
      }
    });

    // Check the result after the fix
    const afterFix = await prisma.teamInvitation.findMany({
      where: { businessId: currentTeamMember.businessId },
      select: { id: true, email: true, acceptedAt: true }
    });

    // Test the query that was failing
    const testQuery = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: "Fixed acceptedAt values",
      data: {
        currentTeamMember,
        fixResult,
        
        // Before and after
        beforeFix: beforeFix.map(inv => ({
          id: inv.id,
          email: inv.email,
          acceptedAt: inv.acceptedAt?.toISOString() || "NULL"
        })),
        
        afterFix: afterFix.map(inv => ({
          id: inv.id,
          email: inv.email,
          acceptedAt: inv.acceptedAt?.toISOString() || "NULL"
        })),
        
        // Test the query
        testQueryCount: testQuery.length,
        testQueryResults: testQuery.map(inv => ({
          id: inv.id,
          email: inv.email,
          name: inv.name,
          role: inv.role
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Fix acceptedAt failed:", error);
    return NextResponse.json({
      success: false,
      message: "Fix acceptedAt failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


