import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicBookingPage from "@/components/public/PublicBookingPage";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

interface PublicPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  // Resolve by slug if available, otherwise fall back to first business
  const business = (await (prisma.business as any).findFirst({
    where: { slug: params.slug },
    include: {
      services: {
        where: { isHidden: false },
        include: {
          categoryLinks: { include: { category: true } },
          teamLinks: { include: { teamMember: true } },
        },
        orderBy: { name: "asc" },
      },
      teamMembers: { orderBy: { name: "asc" } },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      categories: { include: { serviceLinks: { include: { service: true } } }, orderBy: { name: "asc" } },
    },
  })) ||
  (await prisma.business.findFirst({
    include: {
      services: {
        where: { isHidden: false },
        include: {
          categoryLinks: { include: { category: true } },
          teamLinks: { include: { teamMember: true } },
        },
        orderBy: { name: "asc" },
      },
      teamMembers: { orderBy: { name: "asc" } },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      categories: { include: { serviceLinks: { include: { service: true } } }, orderBy: { name: "asc" } },
    },
  })) as any;

  // Enrich with raw Mongo read to include fields not present in older Prisma client
  let rawTagline: string | null = null;
  let rawAbout: string | null = null;
  let rawContactEmail: string | null = null;
  let rawContactPhone: string | null = null;
  let rawCountry: string | null = null;
  let rawAddress: string | null = null;
  let rawCity: string | null = null;
  let rawState: string | null = null;
  let rawZipCode: string | null = null;
  // Use Prisma field for slotSize instead of raw MongoDB
  const rawSlotSize = business.slotSize ?? { value: 30, unit: "minutes" };

  // Overlay cookie values (owner-side) over DB values; treat empty strings as null
  const cookieStore = await cookies();
  const cookieTaglineRaw = cookieStore.get('brand_tagline')?.value;
  const cookieAboutRaw = cookieStore.get('brand_about')?.value;
  const cookieTagline = cookieTaglineRaw && cookieTaglineRaw.trim().length > 0 ? cookieTaglineRaw : null;
  const cookieAbout = cookieAboutRaw && cookieAboutRaw.trim().length > 0 ? cookieAboutRaw : null;

  const tagline = cookieTagline ?? rawTagline ?? (business as any)?.tagline ?? null;
  const about = cookieAbout ?? rawAbout ?? (business as any)?.about ?? null;

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
      business={{ 
        ...business, 
        tagline, 
        about,
        contactEmail: rawContactEmail,
        contactPhone: rawContactPhone,
        country: rawCountry,
        address: rawAddress,
        city: rawCity,
        state: rawState,
        zipCode: rawZipCode,
        slotSize: rawSlotSize,
      } as any}
      servicesByCategory={servicesByCategory}
    />
  );
} 