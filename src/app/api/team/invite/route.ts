import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/nextauth";
import prisma from "@/lib/prisma";
import { PermissionAction, TeamMemberRole } from "@prisma/client";
import { roleHasPermission } from "@/lib/permissions";
import { sendTeamInvitation } from "@/lib/email-service";
import { randomBytes } from "crypto";

// POST - Send team invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get team member context for the current user
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!teamMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 403 });
    }

    // Check permission to invite team members
    if (!roleHasPermission(teamMember.role, PermissionAction.INVITE_TEAM_MEMBERS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { name, email, phone, role, message, businessId } = await request.json();

    // Validate required fields
    if (!name || !email || !role || !businessId) {
      return NextResponse.json(
        { error: "Name, email, role, and businessId are required" },
        { status: 400 }
      );
    }

    // Validate role assignment permissions
    const assignableRoles = getAssignableRoles(teamMember.role);
    if (!assignableRoles.includes(role)) {
      return NextResponse.json(
        { error: "You cannot assign this role" },
        { status: 400 }
      );
    }

    // Check if email is already invited or is a team member
    // TEMPORARILY DISABLED FOR TESTING - Allow duplicate emails
    /*
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        email: email.toLowerCase(),
        businessId: businessId,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }
    */

    // TEMPORARY EXCEPTION: Allow testing with business owner's email
    const isBusinessOwnerEmail = email.toLowerCase() === teamMember.email.toLowerCase();
    
    if (!isBusinessOwnerEmail) {
      const existingTeamMember = await prisma.teamMember.findFirst({
        where: {
          email: email.toLowerCase(),
          businessId: businessId,
        },
      });

      if (existingTeamMember) {
        return NextResponse.json(
          { error: "This person is already a team member" },
          { status: 400 }
        );
      }
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    console.log('Creating invitation with data:', {
      email: email.toLowerCase(),
      name,
      role,
      businessId,
      token,
      expiresAt,
      invitedBy: teamMember.userId || '',
      message: message || null,
    });

    const invitation = await prisma.teamInvitation.create({
      data: {
        email: email.toLowerCase(),
        name,
        role,
        businessId,
        token,
        expiresAt,
        invitedBy: teamMember.userId || '',
        message: message || null,
      },
    });

    console.log('Invitation created successfully:', invitation.id);

    // Send invitation email
    try {
      // Get business name for the email
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { name: true }
      });

      await sendTeamInvitation({
        to: email,
        name,
        businessName: business?.name || 'Your Business',
        role,
        token,
        message,
        expiresAt,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // DON'T delete the invitation - just log the error and continue
      // The invitation is still valid even if email fails
      console.warn("Email failed but invitation was created successfully. Invitation ID:", invitation.id);
    }

    console.log('About to return invitation response. Invitation still exists:', invitation.id);
    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Error creating team invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get pending invitations for a business
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // Get team member context for the current user
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        businessId: businessId,
        status: 'ACTIVE',
      },
    });

    if (!teamMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 403 });
    }

    // Check permission to view team members
    if (!roleHasPermission(teamMember.role, PermissionAction.VIEW_TEAM_MEMBERS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Get pending invitations
    const invitations = await prisma.teamInvitation.findMany({
      where: {
        businessId: businessId,
        expiresAt: { gt: new Date() },
        acceptedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching team invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get assignable roles
function getAssignableRoles(assignerRole: TeamMemberRole): TeamMemberRole[] {
  const roleHierarchy = {
    [TeamMemberRole.STANDARD]: 1,
    [TeamMemberRole.ENHANCED]: 2,
    [TeamMemberRole.ADMIN]: 3,
    [TeamMemberRole.OWNER]: 4,
  };
  
  return Object.values(TeamMemberRole).filter(role => 
    roleHierarchy[role] < roleHierarchy[assignerRole]
  );
}
