import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/nextauth";
import prisma from "@/lib/prisma";

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

    // Get all categories for the business with service count
    const categories = await prisma.category.findMany({
      where: { businessId: business.id },
      include: {
        _count: {
          select: { serviceLinks: true }
        }
      }
    });

    // Transform the data to match the expected format
    const categoriesWithCount = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      serviceCount: category._count.serviceLinks
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        businessId: business.id
      }
    });

    return NextResponse.json({
      id: category.id,
      name: category.name,
      serviceCount: 0
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');
    const { name } = await request.json();

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Verify the category belongs to this business
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId: business.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name: name.trim() },
    });

    // Get the updated service count
    const updatedServiceCount = await prisma.serviceCategory.count({
      where: { categoryId: categoryId }
    });

    return NextResponse.json({
      id: updatedCategory.id,
      name: updatedCategory.name,
      serviceCount: updatedServiceCount
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Check if category exists and belongs to the business
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId: business.id
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category has any services
    const servicesCount = await prisma.serviceCategory.count({
      where: { categoryId: categoryId }
    });

    if (servicesCount > 0) {
      return NextResponse.json({ 
        error: "Cannot delete category that has services. Please reassign or delete the services first." 
      }, { status: 400 });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
} 