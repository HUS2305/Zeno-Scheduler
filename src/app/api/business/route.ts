import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { error: "Business URL is required" },
        { status: 400 }
      );
    }

    // Ensure slug uniqueness
    let finalSlug = slug.trim();
    let counter = 1;
    
    while (true) {
      const existingBusinessWithSlug = await prisma.business.findFirst({
        where: { slug: finalSlug },
      });
      
      if (!existingBusinessWithSlug) {
        break; // Slug is unique
      }
      
      // If slug exists, append a number
      finalSlug = `${slug.trim()}-${counter}`;
      counter++;
    }

    // Check if user already has a business
    const existingBusiness = await prisma.business.findFirst({
      where: { 
        owner: {
          clerkId: user.id
        }
      },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "User already has a business" },
        { status: 400 }
      );
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      // Check if user exists by email (for existing users)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
      });

      if (existingUser) {
        // Update existing user with clerkId
        dbUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            clerkId: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            profileImageUrl: user.imageUrl,
          },
        });
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            profileImageUrl: user.imageUrl,
          },
        });
      }
    }

    // Create the business
    const business = await prisma.business.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        ownerId: dbUser.id,
      },
    });

    // Create the owner as a team member so they appear as a service provider
    await prisma.teamMember.create({
      data: {
        name: dbUser.name || 'Business Owner',
        email: dbUser.email,
        role: 'OWNER',
        status: 'ACTIVE',
        businessId: business.id,
        userId: dbUser.id,
        clerkId: user.id,
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
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      // Check if user exists by email (for existing users)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
      });

      if (existingUser) {
        // Update existing user with clerkId
        dbUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            clerkId: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            profileImageUrl: user.imageUrl,
          },
        });
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            profileImageUrl: user.imageUrl,
          },
        });
      }
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: dbUser.id },
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
    const ownerTeamMember = business.teamMembers.find(member => member.userId === dbUser.id);
    if (!ownerTeamMember) {
      // Create the owner as a team member if they don't exist
      await prisma.teamMember.create({
        data: {
          name: dbUser.name || 'Business Owner',
          email: dbUser.email,
          role: 'OWNER',
          status: 'ACTIVE',
          businessId: business.id,
          userId: dbUser.id,
          clerkId: user.id,
          joinedAt: new Date(),
          invitationToken: `owner-${business.id}-${Date.now()}-get`, // Unique token for owner in GET
        },
      });
      
      // Refresh the business data to include the new team member
      const updatedBusiness = await prisma.business.findFirst({
        where: { ownerId: dbUser.id },
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
        where: { ownerId: dbUser.id },
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
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      // Check if user exists by email (for existing users)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
      });

      if (existingUser) {
        // Update existing user with clerkId
        dbUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            clerkId: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            profileImageUrl: user.imageUrl,
          },
        });
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            profileImageUrl: user.imageUrl,
          },
        });
      }
    }

    const { 
      name, 
      slug, 
      industry, 
      about, 
      tagline, 
      openingHours, 
      slotSize, 
      allowDoubleBooking, 
      timeFormat,
      theme,
      brandColor,
      isActive,
      isPublic,
      contactEmail,
      contactPhone,
      country,
      address,
      city,
      state,
      zipCode
    } = await request.json();

    // Get the current user's business
    const business = await prisma.business.findFirst({
      where: { ownerId: dbUser.id },
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
        slotSize: slotSize,
        allowDoubleBooking: allowDoubleBooking,
        timeFormat: timeFormat,
        theme: theme,
        brandColor: brandColor,
        isActive: isActive,
        isPublic: isPublic,
        contactEmail: contactEmail?.trim(),
        contactPhone: contactPhone?.trim(),
        country: country?.trim(),
        address: address?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        zipCode: zipCode?.trim(),
      },
    });

    // Update opening hours if provided
    if (openingHours && Array.isArray(openingHours)) {
      // Delete existing opening hours
      await prisma.openingHour.deleteMany({
        where: { businessId: business.id }
      });

      // Create new opening hours
      if (openingHours.length > 0) {
        await prisma.openingHour.createMany({
          data: openingHours.map(hour => ({
            businessId: business.id,
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          }))
        });
      }
    }

    return NextResponse.json(updatedBusiness);
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}