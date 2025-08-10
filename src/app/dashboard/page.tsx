import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/nextauth";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import CalendarWrapper from "@/components/dashboard/CalendarWrapper";
import DashboardStats from "@/components/dashboard/DashboardStats";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get business data
  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      services: true,
      team: true,
    },
  });

  if (!business) {
    redirect("/dashboard/setup");
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

  // Get this week's bookings for calendar
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
      user: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Generate week days for calendar
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push(date);
  }

  // Group bookings by day for calendar
  const bookingsByDay = weekBookings.reduce((acc, booking) => {
    const day = new Date(booking.date).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(booking);
    return acc;
  }, {} as Record<string, typeof weekBookings>);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-600 mt-1">Your business at a glance with key metrics and upcoming appointments.</p>
      </div>

      {/* Stats Row */}
      <DashboardStats businessId={business.id} />

      {/* Interactive Calendar */}
      <CalendarWrapper />
    </div>
  );
}