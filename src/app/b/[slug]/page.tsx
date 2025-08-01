import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import PublicBookingPage from "@/components/public/PublicBookingPage";

const prisma = new PrismaClient();

interface PublicPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  // For now, we'll use the first business - later we can add a slug field to Business model
  const business = await prisma.business.findFirst({
    where: {
      // For now, we'll use the first business - you'll want to add a slug field
      // slug: params.slug
    },
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
      team: {
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
  const servicesByCategory = business.categories.reduce((acc, category) => {
    acc[category.name] = category.serviceLinks.map(link => link.service);
    return acc;
  }, {} as Record<string, typeof business.services>);

  // Add uncategorized services under "Others" category
  const uncategorizedServices = business.services.filter(service => 
    service.categoryLinks.length === 0
  );
  if (uncategorizedServices.length > 0) {
    servicesByCategory["Others"] = uncategorizedServices;
  }

  return (
    <PublicBookingPage 
      business={business}
      servicesByCategory={servicesByCategory}
    />
  );
} 