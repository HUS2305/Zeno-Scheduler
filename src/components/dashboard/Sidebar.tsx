"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { TeamMemberRole, PermissionAction } from "@prisma/client";

// Type for team member context
interface TeamMemberContext {
  id: string;
  role: TeamMemberRole;
  businessId: string;
  status: string;
  permissions: PermissionAction[];
  business: {
    id: string;
    name: string;
    slug?: string | null;
  };
}

// Type for business
interface Business {
  id: string;
  name: string;
  slug?: string | null;
}

interface SidebarProps {
  teamMember: TeamMemberContext | null;
  business: Business;
}

const navigation = [
  { 
    name: "Overview", 
    href: "/dashboard", 
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    permission: null // Always visible
  },
  { 
    name: "Services", 
    href: "/dashboard/services", 
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    permission: PermissionAction.MANAGE_SERVICES
  },
  { 
    name: "Customers", 
    href: "/dashboard/customers", 
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    permission: PermissionAction.VIEW_OWN_CUSTOMERS
  },
  { 
    name: "Team", 
    href: "/dashboard/team", 
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    permission: PermissionAction.VIEW_TEAM_MEMBERS
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    permission: PermissionAction.VIEW_BUSINESS_SETTINGS
  },
];

export default function Sidebar({ teamMember, business }: SidebarProps) {
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

  // Check if user has permission for a navigation item
  const hasPermission = (permission: PermissionAction | null): boolean => {
    if (!permission) return true; // No permission required
    if (!teamMember) return false;
    
    // Owner has all permissions
    if (teamMember.role === TeamMemberRole.OWNER) return true;
    
    return teamMember.permissions.includes(permission);
  };

  // Filter navigation based on permissions
  const filteredNavigation = navigation.filter(item => hasPermission(item.permission));

  // Get role display name
  const getRoleDisplayName = (role: TeamMemberRole): string => {
    const roleNames = {
      [TeamMemberRole.STANDARD]: 'Standard',
      [TeamMemberRole.ENHANCED]: 'Enhanced',
      [TeamMemberRole.ADMIN]: 'Admin',
      [TeamMemberRole.OWNER]: 'Owner',
    };
    return roleNames[role] || role;
  };

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
            <p className="text-xs text-gray-500">{business.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-black border border-black"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon()}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 space-y-3">
        {/* Share Booking Page */}
        {business.slug && (
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="flex items-center space-x-2 text-xs text-blue-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>Share your Booking Page</span>
            </div>
          </div>
        )}

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
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
            <p className="text-xs text-gray-500">
              {teamMember ? getRoleDisplayName(teamMember.role) : 'Business Owner'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 