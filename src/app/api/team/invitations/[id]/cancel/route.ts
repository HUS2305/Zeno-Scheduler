import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/nextauth";
import prisma from "@/lib/prisma";
import { PermissionAction } from "@prisma/client";
import { roleHasPermission } from "@/lib/permissions";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invitationId } = params;

    // Get the current user's team member context
    const currentTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!currentTeamMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 403 });
    }

    // Check permission to manage team members
    if (!roleHasPermission(currentTeamMember.role, PermissionAction.MANAGE_TEAM_MEMBERS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Get the invitation to be canceled
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { business: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if invitation is in the same business
    if (invitation.businessId !== currentTeamMember.businessId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if invitation has already been accepted
    if (invitation.acceptedAt) {
      return NextResponse.json({ error: "Cannot cancel accepted invitation" }, { status: 400 });
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Cannot cancel expired invitation" }, { status: 400 });
    }

    // Cancel the invitation
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        expiresAt: new Date(), // Set to past date to expire immediately
        canceledAt: new Date(),
        canceledBy: currentTeamMember.id,
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_INVITATION_CANCELED',
        entityType: 'TEAM_INVITATION',
        entityId: invitationId,
        userId: currentTeamMember.userId,
        businessId: currentTeamMember.businessId,
        details: {
          canceledInvitationId: invitationId,
          invitedEmail: invitation.email,
          invitedName: invitation.name,
          invitedRole: invitation.role,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling team invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






