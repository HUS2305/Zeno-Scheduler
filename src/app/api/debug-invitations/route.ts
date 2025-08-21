import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get all team invitations (simplified query)
    const invitations = await prisma.teamInvitation.findMany({
      include: {
        business: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all team members
    const teamMembers = await prisma.teamMember.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Invitation debug info",
      data: {
        invitations: invitations.map(inv => ({
          id: inv.id,
          email: inv.email,
          name: inv.name,
          role: inv.role,
          status: inv.acceptedAt ? 'ACCEPTED' : inv.expiresAt < new Date() ? 'EXPIRED' : 'PENDING',
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt,
          acceptedAt: inv.acceptedAt,
          businessName: inv.business.name
        })),
        teamMembers: teamMembers.map(member => ({
          id: member.id,
          email: member.user?.email || 'No email',
          name: member.user?.name || 'No name',
          role: member.role,
          status: member.status,
          businessName: member.business.name
        })),
        counts: {
          totalInvitations: invitations.length,
          pendingInvitations: invitations.filter(i => !i.acceptedAt && i.expiresAt > new Date()).length,
          acceptedInvitations: invitations.filter(i => i.acceptedAt).length,
          expiredInvitations: invitations.filter(i => !i.acceptedAt && i.expiresAt < new Date()).length,
          totalTeamMembers: teamMembers.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Invitation debug failed:", error);
    return NextResponse.json({
      success: false,
      message: "Invitation debug failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
