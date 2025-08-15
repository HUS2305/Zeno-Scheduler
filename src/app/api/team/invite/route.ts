import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/nextauth';
import prisma from '@/lib/prisma';
import { createTeamMemberInvitation } from '@/lib/team-management';
import { sendTeamInvitationEmail } from '@/lib/email-service';
import { canInviteTeamMembers } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  try {
    console.log('Team invitation API called');
    
    // Get session
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { name, email, phone, role, message, businessId } = body;

    // Validate required fields
    if (!name || !email || !role || !businessId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, role, businessId' },
        { status: 400 }
      );
    }

    // Check if user has permission to invite team members
    const currentTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        businessId: businessId,
        status: 'ACTIVE',
      },
    });

    console.log('Current team member:', currentTeamMember);
    console.log('Can invite team members:', currentTeamMember ? canInviteTeamMembers(currentTeamMember.role) : 'No team member found');

    if (!currentTeamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 403 });
    }

    if (!canInviteTeamMembers(currentTeamMember.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to invite team members' }, { status: 403 });
    }

    // Check if business exists and user has access
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        teamMembers: {
          some: {
            userId: session.user.id,
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 403 });
    }

    // Create team member invitation
    const invitationResult = await createTeamMemberInvitation({
      name,
      email,
      phone,
      role,
      businessId,
      invitedBy: session.user.id,
      message,
    });

    if (!invitationResult.success) {
      return NextResponse.json(
        { error: invitationResult.error || 'Failed to create invitation' },
        { status: 400 }
      );
    }

    // Send invitation email
    const emailResult = await sendTeamInvitationEmail({
      to: email,
      name,
      businessName: business.name,
      role,
      invitationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/team/join?token=${invitationResult.invitation.token}`,
      invitedBy: session.user.name || session.user.email || 'Team Member',
      message,
    });

    if (!emailResult.success) {
      console.warn('Failed to send invitation email:', emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      invitation: invitationResult.invitation,
      message: 'Team member invitation created successfully',
    });

  } catch (error) {
    console.error('Error creating team invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
