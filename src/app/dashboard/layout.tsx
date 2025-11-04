import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  // Get team member context for the current user
  let teamMember: TeamMemberContext | null = null;
  let business: any = null;

  if (user?.id) {
    try {
      // Find business owned by this user
      let foundBusiness = await prisma.business.findFirst({
        where: {
          owner: {
            clerkId: user.id
          }
        }
      });

      // If no business found by clerkId, try to find by email (for existing users)
      if (!foundBusiness) {
        foundBusiness = await prisma.business.findFirst({
          where: {
            owner: {
              email: user.emailAddresses[0].emailAddress
            }
          }
        });
      }

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
    } catch (error) {
      console.error("Error getting team member context:", error);
    }
  }

  // If no business context found, redirect to setup
  if (!business) {
    redirect("/setup");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar teamMember={teamMember} business={business} />
      <main className="flex-1 lg:overflow-hidden overflow-auto lg:pt-0 pt-16">
        {children}
      </main>
    </div>
  );
} 