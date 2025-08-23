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

    // Generate a unique slug from the business name
    const generateSlug = (businessName: string) => {
      return businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    let slug = generateSlug(name);
    let counter = 1;
    
    // Ensure slug uniqueness
    while (true) {
      const existingBusinessWithSlug = await prisma.business.findFirst({
        where: { slug: slug },
      });
      
      if (!existingBusinessWithSlug) {
        break; // Slug is unique
      }
      
      // If slug exists, append a number
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
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
        slug: slug,
        ownerId: session.user.id,
      },
    });

    // Create the owner as a team member so they appear as a service provider
    await prisma.teamMember.create({
      data: {
        name: session.user.name || 'Business Owner',
        email: session.user.email || '',
        role: 'OWNER',
        status: 'ACTIVE',
        businessId: business.id,
        userId: session.user.id,
        joinedAt: new Date(),
        invitationToken: `owner-${business.id}-${Date.now()}`, // Unique token for owner
      },
    });

    // Update business with default settings using Prisma
    await prisma.business.update({
      where: { id: business.id },
      data: {
        slotSize: { value: 30, unit: "minutes" },
        allowDoubleBooking: true,
        theme: "light",
        brandColor: "#000000",
        isActive: true,
        isPublic: true,
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
        services: {
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
        },
        teamMembers: {
          include: {
            permissions: true,
          },
        },
        categories: {
          include: {
            serviceLinks: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Ensure the owner is always a team member
    const ownerTeamMember = business.teamMembers.find(member => member.userId === session.user.id);
    if (!ownerTeamMember) {
      // Create the owner as a team member if they don't exist
      await prisma.teamMember.create({
        data: {
          name: session.user.name || 'Business Owner',
          email: session.user.email || '',
          role: 'OWNER',
          status: 'ACTIVE',
          businessId: business.id,
          userId: session.user.id,
          joinedAt: new Date(),
          invitationToken: `owner-${business.id}-${Date.now()}-get`, // Unique token for owner in GET
        },
      });
      
      // Refresh the business data to include the new team member
      const updatedBusiness = await prisma.business.findFirst({
        where: { ownerId: session.user.id },
        include: {
          openingHours: true,
          services: {
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
          },
          teamMembers: {
            include: {
              permissions: true,
            },
          },
          categories: {
            include: {
              serviceLinks: {
                include: {
                  service: true,
                },
              },
            },
          },
        },
      });
      
      return NextResponse.json(updatedBusiness);
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
          services: {
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
          },
          teamMembers: {
            include: {
              permissions: true,
            },
          },
          categories: {
            include: {
              serviceLinks: {
                include: {
                  service: true,
                },
              },
            },
          },
        },
      });
      
      if (updatedBusiness) {
        return NextResponse.json(updatedBusiness);
      }
    }

    return NextResponse.json(business);
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

    const { name, slug, industry, about, tagline } = await request.json();

    // Get the current user's business
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // If slug is being updated, check for uniqueness
    if (slug && slug !== business.slug) {
      const existingBusinessWithSlug = await prisma.business.findFirst({
        where: { 
          slug: slug,
          id: { not: business.id } // Exclude current business
        },
      });
      
      if (existingBusinessWithSlug) {
        return NextResponse.json(
          { error: "This URL is already taken. Please choose a different one." },
          { status: 400 }
        );
      }
    }

    // Update the business
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        name: name?.trim(),
        slug: slug?.trim(),
        industry: industry?.trim(),
        about: about?.trim(),
        tagline: tagline?.trim(),
      },
    });

    return NextResponse.json(updatedBusiness);
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}