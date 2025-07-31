import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/nextauth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      where: { id: params.id, service: { businessId: business.id } },
      include: { service: true, user: true, teamMember: true }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const service = await prisma.service.findFirst({ where: { id: serviceId, businessId: business.id } });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const customer = await prisma.user.findUnique({ where: { id: customerId } });
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

    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

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
        userId: customerId, 
        serviceId: serviceId, 
        teamMemberId: providerId || null, 
        date: appointmentDate, 
        note: notes || null 
      },
      include: { user: true, service: true, teamMember: true }
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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