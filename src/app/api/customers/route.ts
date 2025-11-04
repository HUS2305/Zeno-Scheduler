import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Fetch customers for the current business
export async function GET(request: NextRequest) {
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
    console.log(`[SECURITY] User ${user.id} (${user.emailAddresses[0].emailAddress}) accessing customers for business ${business.id} (${business.name})`);

    // Get customers for this business only (complete isolation)
    const customers = await prisma.customer.findMany({
      where: {
        businessId: business.id
      },
      include: {
        bookings: {
          include: {
            service: true,
            teamMember: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[SECURITY] Returning ${customers.length} customers for business ${business.id}`);
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new customer for the current business
export async function POST(request: NextRequest) {
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

    const { email, name, phone, company, country, address, city, state, zipCode } = await request.json();
    
    // Debug logging
    console.log("Received customer data:", { email, name, phone, company, country, address, city, state, zipCode });

    // Validate required fields - only name is required
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // If email is provided and not empty, validate its format
    if (email && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Check if customer with this email already exists in THIS BUSINESS
      const existingCustomer = await prisma.customer.findFirst({
        where: { 
          email: email.trim(),
          businessId: business.id
        }
      });

      if (existingCustomer) {
        return NextResponse.json(
          { error: "Customer with this email already exists in your business" },
          { status: 400 }
        );
      }
    }

    // Create new customer for THIS BUSINESS
    const customerData: any = {
      businessId: business.id, // REQUIRED - ensures business isolation
      name: name.trim(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      country: country || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      zipCode: zipCode?.trim() || null
    };

    // Only add email if it's provided and not empty
    if (email && email.trim() !== "") {
      customerData.email = email.trim();
    }

    const customer = await prisma.customer.create({
      data: customerData
    });

    console.log(`[SECURITY] Created customer ${customer.id} for business ${business.id}`);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 