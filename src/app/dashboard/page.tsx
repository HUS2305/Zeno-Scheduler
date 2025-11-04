import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import CalendarWrapper from "@/components/dashboard/CalendarWrapper";
import DashboardStats from "@/components/dashboard/DashboardStats";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/login");
  }

  // Get business data
  let business = await prisma.business.findFirst({
    where: { 
      owner: {
        clerkId: user.id
      }
    },
    include: {
      services: true,
    },
  });

  // If no business found by clerkId, try to find by email (for existing users)
  if (!business) {
    business = await prisma.business.findFirst({
      where: { 
        owner: {
          email: user.emailAddresses[0].emailAddress
        }
      },
      include: {
        services: true,
      },
    });
  }

  if (!business) {
    redirect("/setup");
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

  // Get this week's bookings for calendar using new secure schema
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
      customer: true, // ✅ Now using customer instead of user
      teamMember: true,
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
    <div className="h-full flex flex-col p-4">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-600 mt-1">Your business at a glance with key metrics and upcoming appointments.</p>
      </div>

      {/* Stats Row */}
      <div className="flex-shrink-0">
        <DashboardStats businessId={business.id} />
      </div>

      {/* Interactive Calendar */}
      <div className="flex-1 min-h-0">
        <CalendarWrapper userProfileName={user.fullName || user.emailAddresses[0]?.emailAddress || 'User'} />
      </div>
    </div>
  );
}