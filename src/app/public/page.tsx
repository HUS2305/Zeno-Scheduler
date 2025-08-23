import { notFound, redirect } from "next/navigation";
import PublicBookingPage from "@/components/public/PublicBookingPage";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/nextauth";

export default async function PublicPage() {
  // Get the current user's session
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    // If user is logged in, get their business and redirect to custom URL
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      select: { slug: true }
    });
    
    if (business?.slug) {
      // Redirect to the business's custom URL
      redirect(`/b/${business.slug}`);
    }
  }
  
  // If no user is logged in or no slug, get the first business (fallback)
  const business = await prisma.business.findFirst({
    include: {
      services: {
        where: { isHidden: false },
        include: {
          categoryLinks: {
            include: {
              category: true,
            },
          },
          teamLinks: {
            include: {
              teamMember: true,
            },
          },
        },
        orderBy: { name: "asc" },
      },
      teamMembers: {
        orderBy: { name: "asc" },
      },
      openingHours: {
        orderBy: { dayOfWeek: "asc" },
      },
      categories: {
        include: {
          serviceLinks: {
            include: {
              service: true,
            },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!business) {
    notFound();
  }

  // Group services by category
  let servicesByCategory: Record<string, any[]> = {};
  
  try {
    if (business.categories && business.categories.length > 0) {
      servicesByCategory = business.categories.reduce((acc, category) => {
        if (category.serviceLinks && category.serviceLinks.length > 0) {
          acc[category.name] = category.serviceLinks.map(link => link.service);
        }
        return acc;
      }, {} as Record<string, any[]>);
    }

    // Add uncategorized services under "Others" category
    if (business.services && business.services.length > 0) {
      const uncategorizedServices = business.services.filter(service => 
        !service.categoryLinks || service.categoryLinks.length === 0
      );
      if (uncategorizedServices.length > 0) {
        servicesByCategory["Others"] = uncategorizedServices;
      }
    }
  } catch (error) {
    console.error("Error processing services by category:", error);
    servicesByCategory = {};
  }

  return (
    <PublicBookingPage
      business={business as any}
      servicesByCategory={servicesByCategory}
    />
  );
} 