import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/nextauth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch a specific service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get the service and verify it belongs to the user's business
    const service = await prisma.service.findFirst({
      where: {
        id,
        businessId: business.id,
      },
      include: {
        categoryLinks: {
          include: {
            category: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a specific service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, duration, price, description, location, categoryIds, isHidden } = await request.json();

    // Validate required fields
    if (!name || !duration) {
      return NextResponse.json(
        { error: "Name and duration are required" },
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

    // Verify the service belongs to the user's business
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Update the service
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        duration,
        price: price || 0,
      }
    });

    // Update category relationships
    if (categoryIds !== undefined) {
      // Delete existing category relationships
      await prisma.serviceCategory.deleteMany({
        where: { serviceId: id }
      });

      // Create new category relationships if categoryIds are provided
      if (categoryIds && categoryIds.length > 0) {
        const categoryLinks = categoryIds.map((categoryId: string) => ({
          serviceId: id,
          categoryId: categoryId
        }));

        await prisma.serviceCategory.createMany({
          data: categoryLinks
        });
      }
    }

    // Return the updated service with category information
    const serviceWithCategories = await prisma.service.findUnique({
      where: { id },
      include: {
        categoryLinks: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(serviceWithCategories);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Verify the service belongs to the user's business
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete the service
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 