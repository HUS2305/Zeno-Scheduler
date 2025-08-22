import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { invitationId, name, email, phone, password } = await request.json();

    // Validate required fields
    if (!invitationId || !name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get invitation details
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { business: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 }
      );
    }

    // Check if email matches invitation
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email does not match invitation" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify since they came through invitation
      },
    });

    // Create team member record
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: user.id,
        businessId: invitation.businessId,
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        role: invitation.role,
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    });

    // Mark invitation as accepted
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        acceptedAt: new Date(),
        acceptedBy: user.id,
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_MEMBER_JOINED',
        entityType: 'TEAM_MEMBER',
        entityId: teamMember.id,
        userId: user.id,
        businessId: invitation.businessId,
        details: {
          role: invitation.role,
          invitedBy: invitation.invitedBy,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Team member account created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      teamMember: {
        id: teamMember.id,
        role: teamMember.role,
        businessId: teamMember.businessId,
      },
    });
  } catch (error) {
    console.error("Error accepting team invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




