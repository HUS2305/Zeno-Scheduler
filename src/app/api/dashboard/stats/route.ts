import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/nextauth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
    }

    // Verify the business belongs to the current user
    const business = await prisma.business.findFirst({
      where: { 
        id: businessId,
        ownerId: session.user.id 
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get today's date and week range
    const today = new Date();
    const startOfWeek = new Date(today);
    // Adjust to start week on Monday (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, subtract 6 to get to Monday
    startOfWeek.setDate(today.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get today's bookings
    const todayBookings = await prisma.booking.findMany({
      where: {
        service: {
          businessId: business.id,
        },
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        },
      },
      include: {
        service: true,
      },
    });

    // Get this week's bookings
    const weekBookings = await prisma.booking.findMany({
      where: {
        service: {
          businessId: business.id,
        },
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      include: {
        service: true,
      },
    });

    // Get active services count
    const activeServices = await prisma.service.count({
      where: {
        businessId: business.id,
      },
    });

    // Get team members count
    const teamMembers = await prisma.teamMember.count({
      where: {
        businessId: business.id,
      },
    });

    // Calculate revenue
    const todayRevenue = todayBookings.reduce((sum, booking) => sum + (booking.service.price || 0), 0);
    const weekRevenue = weekBookings.reduce((sum, booking) => sum + (booking.service.price || 0), 0);

    const stats = {
      todayBookings: todayBookings.length,
      todayRevenue,
      weekBookings: weekBookings.length,
      weekRevenue,
      activeServices,
      teamMembers,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 