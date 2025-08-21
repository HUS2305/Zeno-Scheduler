'use client';

import { TeamMemberRole, TeamMemberStatus } from '@prisma/client';
import { getRoleDisplayName, getRoleColor } from '@/lib/permissions';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joinedAt?: Date;
  lastActiveAt?: Date;
}

interface TeamInvitation {
  id: string;
  email: string;
  name: string;
  role: TeamMemberRole;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
}

interface TeamAnalyticsProps {
  teamMembers: TeamMember[];
  teamInvitations: TeamInvitation[];
  businessName: string;
}

export default function TeamAnalytics({ teamMembers, teamInvitations, businessName }: TeamAnalyticsProps) {
  // Calculate statistics
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(m => m.status === 'ACTIVE').length;
  const pendingInvitations = teamInvitations.filter(i => !i.acceptedAt && i.expiresAt > new Date()).length;
  const expiredInvitations = teamInvitations.filter(i => !i.acceptedAt && i.expiresAt <= new Date()).length;
  
  // Role distribution
  const roleDistribution = Object.values(TeamMemberRole).reduce((acc, role) => {
    acc[role] = teamMembers.filter(m => m.role === role).length;
    return acc;
  }, {} as Record<TeamMemberRole, number>);

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentMembers = teamMembers.filter(m => 
    m.joinedAt && m.joinedAt >= thirtyDaysAgo
  ).length;

  const recentInvitations = teamInvitations.filter(i => 
    i.createdAt >= thirtyDaysAgo
  ).length;

  // Status breakdown
  const statusBreakdown = {
    ACTIVE: teamMembers.filter(m => m.status === 'ACTIVE').length,
    INACTIVE: teamMembers.filter(m => m.status === 'INACTIVE').length,
    PENDING: teamMembers.filter(m => m.status === 'PENDING').length,
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Members</p>
              <p className="text-2xl font-semibold text-gray-900">{activeMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Invitations</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingInvitations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent Activity</p>
              <p className="text-2xl font-semibold text-gray-900">{recentMembers + recentInvitations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {Object.entries(roleDistribution).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: getRoleColor(role as TeamMemberRole) + '20', 
                      color: getRoleColor(role as TeamMemberRole) 
                    }}
                  >
                    {getRoleDisplayName(role as TeamMemberRole)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Member Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(statusBreakdown.ACTIVE / totalMembers) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{statusBreakdown.ACTIVE}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inactive</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(statusBreakdown.INACTIVE / totalMembers) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{statusBreakdown.INACTIVE}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(statusBreakdown.PENDING / totalMembers) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{statusBreakdown.PENDING}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invitation Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invitation Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{pendingInvitations}</div>
            <div className="text-sm text-green-600">Pending</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {teamInvitations.filter(i => i.acceptedAt).length}
            </div>
            <div className="text-sm text-blue-600">Accepted</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{expiredInvitations}</div>
            <div className="text-sm text-red-600">Expired</div>
          </div>
        </div>
      </div>

      {/* Business Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
        <h3 className="text-lg font-medium mb-2">Business Summary</h3>
        <p className="text-blue-100 mb-4">
          {businessName} currently has {totalMembers} team members with {pendingInvitations} pending invitations.
        </p>
        <div className="text-sm text-blue-200">
          <p>• {activeMembers} members are currently active</p>
          <p>• {recentMembers} new members joined in the last 30 days</p>
          <p>• {recentInvitations} invitations sent in the last 30 days</p>
        </div>
      </div>
    </div>
  );
}



