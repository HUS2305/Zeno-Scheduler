import prisma from './prisma';
import { TeamMemberRole, TeamMemberStatus, PermissionAction } from '@prisma/client';
import { getPermissionsForRole } from './permissions';
import { randomBytes } from 'crypto';

// Interface for creating a team member
export interface CreateTeamMemberData {
  name: string;
  email: string;
  phone?: string;
  role: TeamMemberRole;
  businessId: string;
  invitedBy: string;
  message?: string;
}

// Interface for updating a team member
export interface UpdateTeamMemberData {
  name?: string;
  phone?: string;
  role?: TeamMemberRole;
  status?: TeamMemberStatus;
  bio?: string;
  profilePic?: string;
}

// Interface for team member with permissions
export interface TeamMemberWithPermissions {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  businessId: string;
  userId?: string;
  profilePic?: string;
  bio?: string;
  invitedAt: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  permissions: PermissionAction[];
}

/**
 * Create a new team member invitation
 */
export async function createTeamMemberInvitation(data: CreateTeamMemberData): Promise<{
  success: boolean;
  invitation?: any;
  error?: string;
}> {
  try {
    // Check if team member already exists
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        email: data.email,
        businessId: data.businessId,
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: 'Team member with this email already exists',
      };
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create team member invitation
    const invitation = await prisma.teamInvitation.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        businessId: data.businessId,
        invitedBy: data.invitedBy,
        token: token,
        expiresAt: expiresAt,
        message: data.message,
      },
    });

    return {
      success: true,
      invitation: invitation,
    };
  } catch (error) {
    console.error('Error creating team member invitation:', error);
    return {
      success: false,
      error: 'Failed to create team member invitation',
    };
  }
}

/**
 * Accept team member invitation
 */
export async function acceptTeamMemberInvitation(
  token: string,
  userId: string
): Promise<{
  success: boolean;
  teamMember?: any;
  error?: string;
}> {
  try {
    // Find invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: { business: true },
    });

    if (!invitation) {
      return {
        success: false,
        error: 'Invalid invitation token',
      };
    }

    if (invitation.expiresAt < new Date()) {
      return {
        success: false,
        error: 'Invitation has expired',
      };
    }

    if (invitation.acceptedAt) {
      return {
        success: false,
        error: 'Invitation has already been accepted',
      };
    }

    // Create or update team member
    let teamMember = await prisma.teamMember.findFirst({
      where: {
        email: invitation.email,
        businessId: invitation.businessId,
      },
    });

    if (teamMember) {
      // Update existing team member
      teamMember = await prisma.teamMember.update({
        where: { id: teamMember.id },
        data: {
          status: TeamMemberStatus.PENDING,
          userId: userId,
          joinedAt: new Date(),
          invitationToken: null,
          invitationExpiresAt: null,
        },
      });
    } else {
      // Create new team member
      teamMember = await prisma.teamMember.create({
        data: {
          name: invitation.name,
          email: invitation.email,
          role: invitation.role,
          status: TeamMemberStatus.PENDING,
          businessId: invitation.businessId,
          userId: userId,
          joinedAt: new Date(),
        },
      });
    }

    // Update invitation
    await prisma.teamInvitation.update({
      where: { token },
      data: {
        acceptedAt: new Date(),
        acceptedBy: teamMember.id,
      },
    });

    // Create default permissions for the role
    await createDefaultPermissionsForRole(teamMember.id, teamMember.role);

    return {
      success: true,
      teamMember,
    };
  } catch (error) {
    console.error('Error accepting team member invitation:', error);
    return {
      success: false,
      error: 'Failed to accept invitation',
    };
  }
}

/**
 * Create default permissions for a team member based on their role
 */
