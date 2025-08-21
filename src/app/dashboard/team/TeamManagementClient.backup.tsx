'use client';

// ============================================================================
// COMPLETE ORIGINAL TEAM MANAGEMENT FUNCTIONALITY - BACKUP FOR FUTURE RESTORATION
// ============================================================================
// 
// TO RESTORE: Copy this entire file content and replace TeamManagementClient.tsx
// 

import { useState } from 'react';
import { TeamMemberRole, TeamMemberStatus } from '@prisma/client';
import { 
  getRoleDisplayName, 
  getRoleDescription, 
  getRoleColor,
  canInviteTeamMembers,
  canManageTeamMembers,
  getAssignableRoles
} from '@/lib/permissions';

import { 
  getStatusDisplayName,
  getStatusColor
} from '@/lib/team-management';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  userId?: string;
  joinedAt?: Date;
  createdAt: Date;
  permissions: Array<{ action: string }>;
}

interface TeamInvitation {
  id: string;
  email: string;
  name: string;
  role: TeamMemberRole;
  expiresAt: Date;
  createdAt: Date;
  message?: string;
  token?: string;
  invitedByUser?: {
    name?: string | null;
    email?: string | null;
  };
}

interface Business {
  id: string;
  name: string;
  teamMembers: TeamMember[];
  teamInvitations: TeamInvitation[];
}

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface TeamManagementClientProps {
  business: Business;
  currentUser: User;
  currentTeamMember: TeamMember | undefined;
}

export default function TeamManagementClient({ 
  business: initialBusiness, 
  currentUser, 
  currentTeamMember 
}: TeamManagementClientProps) {
  const [business, setBusiness] = useState(initialBusiness);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: TeamMemberRole.STANDARD as TeamMemberRole,
    message: '',
  });

  const canInvite = currentTeamMember && canInviteTeamMembers(currentTeamMember.role);
  const canManage = currentTeamMember && canManageTeamMembers(currentTeamMember.role);
  const assignableRoles = currentTeamMember ? getAssignableRoles(currentTeamMember.role) : [];

  // Function to show notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inviteForm,
          businessId: business.id,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Show success message
        showNotification('success', 'Invitation sent successfully!');
        
        // Immediately add the new invitation to the local state
        const newInvitation = {
          id: responseData.id || `temp-${Date.now()}`,
          email: inviteForm.email,
          name: inviteForm.name,
          role: inviteForm.role,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdAt: new Date(),
          message: inviteForm.message || undefined,
          invitedByUser: {
            name: currentTeamMember?.name || 'Unknown',
            email: currentTeamMember?.email || 'Unknown'
          }
        };
        
        // Update the business state immediately
        setBusiness(prev => ({
          ...prev,
          teamInvitations: [newInvitation, ...prev.teamInvitations]
        }));
        
        // Reset form and close modal
        setInviteForm({
          name: '',
          email: '',
          phone: '',
          role: TeamMemberRole.STANDARD,
          message: '',
        });
        
        setShowInviteModal(false);
      } else {
        showNotification('error', responseData.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      showNotification('error', 'Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: TeamMemberRole) => {
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      if (response.ok) {
        setShowRoleModal(false);
        setSelectedMember(null);
        
        // Update local state
        setBusiness(prev => ({
          ...prev,
          teamMembers: prev.teamMembers.map(member => 
            member.id === memberId 
              ? { ...member, role: newRole }
              : member
          )
        }));
        
        showNotification('success', 'Role updated successfully');
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('error', 'Failed to update role. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        setBusiness(prev => ({
          ...prev,
          teamMembers: prev.teamMembers.filter(member => member.id !== memberId)
        }));
        
        showNotification('success', 'Team member removed successfully');
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      showNotification('error', 'Failed to remove team member. Please try again.');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/team/invitations/${invitationId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update local state
        setBusiness(prev => ({
          ...prev,
          teamInvitations: prev.teamInvitations.filter(inv => inv.id !== invitationId)
        }));
        
        showNotification('success', 'Invitation cancelled successfully');
      } else {
        const error = await response.json();
        showNotification('error', error.error || 'Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Error canceling invitation:', error);
      showNotification('error', 'Failed to cancel invitation. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Team Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Team Overview</h2>
          {canInvite && (
            <button
              onClick={() => setShowInviteModal(true)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Invite Team Member'}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{business.teamMembers.length}</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 flex items-center">
              {business.teamInvitations.length}
              {business.teamInvitations.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  New
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">Pending Invitations</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {business.teamMembers.filter(m => m.status === 'ACTIVE').length}
            </div>
            <div className="text-sm text-gray-600">Online Members</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {business.teamMembers.length + business.teamInvitations.length}
            </div>
            <div className="text-sm text-gray-600">Total Team Size</div>
            <div className="text-xs text-gray-500 mt-1">
              {business.teamMembers.length} active + {business.teamInvitations.length} pending
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <div className="text-sm text-gray-500">
              {business.teamMembers.length} active + {business.teamInvitations.length} pending
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Active Team Members */}
              {business.teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        {member.phone && (
                          <div className="text-sm text-gray-500">{member.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: getRoleColor(member.role) + '20', color: getRoleColor(member.role) }}
                    >
                      {getRoleDisplayName(member.role)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {getRoleDescription(member.role)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: getStatusColor(member.status) + '20', color: getStatusColor(member.status) }}
                    >
                      {getStatusDisplayName(member.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Pending'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {canManage && member.id !== currentTeamMember?.id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowRoleModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {member.id === currentTeamMember?.id && (
                      <span className="text-xs text-gray-500">You</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Pending Invitations as Team Members */}
              {business.teamInvitations.map((invitation) => (
                <tr key={`inv-${invitation.id}`} className="hover:bg-gray-50 bg-yellow-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-yellow-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-yellow-700">
                            {invitation.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{invitation.name}</div>
                        <div className="text-sm text-gray-500">{invitation.email}</div>
                        <div className="text-xs text-yellow-600 font-medium">Pending Invitation</div>
                        {invitation.message && (
                          <div className="text-xs text-gray-400 mt-1 italic">
                            "{invitation.message}"
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: getRoleColor(invitation.role) + '20', color: getRoleColor(invitation.role) }}
                    >
                      {getRoleDisplayName(invitation.role)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {getRoleDescription(invitation.role)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      PENDING
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>Invited {new Date(invitation.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-yellow-600">
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {canManage && (
                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Cancel Invitation
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Team Member</h3>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as TeamMemberRole })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {assignableRoles.map((role) => (
                      <option key={role} value={role}>
                        {getRoleDisplayName(role)} - {getRoleDescription(role)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Personal message to include with the invitation..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Role</h3>
              <p className="text-sm text-gray-600 mb-4">
                Change the role for <strong>{selectedMember.name}</strong>
              </p>
              <div className="space-y-4">
                {assignableRoles.map((role) => (
                  <div key={role} className="flex items-center">
                    <input
                      type="radio"
                      id={role}
                      name="role"
                      value={role}
                      checked={role === selectedMember.role}
                      onChange={() => handleRoleChange(selectedMember.id, role)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={role} className="ml-3 block text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                          style={{ backgroundColor: getRoleColor(role) + '20', color: getRoleColor(role) }}
                        >
                          {getRoleDisplayName(role)}
                        </span>
                        <span className="text-xs text-gray-500">- {getRoleDescription(role)}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
