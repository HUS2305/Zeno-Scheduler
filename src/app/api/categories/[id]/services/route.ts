import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/nextauth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: categoryId } = await params;
    const { serviceIds } = await request.json();

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Verify the category belongs to this business
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId: business.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete all existing service-category relationships for this category
    await prisma.serviceCategory.deleteMany({
      where: { categoryId: categoryId },
    });

    // Create new service-category relationships
    if (serviceIds && serviceIds.length > 0) {
      const serviceCategoryLinks = serviceIds.map((serviceId: string) => ({
        serviceId: serviceId,
        categoryId: categoryId,
      }));

      await prisma.serviceCategory.createMany({
        data: serviceCategoryLinks,
      });
    }

    // Return the updated category with service information
    const updatedCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        serviceLinks: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category services:", error);
    return NextResponse.json(
      { error: "Failed to update category services" },
      { status: 500 }
    );
  }
} 