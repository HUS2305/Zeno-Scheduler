import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/nextauth';
import prisma from '@/lib/prisma';
import { updateTeamMember, removeTeamMember } from '@/lib/team-management';
import { canManageTeamMembers, canManageRole } from '@/lib/permissions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamMemberId = params.id;
    const body = await request.json();
    const { role, status, name, phone } = body;

    // Get current user's team member info
    const currentTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        business: true,
      },
    });

    if (!currentTeamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 403 });
    }

    // Check if user has permission to manage team members
    if (!canManageTeamMembers(currentTeamMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to manage team members' }, { status: 403 });
    }

    // Get target team member
    const targetTeamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      include: {
        business: true,
      },
    });

    if (!targetTeamMember) {
      return NextResponse.json({ error: 'Target team member not found' }, { status: 404 });
    }

    // Check if target member is in the same business
    if (targetTeamMember.businessId !== currentTeamMember.businessId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if user can manage this specific team member
    if (!canManageRole(currentTeamMember.role, targetTeamMember.role)) {
      return NextResponse.json({ error: 'Cannot manage team member with higher or equal role' }, { status: 403 });
    }

    // Update team member
    const updateResult = await updateTeamMember(
      teamMemberId,
      { role, status, name, phone },
      session.user.id
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error || 'Failed to update team member' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      teamMember: updateResult.teamMember,
      message: 'Team member updated successfully',
    });

  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamMemberId = params.id;

    // Get current user's team member info
    const currentTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        business: true,
      },
    });

    if (!currentTeamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 403 });
    }

    // Check if user has permission to manage team members
    if (!canManageTeamMembers(currentTeamMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to manage team members' }, { status: 403 });
    }

    // Get target team member
    const targetTeamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      include: {
        business: true,
      },
    });

    if (!targetTeamMember) {
      return NextResponse.json({ error: 'Target team member not found' }, { status: 404 });
    }

    // Check if target member is in the same business
    if (targetTeamMember.businessId !== currentTeamMember.businessId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if user can manage this specific team member
    if (!canManageRole(currentTeamMember.role, targetTeamMember.role)) {
      return NextResponse.json({ error: 'Cannot manage team member with higher or equal role' }, { status: 403 });
    }

    // Prevent removing yourself
    if (targetTeamMember.userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself from the team' }, { status: 400 });
    }

    // Remove team member
    const removeResult = await removeTeamMember(teamMemberId, session.user.id);

    if (!removeResult.success) {
      return NextResponse.json(
        { error: removeResult.error || 'Failed to remove team member' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
    });

  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
