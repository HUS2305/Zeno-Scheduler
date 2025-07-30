import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/nextauth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch customers (users who have made bookings)
export async function GET(request: NextRequest) {
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

    // Get all customers (users) - not just those with bookings
    const customers = await prisma.user.findMany({
      include: {
        bookings: {
          where: {
            service: {
              businessId: business.id
            }
          },
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

    console.log("Returning customers:", customers.map((c: any) => ({ id: c.id, name: c.name, phone: c.phone, email: c.email })));
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new customer (user)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

      // Check if user with this email already exists
      const existingUser = await prisma.user.findFirst({
        where: { email: email.trim() }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Create new user (customer)
    const customerData: any = {
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
    // If no email provided, don't include email field at all
    // This will let Prisma handle it as undefined/null

    const customer = await prisma.user.create({
      data: customerData
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 