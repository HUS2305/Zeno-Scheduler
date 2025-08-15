import { PermissionAction, TeamMemberRole } from '@prisma/client';

// Define permissions for each role individually to avoid circular references
const STANDARD_PERMISSIONS = [
  // Calendar & Appointments
  PermissionAction.VIEW_OWN_CALENDAR,
  PermissionAction.MANAGE_OWN_APPOINTMENTS,
  
  // Customer Management
  PermissionAction.VIEW_OWN_CUSTOMERS,
  PermissionAction.MANAGE_OWN_CUSTOMERS,
];

const ENHANCED_PERMISSIONS = [
  // Standard permissions
  ...STANDARD_PERMISSIONS,
  
  // Additional team-wide access
  PermissionAction.VIEW_TEAM_CALENDARS,
  PermissionAction.MANAGE_TEAM_APPOINTMENTS,
  PermissionAction.VIEW_ALL_CUSTOMERS,
  PermissionAction.MANAGE_ALL_CUSTOMERS,
  PermissionAction.VIEW_TEAM_MEMBERS,
];

const ADMIN_PERMISSIONS = [
  // Enhanced permissions
  ...ENHANCED_PERMISSIONS,
  
  // Business management
  PermissionAction.VIEW_BUSINESS_SETTINGS,
  PermissionAction.MANAGE_SERVICES,
  PermissionAction.MANAGE_CATEGORIES,
  PermissionAction.MANAGE_OPENING_HOURS,
  PermissionAction.INVITE_TEAM_MEMBERS,
  PermissionAction.MANAGE_TEAM_MEMBERS,
  PermissionAction.VIEW_REPORTS,
  PermissionAction.VIEW_FINANCIAL_DATA,
  PermissionAction.EXPORT_DATA,
];

// Permission Matrix: Defines what each role can do
export const PERMISSION_MATRIX: Record<TeamMemberRole, PermissionAction[]> = {
  STANDARD: STANDARD_PERMISSIONS,
  ENHANCED: ENHANCED_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  OWNER: Object.values(PermissionAction), // All permissions
};

// Helper function to get all permissions for a role
export function getPermissionsForRole(role: TeamMemberRole): PermissionAction[] {
  return PERMISSION_MATRIX[role] || [];
}

// Helper function to check if a role has a specific permission
export function roleHasPermission(role: TeamMemberRole, permission: PermissionAction): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

// Helper function to check if a role can perform an action
export function canPerformAction(role: TeamMemberRole, action: PermissionAction): boolean {
  return roleHasPermission(role, action);
}

// Helper function to get the minimum role required for a permission
export function getMinimumRoleForPermission(permission: PermissionAction): TeamMemberRole {
  for (const [role, permissions] of Object.entries(PERMISSION_MATRIX)) {
    if (permissions.includes(permission)) {
      return role as TeamMemberRole;
    }
  }
  return TeamMemberRole.OWNER; // Default to highest restriction
}

// Helper function to check if a role can manage another role
export function canManageRole(managerRole: TeamMemberRole, targetRole: TeamMemberRole): boolean {
  const roleHierarchy = {
    [TeamMemberRole.STANDARD]: 1,
    [TeamMemberRole.ENHANCED]: 2,
    [TeamMemberRole.ADMIN]: 3,
    [TeamMemberRole.OWNER]: 4,
  };
  
  return roleHierarchy[managerRole] > roleHierarchy[targetRole];
}

// Helper function to get all roles that can be assigned by a given role
export function getAssignableRoles(assignerRole: TeamMemberRole): TeamMemberRole[] {
  const allRoles = Object.values(TeamMemberRole);
  
  return allRoles.filter(role => canManageRole(assignerRole, role));
}

// Helper function to check if a role can invite team members
export function canInviteTeamMembers(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.INVITE_TEAM_MEMBERS);
}

// Helper function to check if a role can manage team members
export function canManageTeamMembers(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.MANAGE_TEAM_MEMBERS);
}

// Helper function to check if a role can view all calendars
export function canViewAllCalendars(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.VIEW_ALL_CALENDARS);
}

// Helper function to check if a role can manage all appointments
export function canManageAllAppointments(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.MANAGE_ALL_APPOINTMENTS);
}

// Helper function to check if a role can view all customers
export function canViewAllCustomers(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.VIEW_ALL_CUSTOMERS);
}

// Helper function to check if a role can manage all customers
export function canManageAllCustomers(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.MANAGE_ALL_CUSTOMERS);
}

// Helper function to check if a role can manage business settings
export function canManageBusinessSettings(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.MANAGE_BUSINESS_SETTINGS);
}

// Helper function to check if a role can view financial data
export function canViewFinancialData(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.VIEW_FINANCIAL_DATA);
}

// Helper function to check if a role can export data
export function canExportData(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.EXPORT_DATA);
}

// Helper function to check if a role can view audit logs
export function canViewAuditLogs(role: TeamMemberRole): boolean {
  return roleHasPermission(role, PermissionAction.VIEW_AUDIT_LOGS);
}

// Helper function to get role display name
export function getRoleDisplayName(role: TeamMemberRole): string {
  const displayNames = {
    [TeamMemberRole.STANDARD]: 'Standard',
    [TeamMemberRole.ENHANCED]: 'Enhanced',
    [TeamMemberRole.ADMIN]: 'Admin',
    [TeamMemberRole.OWNER]: 'Owner',
  };
  
  return displayNames[role] || role;
}

// Helper function to get role description
export function getRoleDescription(role: TeamMemberRole): string {
  const descriptions = {
    [TeamMemberRole.STANDARD]: 'View and manage own calendar and customers',
    [TeamMemberRole.ENHANCED]: 'Standard access plus team-wide calendar and customer management',
    [TeamMemberRole.ADMIN]: 'Enhanced access plus business settings and team management',
    [TeamMemberRole.OWNER]: 'Full access to all features and settings',
  };
  
  return descriptions[role] || '';
}

// Helper function to get role color (for UI)
export function getRoleColor(role: TeamMemberRole): string {
  const colors = {
    [TeamMemberRole.STANDARD]: '#6B7280', // Gray
    [TeamMemberRole.ENHANCED]: '#3B82F6', // Blue
    [TeamMemberRole.ADMIN]: '#8B5CF6',    // Purple
    [TeamMemberRole.OWNER]: '#059669',    // Green
  };
  
  return colors[role] || '#6B7280';
}

// Helper function to check if a role is elevated (Enhanced or higher)
export function isElevatedRole(role: TeamMemberRole): boolean {
  return role === TeamMemberRole.ENHANCED || 
         role === TeamMemberRole.ADMIN || 
         role === TeamMemberRole.OWNER;
}

// Helper function to check if a role is admin level (Admin or Owner)
export function isAdminRole(role: TeamMemberRole): boolean {
  return role === TeamMemberRole.ADMIN || role === TeamMemberRole.OWNER;
}

// Helper function to check if a role is owner
export function isOwnerRole(role: TeamMemberRole): boolean {
  return role === TeamMemberRole.OWNER;
}


