import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: customerId } = await params;

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

    // Verify that the customer belongs to this business
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId: business.id
      }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found or does not belong to this business" }, { status: 404 });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range (Monday to Sunday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, subtract 6 to get to Monday
    startOfWeek.setDate(today.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    // Get customer's appointments
    const appointments = await prisma.booking.findMany({
      where: {
        customerId: customerId,
      },
      include: {
        service: true,
        teamMember: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Filter appointments for today and this week
    const todayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });

    const thisWeekAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startOfWeek && appointmentDate < endOfWeek;
    });

    return NextResponse.json({
      today: todayAppointments,
      thisWeek: thisWeekAppointments,
    });
  } catch (error) {
    console.error("Error fetching customer appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
} 