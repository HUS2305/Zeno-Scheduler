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

    // Get ALL businesses to see what's available
    const allBusinesses = await prisma.business.findMany({
      select: { id: true, name: true, ownerId: true }
    });

    // Get ALL invitations to see which business they belong to
    const allInvitations = await prisma.teamInvitation.findMany({
      select: { id: true, email: true, name: true, businessId: true, createdAt: true, expiresAt: true }
    });

    // Get business by ownerId (old method)
    const businessByOwner = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true, name: true, ownerId: true }
    });

    return NextResponse.json({
      success: true,
      message: "Business mismatch debug",
      data: {
        currentTeamMember,
        teamMemberBusinessId: currentTeamMember.businessId,
        businessByOwner,
        allBusinesses,
        allInvitations,
        summary: {
          teamMemberBusinessId: currentTeamMember.businessId,
          ownerBusinessId: businessByOwner?.id,
          totalBusinesses: allBusinesses.length,
          totalInvitations: allInvitations.length,
          invitationsInTeamMemberBusiness: allInvitations.filter(inv => inv.businessId === currentTeamMember.businessId).length,
          invitationsInOwnerBusiness: businessByOwner ? allInvitations.filter(inv => inv.businessId === businessByOwner.id).length : 0
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Business mismatch debug failed:", error);
    return NextResponse.json({
      success: false,
      message: "Business mismatch debug failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


