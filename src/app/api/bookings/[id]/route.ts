import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/nextauth";
import prisma from "@/lib/prisma";

// PUT - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, customerId, providerId, date, time, notes, videoLink, recurrence } = await request.json();

    if (!serviceId || !customerId || !date || !time) {
      return NextResponse.json({ error: "Service, customer, date, and time are required" }, { status: 400 });
    }

    const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const existingBooking = await prisma.booking.findFirst({
      where: { id: id, service: { businessId: business.id } },
      include: { service: true, customer: true, teamMember: true }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const service = await prisma.service.findFirst({ where: { id: serviceId, businessId: business.id } });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

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

    console.log('Received data:', { serviceId, customerId, providerId, date, time, notes });
    
    // Handle both colon and dot separators in time format
    const timeSeparator = time.includes('.') ? '.' : ':';
    const [hours, minutes] = time.split(timeSeparator).map(Number);
    
    console.log('Time parsing:', { time, timeSeparator, hours, minutes });
    
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    console.log('Parsed appointment date:', appointmentDate);

    // Remove conflict checking to allow overlapping appointments
    // const conflictingBooking = await prisma.booking.findFirst({
    //   where: { 
    //     date: appointmentDate, 
    //     serviceId: serviceId, 
    //     teamMemberId: providerId || null, 
    //     id: { not: id } 
    //   }
    // });

    // if (conflictingBooking) {
    //   return NextResponse.json({ error: "There is already a booking at this time" }, { status: 400 });
    // }

    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data: { 
        customerId: customerId, // ✅ Now using customerId instead of userId
        serviceId: serviceId, 
        teamMemberId: providerId || null, 
        date: appointmentDate, 
        startTime: appointmentDate, // ✅ Required field
        endTime: new Date(appointmentDate.getTime() + service.duration * 60 * 1000), // ✅ Required field
        customerNote: notes || null // ✅ Now using customerNote instead of note
      },
      include: { customer: true, service: true, teamMember: true } // ✅ Now using customer instead of user
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// DELETE - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: id,
        service: {
          businessId: business.id
        }
      }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Delete the booking
    await prisma.booking.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 