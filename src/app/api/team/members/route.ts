import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/nextauth";
import prisma from "@/lib/prisma";
import { PermissionAction } from "@prisma/client";
import { roleHasPermission } from "@/lib/permissions";

// GET - Get team members for a business
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

    // Get team members
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        businessId: businessId,
      },
      include: {
        permissions: true,
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


