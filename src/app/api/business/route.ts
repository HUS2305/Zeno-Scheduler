import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/nextauth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    // Check if user already has a business
    const existingBusiness = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "User already has a business" },
        { status: 400 }
      );
    }

    // Create the business
    const business = await prisma.business.create({
      data: {
        name: name.trim(),
        ownerId: session.user.id,
      },
    });

    // Create default opening hours (8:00-17:00 for all days)
    const defaultOpeningHours = [
      { dayOfWeek: 0, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Sunday
      { dayOfWeek: 1, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Monday
      { dayOfWeek: 2, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Tuesday
      { dayOfWeek: 3, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Wednesday
      { dayOfWeek: 4, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Thursday
      { dayOfWeek: 5, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Friday
      { dayOfWeek: 6, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Saturday
    ];

    await prisma.openingHour.createMany({
      data: defaultOpeningHours,
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: {
        openingHours: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // If business has no opening hours, create default ones
    if (!business.openingHours || business.openingHours.length === 0) {
      const defaultOpeningHours = [
        { dayOfWeek: 0, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Sunday
        { dayOfWeek: 1, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Monday
        { dayOfWeek: 2, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Tuesday
        { dayOfWeek: 3, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Wednesday
        { dayOfWeek: 4, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Thursday
        { dayOfWeek: 5, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Friday
        { dayOfWeek: 6, openTime: "08:00", closeTime: "17:00", businessId: business.id }, // Saturday
      ];

      await prisma.openingHour.createMany({
        data: defaultOpeningHours,
      });

      // Re-fetch business with the new opening hours
      const updatedBusiness = await prisma.business.findFirst({
        where: { ownerId: session.user.id },
        include: {
          openingHours: true,
        },
      });
      
      if (updatedBusiness) {
        business.openingHours = updatedBusiness.openingHours;
      }
    }

    // Re-read the document via raw Mongo to include any fields not known to the Prisma client
    let enriched: any = business;
    try {
      const raw = await (prisma as any).$runCommandRaw({
        find: 'Business',
        filter: { _id: { $oid: business.id } },
        limit: 1,
      });
      const first = raw?.cursor?.firstBatch?.[0];
      if (first) {
        enriched = {
          ...business,
          slug: first.slug ?? null,
          tagline: first.tagline ?? null,
          industry: first.industry ?? null,
          about: first.about ?? null,
          openingHours: business.openingHours,
          contactEmail: first.contactEmail ?? null,
          contactPhone: first.contactPhone ?? null,
          country: first.country ?? null,
          address: first.address ?? null,
          city: first.city ?? null,
          state: first.state ?? null,
          zipCode: first.zipCode ?? null,
          theme: first.theme ?? null,
          brandColor: first.brandColor ?? null,
        } as any;
      }
    } catch (e) {
      console.warn('Raw read failed, returning prisma business only:', e);
    }

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug: incomingSlug,
      industry,
      about,
      tagline,
      contactEmail,
      contactPhone,
      openingHours,
      country,
      address,
      city,
      state,
      zipCode,
      theme,
      brandColor,
    }: { 
      name?: string; 
      slug?: string; 
      industry?: string; 
      about?: string; 
      tagline?: string;
      contactEmail?: string;
      contactPhone?: string;
      openingHours?: Array<{ dayOfWeek: number; openTime: string; closeTime: string }>;
      country?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      theme?: string;
      brandColor?: string;
    } = body || {};

    // Only require name if we're updating business details (not just contact details)
    if (name !== undefined && (!name || typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }


    // Find the business for this owner
    const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Helper to normalize optional strings to either a trimmed string or null
    const normalizeOptional = (value?: string | null) => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    };

    // Sanitize slug to a URL-friendly token (no leading /b/ or slashes)
    const sanitizeSlug = (raw?: string | null) => {
      if (typeof raw !== 'string') return null;
      let s = raw.trim().toLowerCase();
      // strip leading path like "/b/"
      if (s.startsWith('/b/')) s = s.slice(3);
      if (s.startsWith('/')) s = s.slice(1);
      // keep only a-z0-9 and hyphens
      s = s
        .normalize('NFKD')
        .replace(/[^a-z0-9\s-]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      return s.length === 0 ? null : s;
    };

    const sanitizedSlug = sanitizeSlug(incomingSlug);

    // If slug provided, ensure it is not already used by another business (raw Mongo to avoid schema mismatch)
    if (sanitizedSlug) {
      try {
        const result = await (prisma as any).$runCommandRaw({
          find: 'Business',
          filter: {
            slug: sanitizedSlug,
            _id: { $ne: { $oid: business.id } },
          },
          limit: 1,
        });
        const firstBatch = (result?.cursor?.firstBatch ?? []) as unknown[];
        if (Array.isArray(firstBatch) && firstBatch.length > 0) {
          return NextResponse.json({ error: 'This booking URL is already taken' }, { status: 409 });
        }
      } catch (e) {
        console.warn('Slug uniqueness check failed, proceeding optimistically:', e);
      }
    }

    // Persist name via Prisma client (only if provided)
    let updated = business;
    if (name !== undefined) {
      updated = await prisma.business.update({
        where: { id: business.id },
        data: ({ name: name.trim() } as any),
      });
    }

    // Persist other fields via raw Mongo command to avoid client-version mismatches
    const $set: Record<string, string | null> = {};
    
    // Only update fields that are actually provided in the request
    // This prevents accidentally setting fields to null when they're not included
    if (industry !== undefined) {
      const normIndustry = normalizeOptional(industry);
      if (typeof normIndustry === 'string' || normIndustry === null) $set.industry = normIndustry;
    }
    if (about !== undefined) {
      const normAbout = normalizeOptional(about);
      if (typeof normAbout === 'string' || normAbout === null) $set.about = normAbout;
    }
    if (tagline !== undefined) {
      const normTagline = normalizeOptional(tagline);
      if (typeof normTagline === 'string' || normTagline === null) $set.tagline = normTagline;
    }
    if (incomingSlug !== undefined) {
      const normSlug = sanitizedSlug ?? null;
      if (typeof normSlug === 'string' || normSlug === null) $set.slug = normSlug;
    }
    if (contactEmail !== undefined) {
      const normContactEmail = normalizeOptional(contactEmail);
      if (typeof normContactEmail === 'string' || normContactEmail === null) $set.contactEmail = normContactEmail;
    }
    if (contactPhone !== undefined) {
      const normContactPhone = normalizeOptional(contactPhone);
      if (typeof normContactPhone === 'string' || normContactPhone === null) $set.contactPhone = normContactPhone;
    }
    if (country !== undefined) {
      const normCountry = normalizeOptional(country);
      if (typeof normCountry === 'string' || normCountry === null) $set.country = normCountry;
    }
    if (address !== undefined) {
      const normAddress = normalizeOptional(address);
      if (typeof normAddress === 'string' || normAddress === null) $set.address = normAddress;
    }
    if (city !== undefined) {
      const normCity = normalizeOptional(city);
      if (typeof normCity === 'string' || normCity === null) $set.city = normCity;
    }
    if (state !== undefined) {
      const normState = normalizeOptional(state);
      if (typeof normState === 'string' || normState === null) $set.state = normState;
    }
    if (zipCode !== undefined) {
      const normZipCode = normalizeOptional(zipCode);
      if (typeof normZipCode === 'string' || normZipCode === null) $set.zipCode = normZipCode;
    }
    if (theme !== undefined) {
      const normTheme = normalizeOptional(theme);
      if (typeof normTheme === 'string' || normTheme === null) $set.theme = normTheme;
    }
    if (brandColor !== undefined) {
      const normBrandColor = normalizeOptional(brandColor);
      if (typeof normBrandColor === 'string' || normBrandColor === null) $set.brandColor = normBrandColor;
    }
    try {
      if (Object.keys($set).length > 0) {
        await (prisma as any).$runCommandRaw({
          update: 'Business',
          updates: [
            {
              q: { _id: { $oid: business.id } },
              u: { $set },
              upsert: false,
              multi: false,
            },
          ],
        });
      }
    } catch (e) {
      console.warn('Raw update failed, proceeding with name-only update:', e);
    }

    // Handle opening hours update if provided
    if (openingHours && Array.isArray(openingHours)) {
      try {
        // First, delete existing opening hours for this business
        await prisma.openingHour.deleteMany({
          where: { businessId: business.id }
        });

        // Then create new opening hours
        if (openingHours.length > 0) {
          await prisma.openingHour.createMany({
            data: openingHours.map(hour => ({
              dayOfWeek: hour.dayOfWeek,
              openTime: hour.openTime,
              closeTime: hour.closeTime,
              businessId: business.id,
            }))
          });
        }
      } catch (e) {
        console.warn('Opening hours update failed:', e);
        // Don't fail the entire request if opening hours update fails
      }
    }

    // Also set cookies as a temporary overlay for SSR pages
    const response = NextResponse.json(
      {
        ...updated,
        // Echo normalized values in response body - only include fields that were updated
        ...(industry !== undefined && { industry: normalizeOptional(industry) }),
        ...(about !== undefined && { about: normalizeOptional(about) }),
        ...(tagline !== undefined && { tagline: normalizeOptional(tagline) }),
        ...(incomingSlug !== undefined && { slug: sanitizedSlug }),
        ...(contactEmail !== undefined && { contactEmail: normalizeOptional(contactEmail) }),
        ...(contactPhone !== undefined && { contactPhone: normalizeOptional(contactPhone) }),
        ...(country !== undefined && { country: normalizeOptional(country) }),
        ...(address !== undefined && { address: normalizeOptional(address) }),
        ...(city !== undefined && { city: normalizeOptional(city) }),
        ...(state !== undefined && { state: normalizeOptional(state) }),
        ...(zipCode !== undefined && { zipCode: normalizeOptional(zipCode) }),
        ...(theme !== undefined && { theme: normalizeOptional(theme) }),
        ...(brandColor !== undefined && { brandColor: normalizeOptional(brandColor) }),
      } as any,
      { status: 200 }
    );

    const setOrClear = (key: string, value: unknown) => {
      if (typeof value !== 'string') return;
      const cookieValue = value.trim();
      if (cookieValue.length === 0) {
        response.cookies.set(key, '', { path: '/', maxAge: 0 });
      } else {
        response.cookies.set(key, cookieValue, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        });
      }
    };
    setOrClear('brand_industry', industry ?? '');
    setOrClear('brand_about', about ?? '');
    setOrClear('brand_tagline', tagline ?? '');
    setOrClear('brand_theme', theme ?? '');
    setOrClear('brand_color', brandColor ?? '');

    return response;
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}