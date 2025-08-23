import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/nextauth";
import prisma from "@/lib/prisma";

// POST - Duplicate a service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceId } = await request.json();

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get the original service with all its relationships
    const originalService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId: business.id,
      },
      include: {
        categoryLinks: {
          include: {
            category: true
          }
        },
        teamLinks: {
          include: {
            teamMember: true
          }
        }
      }
    });

    if (!originalService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Create the duplicated service
    const duplicatedService = await prisma.service.create({
      data: {
        name: `${originalService.name} copy`,
        duration: originalService.duration,
        price: originalService.price,
        businessId: business.id,
      }
    });

    // Copy category relationships
    if (originalService.categoryLinks && originalService.categoryLinks.length > 0) {
      const categoryLinks = originalService.categoryLinks.map((link) => ({
        serviceId: duplicatedService.id,
        categoryId: link.categoryId
      }));

      await prisma.serviceCategory.createMany({
        data: categoryLinks
      });
    }

    // Copy team member relationships
    if (originalService.teamLinks && originalService.teamLinks.length > 0) {
      const teamLinks = originalService.teamLinks.map((link) => ({
        serviceId: duplicatedService.id,
        teamMemberId: link.teamMemberId
      }));

      await prisma.serviceTeamMember.createMany({
        data: teamLinks
      });
    }

    // Return the duplicated service with all relationships
    const serviceWithRelations = await prisma.service.findUnique({
      where: { id: duplicatedService.id },
      include: {
        categoryLinks: {
          include: {
            category: true
          }
        },
        teamLinks: {
          include: {
            teamMember: true
          }
        }
      }
    });

    return NextResponse.json(serviceWithRelations, { status: 201 });
  } catch (error) {
    console.error("Error duplicating service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 