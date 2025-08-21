import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, serviceId, date, time } = body;

    if (!businessId || !serviceId || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse the date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    // Create start and end times for the requested slot
    const startTime = new Date(year, month - 1, day, hour, minute);
    
    // Get the service to determine duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true }
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Calculate end time based on service duration
    const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

    // Check for overlapping bookings by finding bookings for the same service on the same date
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        serviceId: serviceId,
        date: {
          gte: new Date(year, month - 1, day, 0, 0, 0),
          lt: new Date(year, month - 1, day + 1, 0, 0, 0)
        }
      },
      include: {
        service: true
      }
    });

    // Filter for actual overlaps considering service duration
    const overlappingSlots = overlappingBookings.filter(booking => {
      const bookingStart = new Date(booking.date);
      const bookingEnd = new Date(bookingStart.getTime() + booking.service.duration * 60 * 1000);
      
      // Check if there's any overlap
      return (startTime < bookingEnd && endTime > bookingStart);
    });

    const isAvailable = overlappingSlots.length === 0;

    return NextResponse.json({
      available: isAvailable,
      overlappingBookings: overlappingSlots
    });

  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
