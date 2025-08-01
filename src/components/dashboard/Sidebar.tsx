"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: "📊" },
  { name: "Services", href: "/dashboard/services", icon: "📋" },
  { name: "Customers", href: "/dashboard/customers", icon: "😊" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [displayName, setDisplayName] = useState(session?.user?.name || session?.user?.email || "User");

  useEffect(() => {
    // Update display name when session changes
    setDisplayName(session?.user?.name || session?.user?.email || "User");
  }, [session?.user?.name, session?.user?.email]);

  useEffect(() => {
    // Listen for profile update events
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail?.name) {
        setDisplayName(event.detail.name);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">Z</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Zeno Scheduler</h1>
            <p className="text-xs text-gray-500">Appointment Booking</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 space-y-3">
        {/* Share Booking Page */}
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="flex items-center space-x-2 text-xs text-blue-700">
            <span>📤</span>
            <span>Share your Booking Page</span>
          </div>
        </div>

        {/* Pro Upgrade */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <h3 className="text-xs font-medium text-green-800 mb-1">
            Unlock next-level booking
          </h3>
          <button className="w-full bg-green-600 text-white text-xs py-1.5 px-2 rounded-md hover:bg-green-700 transition-colors">
            Get Pro
          </button>
          <p className="text-xs text-green-600 mt-1">Learn more</p>
        </div>

        {/* Help & Support */}
        <div className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
          <span>❓</span>
          <span>Help & Support</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">
              {displayName[0] || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">Business Owner</p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-xs">🚪</span>
          </button>
        </div>
      </div>
    </div>
  );
} 