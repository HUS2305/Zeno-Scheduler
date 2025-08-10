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
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
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
    }: { name?: string; slug?: string; industry?: string; about?: string; tagline?: string } = body || {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
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

    // Persist name via Prisma client (always supported)
    const updated = await prisma.business.update({
      where: { id: business.id },
      data: ({ name: name.trim() } as any),
    });

    // Persist other fields via raw Mongo command to avoid client-version mismatches
    const $set: Record<string, string | null> = {};
    const normIndustry = normalizeOptional(industry);
    const normAbout = normalizeOptional(about);
    const normTagline = normalizeOptional(tagline);
    const normSlug = sanitizedSlug ?? null;
    if (typeof normSlug === 'string' || normSlug === null) $set.slug = normSlug;
    if (typeof normIndustry === 'string' || normIndustry === null) $set.industry = normIndustry;
    if (typeof normAbout === 'string' || normAbout === null) $set.about = normAbout;
    if (typeof normTagline === 'string' || normTagline === null) $set.tagline = normTagline;
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

    // Also set cookies as a temporary overlay for SSR pages
    const response = NextResponse.json(
      {
        ...updated,
        // Echo normalized values in response body
        industry: normIndustry,
        about: normAbout,
        tagline: normTagline,
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
    setOrClear('brand_industry', normIndustry ?? '');
    setOrClear('brand_about', normAbout ?? '');
    setOrClear('brand_tagline', normTagline ?? '');

    return response;
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}