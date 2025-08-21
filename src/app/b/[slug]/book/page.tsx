import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import BookingPageClient from "./BookingPageClient";

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let business: any = null;
  // Resolve by slug via raw Mongo first to avoid Prisma validation on unknown fields
  try {
    let matchedId: string | null = null;
    try {
      const raw = await (prisma as any).$runCommandRaw({
        find: 'Business',
        filter: { slug },
        limit: 1,
      });
      const first = raw?.cursor?.firstBatch?.[0];
      if (first && first._id) {
        matchedId = (first._id.$oid ?? first._id)?.toString?.() ?? null;
      }
    } catch {}

    if (matchedId) {
      business = (await prisma.business.findFirst({
        where: { id: matchedId },
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
    }

    // Fallback by id for backwards compatibility
    if (!business) {
      business = (await prisma.business.findFirst({
        where: { id: slug },
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
    }

    // Fallback to first business if none resolved
    if (!business) {
      business = (await prisma.business.findFirst({
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
    }
  } catch (e) {
    console.error('BookingPage business resolution failed:', e);
  }

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

  // Enrich fields via raw read (for older Prisma client) and overlay cookies
  let rawTagline: string | null = null;
  let rawAbout: string | null = null;
  try {
    const raw = await (prisma as any).$runCommandRaw({
      find: 'Business',
      filter: { _id: { $oid: business.id } },
      limit: 1,
    });
    const first = raw?.cursor?.firstBatch?.[0];
    if (first) {
      rawTagline = first.tagline ?? null;
      rawAbout = first.about ?? null;
    }
  } catch (e) {
    console.warn('Raw business read failed on book page:', e);
  }

  const cookieStore = await cookies();
  const tagline = cookieStore.get('brand_tagline')?.value ?? rawTagline ?? (business as any)?.tagline ?? null;
  const about = cookieStore.get('brand_about')?.value ?? rawAbout ?? (business as any)?.about ?? null;

  return <BookingPageClient business={{ ...business, tagline, about }} servicesByCategory={servicesByCategory} slug={slug} />;
} 