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

    // Get business data (same as team page)
    const business = await prisma.business.findFirst({
      where: { id: currentTeamMember.businessId },
      include: {
        teamMembers: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "No business found" });
    }

    // Get team invitations separately (the fix)
    const teamInvitations = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Create the final business object with invitations
    const businessWithInvitations = {
      ...business,
      teamInvitations: teamInvitations
    };

    return NextResponse.json({
      success: true,
      message: "Simple fix test",
      data: {
        currentTeamMember,
        business: businessWithInvitations,
        invitationCount: teamInvitations.length,
        invitations: teamInvitations.map(inv => ({
          id: inv.id,
          email: inv.email,
          name: inv.name,
          role: inv.role,
          createdAt: inv.createdAt
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Simple fix test failed:", error);
    return NextResponse.json({
      success: false,
      message: "Simple fix test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}





