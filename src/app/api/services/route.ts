import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/nextauth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch all services for the business
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get all services for the business
    const services = await prisma.service.findMany({
      where: { businessId: business.id },
      include: {
        categoryLinks: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, duration, price, description, icon, isActive, categoryIds } = await request.json();

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

    // Create the service first
    const service = await prisma.service.create({
      data: {
        name,
        duration,
        price: price || 0,
        businessId: business.id,
      }
    });

    // Then create category relationships if categoryIds are provided
    if (categoryIds && categoryIds.length > 0) {
      const categoryLinks = categoryIds.map((categoryId: string) => ({
        serviceId: service.id,
        categoryId: categoryId
      }));

      await prisma.serviceCategory.createMany({
        data: categoryLinks
      });
    }

    // Return the service with category information
    const serviceWithCategories = await prisma.service.findUnique({
      where: { id: service.id },
      include: {
        categoryLinks: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(serviceWithCategories, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a service
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, duration, price, description, icon, isActive, categoryIds } = await request.json();

    if (!id) {
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

// DELETE - Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
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