async function createDefaultPermissionsForRole(
  teamMemberId: string,
  role: TeamMemberRole
): Promise<void> {
  try {
    const permissions = getPermissionsForRole(role);
    
    // Create permission records
    const permissionData = permissions.map(action => ({
      teamMemberId,
      action,
    }));

    await prisma.teamMemberPermission.createMany({
      data: permissionData,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('Error creating default permissions:', error);
  }
}

/**
 * Update team member
 */
export async function updateTeamMember(
  teamMemberId: string,
  data: UpdateTeamMemberData,
  updatedBy: string
): Promise<{
  success: boolean;
  teamMember?: any;
  error?: string;
}> {
  try {
    // Get current team member
    const currentMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      include: { permissions: true },
    });

    if (!currentMember) {
      return {
        success: false,
        error: 'Team member not found',
      };
    }

    // Update team member
    const updatedMember = await prisma.teamMember.update({
      where: { id: teamMemberId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { permissions: true },
    });

    // If role changed, update permissions
    if (data.role && data.role !== currentMember.role) {
      await updateTeamMemberPermissions(teamMemberId, data.role);
    }

    // Log the change
    await logTeamMemberChange(updatedBy, teamMemberId, currentMember, updatedMember);

    return {
      success: true,
      teamMember: updatedMember,
    };
  } catch (error) {
    console.error('Error updating team member:', error);
    return {
      success: false,
      error: 'Failed to update team member',
    };
  }
}

/**
 * Update team member permissions based on new role
 */
async function updateTeamMemberPermissions(
  teamMemberId: string,
  newRole: TeamMemberRole
): Promise<void> {
  try {
    // Remove existing permissions
    await prisma.teamMemberPermission.deleteMany({
      where: { teamMemberId },
    });

    // Create new permissions for the role
    await createDefaultPermissionsForRole(teamMemberId, newRole);
  } catch (error) {
    console.error('Error updating team member permissions:', error);
  }
}

/**
 * Get team member with permissions
 */
export async function getTeamMemberWithPermissions(
  teamMemberId: string
): Promise<TeamMemberWithPermissions | null> {
  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      include: { permissions: true },
    });

    if (!teamMember) return null;

    return {
      ...teamMember,
      permissions: teamMember.permissions.map(p => p.action),
    };
  } catch (error) {
    console.error('Error getting team member with permissions:', error);
    return null;
  }
}

/**
 * Get all team members for a business
 */
export async function getBusinessTeamMembers(
  businessId: string
): Promise<TeamMemberWithPermissions[]> {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: { businessId },
      include: { permissions: true },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return teamMembers.map(member => ({
      ...member,
      permissions: member.permissions.map(p => p.action),
    }));
  } catch (error) {
    console.error('Error getting business team members:', error);
    return [];
  }
}

/**
 * Remove team member
 */
export async function removeTeamMember(
  teamMemberId: string,
  removedBy: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get team member before deletion
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
    });

    if (!teamMember) {
      return {
        success: false,
        error: 'Team member not found',
      };
    }

    // Delete team member (this will cascade to permissions)
    await prisma.teamMember.delete({
      where: { id: teamMemberId },
    });

    // Log the removal
    await logTeamMemberRemoval(removedBy, teamMember);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error removing team member:', error);
    return {
      success: false,
      error: 'Failed to remove team member',
    };
  }
}

/**
 * Log team member changes for audit purposes
 */
async function logTeamMemberChange(
  updatedBy: string,
  teamMemberId: string,
  oldData: any,
  newData: any
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        businessId: oldData.businessId,
        action: 'TEAM_MEMBER_UPDATED',
        resourceType: 'TeamMember',
        resourceId: teamMemberId,
        oldValues: oldData,
        newValues: newData,
        performedBy: updatedBy,
        description: `Team member ${oldData.name} was updated`,
      },
    });
  } catch (error) {
    console.error('Error logging team member change:', error);
  }
}

/**
 * Log team member removal for audit purposes
 */
async function logTeamMemberRemoval(
  removedBy: string,
  teamMember: any
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        businessId: teamMember.businessId,
        action: 'TEAM_MEMBER_REMOVED',
        resourceType: 'TeamMember',
        resourceId: teamMember.id,
        oldValues: teamMember,
        performedBy: removedBy,
        description: `Team member ${teamMember.name} was removed`,
      },
    });
  } catch (error) {
    console.error('Error logging team member removal:', error);
  }
}

/**
 * Check if a team member has a specific permission
 */
export async function checkTeamMemberPermission(
  teamMemberId: string,
  permission: PermissionAction
): Promise<boolean> {
  try {
    const permissionRecord = await prisma.teamMemberPermission.findUnique({
      where: {
        teamMemberId_action: {
          teamMemberId,
          action: permission,
        },
      },
    });

    return !!permissionRecord;
  } catch (error) {
    console.error('Error checking team member permission:', error);
    return false;
  }
}

/**
 * Get team member status display name
 */
export function getStatusDisplayName(status: TeamMemberStatus): string {
  const statusNames = {
    [TeamMemberStatus.INVITED]: 'Invited',
    [TeamMemberStatus.PENDING]: 'Pending',
    [TeamMemberStatus.ACTIVE]: 'Active',
    [TeamMemberStatus.SUSPENDED]: 'Suspended',
  };

  return statusNames[status] || status;
}

/**
 * Get team member status color (for UI)
 */
export function getStatusColor(status: TeamMemberStatus): string {
  const statusColors = {
    [TeamMemberStatus.INVITED]: '#F59E0B',    // Amber
    [TeamMemberStatus.PENDING]: '#3B82F6',    // Blue
    [TeamMemberStatus.ACTIVE]: '#10B981',     // Green
    [TeamMemberStatus.SUSPENDED]: '#EF4444',  // Red
  };

  return statusColors[status] || '#6B7280';
}
