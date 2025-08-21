import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/nextauth";
import prisma from "@/lib/prisma";
import { PermissionAction, TeamMemberRole } from "@prisma/client";
import { roleHasPermission, canManageRole } from "@/lib/permissions";

// PUT - Update team member role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: memberId } = params;
    const { role } = await request.json();

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

    // Get the team member to be updated
    const targetMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { business: true },
    });

    if (!targetMember) {
      return NextResponse.json({ error: "Target team member not found" }, { status: 404 });
    }

    // Check if target member is in the same business
    if (targetMember.businessId !== currentTeamMember.businessId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if user is trying to modify themselves
    if (targetMember.id === currentTeamMember.id) {
      return NextResponse.json({ error: "Cannot modify your own role" }, { status: 400 });
    }

    // Check if user can assign this role
    if (!canManageRole(currentTeamMember.role, role)) {
      return NextResponse.json({ error: "Cannot assign this role" }, { status: 400 });
    }

    // Check if user is trying to promote someone above their own level
    if (role === TeamMemberRole.OWNER && currentTeamMember.role !== TeamMemberRole.OWNER) {
      return NextResponse.json({ error: "Only owners can assign owner role" }, { status: 400 });
    }

    // Update the team member's role
    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_MEMBER_ROLE_UPDATED',
        entityType: 'TEAM_MEMBER',
        entityId: memberId,
        userId: currentTeamMember.userId,
        businessId: currentTeamMember.businessId,
        details: {
          previousRole: targetMember.role,
          newRole: role,
          updatedMemberId: memberId,
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating team member role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: memberId } = params;

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

    // Get the team member to be removed
    const targetMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { business: true },
    });

    if (!targetMember) {
      return NextResponse.json({ error: "Target team member not found" }, { status: 404 });
    }

    // Check if target member is in the same business
    if (targetMember.businessId !== currentTeamMember.businessId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if user is trying to remove themselves
    if (targetMember.id === currentTeamMember.id) {
      return NextResponse.json({ error: "Cannot remove yourself from the team" }, { status: 400 });
    }

    // Check if user can remove this team member
    if (!canManageRole(currentTeamMember.role, targetMember.role)) {
      return NextResponse.json({ error: "Cannot remove this team member" }, { status: 400 });
    }

    // Check if trying to remove an owner
    if (targetMember.role === TeamMemberRole.OWNER) {
      return NextResponse.json({ error: "Cannot remove an owner" }, { status: 400 });
    }

    // Remove the team member
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_MEMBER_REMOVED',
        entityType: 'TEAM_MEMBER',
        entityId: memberId,
        userId: currentTeamMember.userId,
        businessId: currentTeamMember.businessId,
        details: {
          removedMemberId: memberId,
          removedMemberRole: targetMember.role,
          removedMemberName: targetMember.name,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
