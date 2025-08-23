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
  teamMembers: [
    {
      id: "6887e529375836ca77827faf",
      name: "Owner",
      email: "owner@example.com"
    }
  ],
  openingHours: [
    { dayOfWeek: 0, openTime: "08:00", closeTime: "17:00" }, // Sunday
    { dayOfWeek: 1, openTime: "08:00", closeTime: "17:00" }, // Monday
    { dayOfWeek: 2, openTime: "08:00", closeTime: "17:00" }, // Tuesday
    { dayOfWeek: 3, openTime: "08:00", closeTime: "17:00" }, // Wednesday
    { dayOfWeek: 4, openTime: "08:00", closeTime: "17:00" }, // Thursday
    { dayOfWeek: 5, openTime: "08:00", closeTime: "17:00" }, // Friday
    { dayOfWeek: 6, openTime: "08:00", closeTime: "17:00" }, // Saturday
  ],
  slotSize: { value: 30, unit: "minutes" }
};

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let servicesByCategory = {} as Record<string, any[]>;
  let business: any = null;

  try {
    // Get the business by slug
    business = await prisma.business.findFirst({
      where: { slug: slug },
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
    });

    // If no business found by slug, show 404
    if (!business) {
      notFound();
    }

    // Get slot size from raw MongoDB since Prisma client might not have it yet
    try {
      const raw = await (prisma as any).$runCommandRaw({
        find: 'Business',
        filter: { _id: { $oid: business.id } },
        limit: 1,
      });
      const first = raw?.cursor?.firstBatch?.[0];
      if (first?.slotSize) {
        (business as any).slotSize = first.slotSize;
        console.log('Layout: Found slot size from MongoDB:', first.slotSize);
      } else {
        (business as any).slotSize = { value: 30, unit: "minutes" };
        console.log('Layout: Using default slot size:', (business as any).slotSize);
      }
    } catch (e) {
      console.warn('Raw business read failed in layout:', e);
      (business as any).slotSize = { value: 30, unit: "minutes" };
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

  // Debug: Log what we're passing to children
  console.log('Layout: Final business object being passed:', business);
  console.log('Layout: Business slotSize:', (business as any).slotSize);

  return (
    <div>
      {React.cloneElement(children as React.ReactElement<any>, {
        business: { 
          ...business, 
          tagline, 
          about,
          openingHours: (business as any).openingHours,
          slotSize: (business as any).slotSize
        },
        servicesByCategory,
      })}
      
      {/* Logo in Bottom Left Corner - Appears on all booking funnel pages */}
      <div className="fixed bottom-6 left-6 z-40">
        <a href="/" className="text-center hover:opacity-80 transition-opacity cursor-pointer">
          <h1 className="text-2xl font-bold text-black leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Zeno</h1>
          <h2 className="text-sm font-normal text-gray-600 leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Scheduler</h2>
        </a>
      </div>
    </div>
  );
} 