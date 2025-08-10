import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import React from "react"; // Added missing import for React

export const dynamic = 'force-dynamic';
// Mock data for when database is unavailable
const mockBusiness = {
  id: "6887e529375836ca77827faf",
  name: "the crew",
  profilePic: null,
  services: [
    {
      id: "688a66a83f44145ebfb594a2",
      name: "Dameklip",
      duration: 60,
      price: 100,
      colorTheme: "black",
      category: { name: "Dameklip" },
      teamLinks: []
    }
  ],
  team: [
    {
      id: "6887e529375836ca77827faf",
      name: "Owner",
      email: "owner@example.com"
    }
  ],
  openingHours: []
};

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let business;
  let servicesByCategory = {} as Record<string, any[]>;

  try {
    // Try by slug via raw Mongo (avoids Prisma client schema mismatches)
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
          team: { orderBy: { name: "asc" } },
          openingHours: { orderBy: { dayOfWeek: "asc" } },
          categories: { include: { serviceLinks: { include: { service: true } } }, orderBy: { name: "asc" } },
        },
      })) as any;
    }

    // Fallback by id (backwards compatibility)
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
          team: { orderBy: { name: "asc" } },
          openingHours: { orderBy: { dayOfWeek: "asc" } },
          categories: { include: { serviceLinks: { include: { service: true } } }, orderBy: { name: "asc" } },
        },
      })) as any;
    }

    // Fallback to first business (matches public page behavior)
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
          team: { orderBy: { name: "asc" } },
          openingHours: { orderBy: { dayOfWeek: "asc" } },
          categories: { include: { serviceLinks: { include: { service: true } } }, orderBy: { name: "asc" } },
        },
      })) as any;
    }
  } catch (error) {
    console.error("Database connection error, using mock data:", error);
  }

  if (!business) {
    // Use mock data when database is unavailable or empty
    business = mockBusiness;
    servicesByCategory = { Dameklip: [mockBusiness.services[0]] };
  } else {
    // Group services by category
    servicesByCategory = (business.categories || []).reduce((acc: Record<string, any[]>, category: any) => {
      acc[category.name] = category.serviceLinks.map((link: any) => link.service);
      return acc;
    }, {} as Record<string, any[]>);

    // Add uncategorized services under "Others" category
    const uncategorizedServices = business.services.filter((service: any) => service.categoryLinks.length === 0);
    if (uncategorizedServices.length > 0) {
      servicesByCategory["Others"] = uncategorizedServices;
    }
  }

  // Overlay brand fields from cookies if present (temporary) - prefer only non-empty cookie values
  const cookieStore = await cookies();
  const cookieTaglineRaw = cookieStore.get('brand_tagline')?.value;
  const cookieAboutRaw = cookieStore.get('brand_about')?.value;
  const tagline = (cookieTaglineRaw && cookieTaglineRaw.trim().length > 0 ? cookieTaglineRaw : null) ?? (business as any)?.tagline ?? null;
  const about = (cookieAboutRaw && cookieAboutRaw.trim().length > 0 ? cookieAboutRaw : null) ?? (business as any)?.about ?? null;

  return (
    <div>
      {React.cloneElement(children as React.ReactElement<any>, {
        business: { ...business, tagline, about },
        servicesByCategory,
      })}
    </div>
  );
} 