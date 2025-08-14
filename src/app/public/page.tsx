import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import PublicBookingPage from "@/components/public/PublicBookingPage";

const prisma = new PrismaClient();

export default async function PublicPage() {
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

  // Enrich with raw Mongo read to include fields not present in older Prisma client
  let enrichedBusiness = business as any;
  try {
    const raw = await (prisma as any).$runCommandRaw({
      find: 'Business',
      filter: { _id: { $oid: business.id } },
      limit: 1,
    });
    const first = raw?.cursor?.firstBatch?.[0];
    if (first) {
      enrichedBusiness = {
        ...business,
        tagline: first.tagline ?? null,
        about: first.about ?? null,
        contactEmail: first.contactEmail ?? null,
        contactPhone: first.contactPhone ?? null,
        country: first.country ?? null,
        address: first.address ?? null,
        city: first.city ?? null,
        state: first.state ?? null,
        zipCode: first.zipCode ?? null,
        theme: first.theme ?? null,
        brandColor: first.brandColor ?? null,
      };
    }
  } catch (e) {
    console.warn('Raw business read failed on main public page:', e);
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
      business={enrichedBusiness}
      servicesByCategory={servicesByCategory}
    />
  );
} 