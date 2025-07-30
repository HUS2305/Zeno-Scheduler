import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/nextauth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT - Toggle hidden status of a service
export async function PUT(request: NextRequest) {
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

    // Get the current service
    const currentService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId: business.id,
      },
    });

    if (!currentService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Toggle the hidden status
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        isHidden: !currentService.isHidden,
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

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error toggling service hidden status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 