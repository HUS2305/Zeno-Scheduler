"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface DashboardStatsProps {
  businessId: string;
  onStatsUpdated?: () => void;
}

interface Stats {
  todayBookings: number;
  todayRevenue: number;
  weekBookings: number;
  weekRevenue: number;
  activeServices: number;
  teamMembers: number;
}

export default function DashboardStats({ businessId, onStatsUpdated }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    todayRevenue: 0,
    weekBookings: 0,
    weekRevenue: 0,
    activeServices: 0,
    teamMembers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const fetchStatsRef = useRef<() => Promise<void>>();

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?businessId=${businessId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Error fetching stats:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Store the current fetchStats function in a ref
  fetchStatsRef.current = fetchStats;

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Listen for appointment changes
  useEffect(() => {
    const handleAppointmentChange = () => {
      fetchStatsRef.current?.();
      onStatsUpdated?.();
    };

    // Add event listener for appointment changes
    window.addEventListener('appointment-changed', handleAppointmentChange);
    
    return () => {
      window.removeEventListener('appointment-changed', handleAppointmentChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
              <p className="text-sm text-gray-500">${stats.todayRevenue.toFixed(2)} revenue</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.weekBookings}</p>
              <p className="text-sm text-gray-500">${stats.weekRevenue.toFixed(2)} revenue</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Services */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeServices}</p>
              <p className="text-sm text-gray-500">{stats.teamMembers} team members</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
  );
}