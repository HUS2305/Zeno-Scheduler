"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Services", href: "/dashboard/services" },
  { name: "Settings", href: "/dashboard/settings" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback redirect
      window.location.href = "/";
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Zeno Scheduler
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 