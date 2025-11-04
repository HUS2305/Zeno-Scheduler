import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// PUT - Update a customer for the current business
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { 
        owner: {
          clerkId: user.id
        }
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Security logging
    console.log(`[SECURITY] User ${user.id} (${user.emailAddresses[0].emailAddress}) updating customer ${id} for business ${business.id} (${business.name})`);

    // Verify that the customer actually belongs to this business
    const customerExists = await prisma.customer.findFirst({
      where: {
        id: id,
        businessId: business.id
      }
    });

    if (!customerExists) {
      console.log(`[SECURITY] Access denied: Customer ${id} does not belong to business ${business.id}`);
      return NextResponse.json({ error: "Customer not found or does not belong to this business" }, { status: 404 });
    }

    console.log(`[SECURITY] Customer ${id} verified to belong to business ${business.id}, proceeding with update`);

    const { email, name, phone, company, country, address, city, state, zipCode } = await request.json();

    // Validate required fields - only name is required
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // If email is provided, validate its format
    if (email && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Check if customer with this email already exists in THIS BUSINESS (excluding current customer)
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email: email.trim(),
          businessId: business.id,
          id: { not: id }
        }
      });

      if (existingCustomer) {
        return NextResponse.json(
          { error: "Customer with this email already exists in your business" },
          { status: 400 }
        );
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: id },
      data: {
        email: email?.trim() || null,
        name: name.trim(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        country: country || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zipCode: zipCode?.trim() || null
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a customer from the current business
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the business for the current user
    const business = await prisma.business.findFirst({
      where: { 
        owner: {
          clerkId: user.id
        }
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Security logging
    console.log(`[SECURITY] User ${user.id} (${user.emailAddresses[0].emailAddress}) attempting to delete customer ${id} for business ${business.id} (${business.name})`);

    // Verify that the customer actually belongs to this business
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: id,
        businessId: business.id
      }
    });

    if (!existingCustomer) {
      console.log(`[SECURITY] Access denied: Customer ${id} does not belong to business ${business.id}`);
      return NextResponse.json(
        { error: "Customer not found or does not belong to this business" },
        { status: 404 }
      );
    }

    console.log(`[SECURITY] Customer ${id} verified to belong to business ${business.id}, proceeding with deletion`);

    // Use a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // First, delete all appointments (bookings) for this customer from this business only
      await tx.booking.deleteMany({
        where: {
          customerId: id
        }
      });

      // Then delete the customer
      await tx.customer.delete({
        where: { id: id }
      });
    });

    return NextResponse.json({ message: "Customer and all related appointments deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 