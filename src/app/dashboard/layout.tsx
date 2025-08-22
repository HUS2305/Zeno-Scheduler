import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/nextauth";
import Sidebar from "@/components/dashboard/Sidebar";
import prisma from "@/lib/prisma";
import { TeamMemberRole, PermissionAction } from "@prisma/client";

// Type for team member context
interface TeamMemberContext {
  id: string;
  role: TeamMemberRole;
  businessId: string;
  status: string;
  permissions: PermissionAction[];
  business: {
    id: string;
    name: string;
    slug?: string | null;
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get team member context for the current user
  let teamMember: TeamMemberContext | null = null;
  let business: any = null;

  if (session.user?.id) {
    try {
      // First try to find team member by userId
      const foundTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
        include: {
          business: true,
          permissions: true,
        },
      });

      if (foundTeamMember) {
        teamMember = {
          id: foundTeamMember.id,
          role: foundTeamMember.role,
          businessId: foundTeamMember.businessId,
          status: foundTeamMember.status,
          permissions: foundTeamMember.permissions.map(p => p.action),
          business: {
            id: foundTeamMember.business.id,
            name: foundTeamMember.business.name,
            slug: foundTeamMember.business.slug,
          },
        };
        business = foundTeamMember.business;
      } else {
        // If no team member found, check if user is a business owner
        const foundBusiness = await prisma.business.findFirst({
          where: { ownerId: session.user.id },
        });

        if (foundBusiness) {
          business = foundBusiness;
          // Create a virtual team member context for business owner
          teamMember = {
            id: 'owner',
            role: 'OWNER' as TeamMemberRole,
            businessId: foundBusiness.id,
            status: 'ACTIVE',
            permissions: [], // Owner has all permissions
            business: {
              id: foundBusiness.id,
              name: foundBusiness.name,
              slug: foundBusiness.slug,
            },
          };
        }
      }
    } catch (error) {
      console.error("Error getting team member context:", error);
    }
  }

  // If no business context found, redirect to setup
  if (!business) {
    redirect("/dashboard/setup");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar teamMember={teamMember} business={business} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 