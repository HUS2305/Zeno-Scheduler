import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/nextauth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch all bookings for the business
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

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the where clause
    const whereClause: any = {
      service: {
        businessId: business.id
      }
    };

    // Add date filtering if startDate and endDate are provided
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // Get bookings for the business (filtered by date if provided)
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: true,
        service: true,
        teamMember: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, customerId, providerId, date, time, notes, videoLink, recurrence } = await request.json();

    // Validate required fields
    if (!serviceId || !customerId || !date || !time) {
      return NextResponse.json(
        { error: "Service, customer, date, and time are required" },
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

    // Validate that the service belongs to the business
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId: business.id
      }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Validate that the customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Validate that the provider exists (if provided)
    if (providerId) {
      const provider = await prisma.teamMember.findFirst({
        where: {
          id: providerId,
          businessId: business.id
        }
      });

      if (!provider) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }
    }

    // Parse the date and time
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        date: appointmentDate,
        serviceId: serviceId,
        teamMemberId: providerId || null
      }
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "There is already a booking at this time" },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: customerId,
        serviceId: serviceId,
        teamMemberId: providerId || null,
        date: appointmentDate,
        note: notes || null
      },
      include: {
        user: true,
        service: true,
        teamMember: true
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 