import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import BookingPageClient from "./BookingPageClient";

const prisma = new PrismaClient();

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await prisma.business.findFirst({
    where: { id: slug },
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

  return <BookingPageClient business={business} servicesByCategory={servicesByCategory} />;
} 