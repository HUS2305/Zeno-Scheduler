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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown && !(event.target as Element).closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

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
    <div className={`${isCollapsed ? 'w-16' : 'w-56'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <Link href="/dashboard" className="text-center hover:opacity-80 transition-opacity cursor-pointer">
                <h1 className="text-2xl font-bold text-gray-900 leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Zeno</h1>
                <h2 className="text-sm font-normal text-gray-700 leading-none" style={{ fontFamily: 'var(--font-racing-sans-one)' }}>Scheduler</h2>
              </Link>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
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
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-2 py-1.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white text-black border border-black"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              {item.icon()}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 space-y-6">
        {/* Copy Booking Page URL */}
        {business.slug && (
          <button
            onClick={() => {
              const url = `${window.location.origin}/b/${business.slug}`;
              navigator.clipboard.writeText(url);
              // You could add a toast notification here
            }}
            className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-center space-x-2'} text-xs text-black hover:text-gray-700 cursor-pointer w-full transition-colors`}
            title={isCollapsed ? "Copy Booking Page URL" : undefined}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {!isCollapsed && <span>Copy Booking Page URL</span>}
          </button>
        )}


        {/* Help & Support */}
        <button
          onClick={() => setShowHelpModal(true)}
          className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-center space-x-2'} text-xs text-black hover:text-gray-700 cursor-pointer w-full transition-colors`}
          title={isCollapsed ? "Help & Support" : undefined}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {!isCollapsed && <span>Help & Support</span>}
        </button>

        {/* User Profile */}
        <div className="relative profile-dropdown-container">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-2'} pt-2 border-t border-gray-200 w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors`}
          >
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {displayName[0] || "U"}
              </span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {teamMember ? getRoleDisplayName(teamMember.role) : 'Business Owner'}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className={`absolute bottom-full left-0 ${isCollapsed ? 'w-40' : 'w-full'} bg-white border border-gray-200 rounded-lg shadow-lg mb-2 z-50`}>
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Your Profile
                </Link>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowSignOutModal(true);
                  }}
                  className="flex items-center w-full px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <svg className="w-3 h-3 mr-2 text-gray-500 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Help & Support</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">
                  Need help with your Zeno Scheduler? Our support team is here to assist you.
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> support@zenoscheduler.com
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Response Time:</strong> Within 24 hours
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sure you want to log out?</h3>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSignOutModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSignOutModal(false);
                    handleSignOut();
                  }}
                  className="px-3 py-1.5 bg-black text-white text-xs rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Yes, log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 