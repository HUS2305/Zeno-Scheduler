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

    // Get ALL invitations for the business with acceptedAt details
    const allInvitations = await prisma.teamInvitation.findMany({
      where: { businessId: currentTeamMember.businessId },
      select: {
        id: true,
        email: true,
        name: true,
        acceptedAt: true,
        expiresAt: true,
        createdAt: true,
        acceptedBy: true
      }
    });

    // Group invitations by acceptedAt status
    const acceptedInvitations = allInvitations.filter(inv => inv.acceptedAt !== null);
    const pendingInvitations = allInvitations.filter(inv => inv.acceptedAt === null);

    return NextResponse.json({
      success: true,
      message: "AcceptedAt debug",
      data: {
        currentTeamMember,
        currentTime: new Date().toISOString(),
        
        // Summary
        totalInvitations: allInvitations.length,
        acceptedInvitations: acceptedInvitations.length,
        pendingInvitations: pendingInvitations.length,
        
        // Sample data
        sampleAccepted: acceptedInvitations.slice(0, 3).map(inv => ({
          id: inv.id,
          email: inv.email,
          name: inv.name,
          acceptedAt: inv.acceptedAt?.toISOString(),
          acceptedBy: inv.acceptedBy
        })),
        
        samplePending: pendingInvitations.slice(0, 3).map(inv => ({
          id: inv.id,
          email: inv.email,
          name: inv.name,
          acceptedAt: inv.acceptedAt,
          expiresAt: inv.expiresAt?.toISOString()
        })),
        
        // All invitations with acceptedAt values
        allInvitationsWithAcceptedAt: allInvitations.map(inv => ({
          id: inv.id,
          email: inv.email,
          name: inv.name,
          acceptedAt: inv.acceptedAt?.toISOString() || "NULL",
          acceptedBy: inv.acceptedBy || "NULL",
          expiresAt: inv.expiresAt?.toISOString(),
          createdAt: inv.createdAt?.toISOString()
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("AcceptedAt debug failed:", error);
    return NextResponse.json({
      success: false,
      message: "AcceptedAt debug failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


