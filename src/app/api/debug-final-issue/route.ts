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

    // Test 1: Get ALL invitations (no filters at all)
    const allInvitationsNoFilter = await prisma.teamInvitation.findMany();

    // Test 2: Get invitations by business ID only
    const businessOnlyFilter = await prisma.teamInvitation.findMany({
      where: { businessId: currentTeamMember.businessId }
    });

    // Test 3: Get invitations by business ID + acceptedAt only
    const businessAndAcceptedFilter = await prisma.teamInvitation.findMany({
      where: { 
        businessId: currentTeamMember.businessId,
        acceptedAt: null
      }
    });

    // Test 4: Get invitations by business ID + acceptedAt + expiresAt
    const fullFilter = await prisma.teamInvitation.findMany({
      where: { 
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    // Test 5: Get invitations by hardcoded business ID
    const hardcodedBusinessId = await prisma.teamInvitation.findMany({
      where: { 
        businessId: "6887e529375836ca77827faf"
      }
    });

    // Test 6: Get invitations by hardcoded business ID + acceptedAt
    const hardcodedFull = await prisma.teamInvitation.findMany({
      where: { 
        businessId: "6887e529375836ca77827faf",
        acceptedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      message: "Final issue debug",
      data: {
        currentTeamMember,
        currentTime: new Date().toISOString(),
        
        // Test results
        test1_allInvitationsNoFilter: allInvitationsNoFilter.length,
        test2_businessOnlyFilter: businessOnlyFilter.length,
        test3_businessAndAcceptedFilter: businessAndAcceptedFilter.length,
        test4_fullFilter: fullFilter.length,
        test5_hardcodedBusinessId: hardcodedBusinessId.length,
        test6_hardcodedFull: hardcodedFull.length,
        
        // Sample data from each test
        sample_allInvitations: allInvitationsNoFilter.slice(0, 2).map(inv => ({
          id: inv.id,
          email: inv.email,
          businessId: inv.businessId
        })),
        sample_businessOnly: businessOnlyFilter.slice(0, 2).map(inv => ({
          id: inv.id,
          email: inv.email,
          businessId: inv.businessId
        })),
        sample_hardcoded: hardcodedBusinessId.slice(0, 2).map(inv => ({
          id: inv.id,
          email: inv.email,
          businessId: inv.businessId
        })),
        
        // Business ID comparison
        businessIdFromTeamMember: currentTeamMember.businessId,
        businessIdHardcoded: "6887e529375836ca77827faf",
        businessIdsMatch: currentTeamMember.businessId === "6887e529375836ca77827faf"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Final issue debug failed:", error);
    return NextResponse.json({
      success: false,
      message: "Final issue debug failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


