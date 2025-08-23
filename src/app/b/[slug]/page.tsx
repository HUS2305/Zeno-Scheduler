import { notFound } from "next/navigation";
import PublicBookingPage from "@/components/public/PublicBookingPage";
import prisma from "@/lib/prisma";

interface BusinessPageProps {
  params: {
    slug: string;
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  // Get the business by slug
  const business = await prisma.business.findFirst({
    where: { slug: slug },
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
  let servicesByCategory: Record<string, typeof business.services> = {};
  
  try {
    if (business.categories && business.categories.length > 0) {
      servicesByCategory = business.categories.reduce((acc, category) => {
        if (category.serviceLinks && category.serviceLinks.length > 0) {
          acc[category.name] = category.serviceLinks.map(link => link.service);
        }
        return acc;
      }, {} as Record<string, typeof business.services>);
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
      business={business}
      servicesByCategory={servicesByCategory}
      slug={slug}
    />
  );
} 