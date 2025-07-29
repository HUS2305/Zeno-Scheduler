import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/nextauth";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import CalendarWrapper from "@/components/dashboard/CalendarWrapper";

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
      user: true,
    },
    orderBy: {
      date: "asc",
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
      user: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Calculate metrics
  const todayRevenue = todayBookings.reduce((sum, booking) => sum + (booking.service.price || 0), 0);
  const weekRevenue = weekBookings.reduce((sum, booking) => sum + (booking.service.price || 0), 0);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Bookings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Today's Bookings</h3>
                <p className="text-2xl font-bold text-gray-900">{todayBookings.length}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">${todayRevenue.toFixed(2)} revenue</p>
        </div>

        {/* This Week's Bookings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-purple-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">This Week</h3>
                <p className="text-2xl font-bold text-gray-900">{weekBookings.length}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">${weekRevenue.toFixed(2)} revenue</p>
        </div>

        {/* Services Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{business.services.length}</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Active Services</h3>
                <p className="text-2xl font-bold text-gray-900">{business.services.length}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">{business.team.length} team members</p>
        </div>
      </div>

      {/* Interactive Calendar */}
      <CalendarWrapper
        weekBookings={weekBookings}
        bookingsByDay={bookingsByDay}
      />

      {/* Today's Bookings */}
      {todayBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.service.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${booking.service.price?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-500">30 min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 