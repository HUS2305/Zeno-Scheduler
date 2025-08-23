import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/nextauth";
import TeamManagementClient from "./TeamManagementClient";

// ============================================================================
// COMPLETE ORIGINAL TEAM PAGE FUNCTIONALITY - BACKUP FOR FUTURE RESTORATION
// ============================================================================
// 
// TO RESTORE: Copy this entire file content and replace page.tsx
// 

import prisma from "@/lib/prisma";

export default async function TeamPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect("/login");
    }

    // First, get the current user's team member info to find their business
    const currentTeamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { permissions: true }
    });

    if (!currentTeamMember) {
      redirect("/dashboard/setup");
    }

    // Get business data using the team member's businessId
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
      },
    }) as any; // Type assertion to avoid complex type issues

    if (!business) {
      redirect("/dashboard/setup");
    }

    // Get team invitations separately to avoid include issues
    const teamInvitations = await prisma.teamInvitation.findMany({
      where: {
        businessId: currentTeamMember.businessId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        invitedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add invitations to the business object
    business.teamInvitations = teamInvitations;

    // Check if user needs to be created as team member (this should rarely happen)
    if (!currentTeamMember) {
      // If user is not a team member, create them as owner
      const ownerMember = await prisma.teamMember.create({
        data: {
          name: session.user.name || 'Business Owner',
          email: session.user.email || '',
          role: 'OWNER',
          status: 'ACTIVE',
          businessId: business.id,
          userId: session.user.id,
          joinedAt: new Date(),
        },
      });

      // Add owner permissions
      await prisma.teamMemberPermission.createMany({
        data: [
          { teamMemberId: ownerMember.id, action: 'VIEW_OWN_CALENDAR' },
          { teamMemberId: ownerMember.id, action: 'MANAGE_OWN_APPOINTMENTS' },
          { teamMemberId: ownerMember.id, action: 'VIEW_ALL_CUSTOMERS' },
          { teamMemberId: ownerMember.id, action: 'MANAGE_ALL_CUSTOMERS' },
          { teamMemberId: ownerMember.id, action: 'VIEW_TEAM_MEMBERS' },
          { teamMemberId: ownerMember.id, action: 'INVITE_TEAM_MEMBERS' },
          { teamMemberId: ownerMember.id, action: 'MANAGE_TEAM_MEMBERS' },
          { teamMemberId: ownerMember.id, action: 'VIEW_BUSINESS_SETTINGS' },
          { teamMemberId: ownerMember.id, action: 'MANAGE_BUSINESS_SETTINGS' },
          { teamMemberId: ownerMember.id, action: 'MANAGE_SERVICES' },
          { teamMemberId: ownerMember.id, action: 'MANAGE_CATEGORIES' },
          { teamMemberId: ownerMember.id, action: 'VIEW_REPORTS' },
          { teamMemberId: ownerMember.id, action: 'VIEW_FINANCIAL_DATA' },
          { teamMemberId: ownerMember.id, action: 'EXPORT_DATA' },
          { teamMemberId: ownerMember.id, action: 'VIEW_AUDIT_LOGS' },
          { teamMemberId: ownerMember.id, action: 'SYSTEM_CONFIGURATION' },
        ],
      });

      // Refresh the business data
      const updatedBusiness = await prisma.business.findFirst({
        where: { ownerId: session.user.id },
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

      if (updatedBusiness) {
        business.teamMembers = updatedBusiness.teamMembers;
        business.teamInvitations = updatedBusiness.teamInvitations;
      }
    }

    return (
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Team Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your team members, roles, and permissions.
              </p>
            </div>
            {business.teamInvitations && business.teamInvitations.length > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  {business.teamInvitations.length}
                </div>
                <div className="text-sm text-gray-600">
                  Pending Invitation{business.teamInvitations.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>

        <TeamManagementClient 
          business={business}
          currentUser={session.user as any}
          currentTeamMember={currentTeamMember as any || (business.teamMembers as any).find((m: any) => m.userId === session.user.id)}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in TeamPage:', error);
    return (
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Team Management</h1>
          <p className="text-sm text-red-600 mt-1">
            Error loading team management. Please try refreshing the page.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Error details: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }
}




