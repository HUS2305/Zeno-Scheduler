import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Create a new booking from public funnel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      businessId, 
      serviceId, 
      teamMemberId, 
      date, 
      time, 
      customerDetails 
    } = body;



    // Validate required fields
    if (!businessId || !serviceId || !date || !time || !customerDetails) {
      return NextResponse.json(
        { error: "Business ID, service ID, date, time, and customer details are required" },
        { status: 400 }
      );
    }

    // Validate that the business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        allowDoubleBooking: true
      }
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Validate that the service exists and belongs to the business
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId: businessId
      }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Validate that the team member exists and belongs to the business (if provided)
    if (teamMemberId && teamMemberId !== "undefined" && teamMemberId !== "null") {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          id: teamMemberId,
          businessId: businessId
        }
      });

      if (!teamMember) {
        return NextResponse.json({ error: "Team member not found" }, { status: 404 });
      }
    }

    // Check if customer already exists by email
    let customer = null;
    if (customerDetails.email) {
      customer = await prisma.customer.findFirst({
        where: { 
          email: customerDetails.email,
          businessId: business.id // ✅ Only check within this business
        }
      });
    }

    // If customer doesn't exist, create a new one
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          businessId: business.id, // ✅ REQUIRED - ensures business isolation
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          company: customerDetails.company,
          country: customerDetails.country,
          address: customerDetails.address,
          city: customerDetails.city,
          state: customerDetails.state,
          zipCode: customerDetails.zipCode,
        }
      });
    } else {
      // Update existing customer with new information
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerDetails.name || customer.name,
          phone: customerDetails.phone || customer.phone,
          company: customerDetails.company || customer.company,
          country: customerDetails.country || customer.country,
          address: customerDetails.address || customer.address,
          city: customerDetails.city || customer.city,
          state: customerDetails.state || customer.state,
          zipCode: customerDetails.zipCode || customer.zipCode,
        }
      });
    }

    // Parse the date and time
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Check for conflicts only if double booking is not allowed
    if (!business.allowDoubleBooking) {
      // Find all bookings for the same service on the same date
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          serviceId: serviceId,
          date: {
            gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), 0, 0, 0),
            lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1, 0, 0, 0)
          }
        },
        include: {
          service: true
        }
      });

      // Check for actual overlaps considering service duration
      const hasConflict = conflictingBookings.some(booking => {
        const bookingStart = new Date(booking.date);
        const bookingEnd = new Date(bookingStart.getTime() + booking.service.duration * 60 * 1000);
        
        // Check if there's any overlap
        return (appointmentDate < bookingEnd && 
                new Date(appointmentDate.getTime() + service.duration * 60 * 1000) > bookingStart);
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: "There is already a booking at this time" },
          { status: 400 }
        );
      }
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: serviceId,
        teamMemberId: (teamMemberId && teamMemberId !== "undefined" && teamMemberId !== "null") ? teamMemberId : null,
        date: appointmentDate,
        startTime: appointmentDate, // ✅ Required field
        endTime: new Date(appointmentDate.getTime() + service.duration * 60 * 1000), // ✅ Required field
        customerNote: customerDetails.comments || null // ✅ Now using customerNote instead of note
      },
      include: {
        customer: true,
        service: true,
        teamMember: true
      }
    });

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating public booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
