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
      where: { id: businessId }
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
      customer = await prisma.user.findFirst({
        where: { email: customerDetails.email }
      });
    }

    // If customer doesn't exist, create a new one
    if (!customer) {
      customer = await prisma.user.create({
        data: {
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
      customer = await prisma.user.update({
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

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        date: appointmentDate,
        serviceId: serviceId,
        teamMemberId: (teamMemberId && teamMemberId !== "undefined" && teamMemberId !== "null") ? teamMemberId : null
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
        userId: customer.id,
        serviceId: serviceId,
        teamMemberId: (teamMemberId && teamMemberId !== "undefined" && teamMemberId !== "null") ? teamMemberId : null,
        date: appointmentDate,
        note: customerDetails.comments || null
      },
      include: {
        user: true,
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
