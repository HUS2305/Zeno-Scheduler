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

    // Step 1: Get current user's team member info (exactly like team page)
    const currentTeamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      select: { businessId: true, id: true, name: true, email: true, role: true, status: true, userId: true, joinedAt: true, createdAt: true }
    });

    if (!currentTeamMember) {
      return NextResponse.json({ error: "No team member found" });
    }

    // Step 2: Get business data using the team member's businessId (exactly like team page)
    const business = await prisma.business.findFirst({
      where: { id: currentTeamMember.businessId },
      include: {
        teamMembers: {
          include: {
            permissions: true,
          },
          orderBy: [
            { role: 'asc' },
            { createdAt: 'asc' },
          ],
        },
        teamInvitations: {
          where: {
            acceptedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "No business found" });
    }

    // Step 3: Let's also test the raw invitation query to see what's happening
    const rawInvitations = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Step 4: Let's test without the expiresAt filter
    const allInvitationsForBusiness = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: "Team page query debug",
      data: {
        currentTeamMember,
        business: {
          id: business.id,
          name: business.name,
          teamMembersCount: business.teamMembers.length,
          teamInvitationsCount: business.teamInvitations.length,
          teamInvitations: business.teamInvitations.map(inv => ({
            id: inv.id,
            email: inv.email,
            name: inv.name,
            role: inv.role,
            createdAt: inv.createdAt,
            expiresAt: inv.expiresAt
          }))
        },
        rawInvitations: {
          count: rawInvitations.length,
          invitations: rawInvitations.map(inv => ({
            id: inv.id,
            email: inv.email,
            name: inv.name,
            role: inv.role,
            createdAt: inv.createdAt,
            expiresAt: inv.expiresAt
          }))
        },
        allInvitationsForBusiness: {
          count: allInvitationsForBusiness.length,
          invitations: allInvitationsForBusiness.map(inv => ({
            id: inv.id,
            email: inv.email,
            name: inv.name,
            role: inv.role,
            createdAt: inv.createdAt,
            expiresAt: inv.expiresAt
          }))
        },
        currentTime: new Date().toISOString(),
        queryFilters: {
          businessId: currentTeamMember.businessId,
          acceptedAt: null,
          expiresAt: `> ${new Date().toISOString()}`
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Team page query debug failed:", error);
    return NextResponse.json({
      success: false,
      message: "Team page query debug failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}



