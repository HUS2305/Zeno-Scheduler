import { TeamMemberRole, PermissionAction } from '@prisma/client';
import { 
  roleHasPermission, 
  getPermissionsForRole, 
  canManageRole,
  getAssignableRoles,
  getRoleDisplayName,
  getRoleDescription,
  getRoleColor,
  isElevatedRole,
  isAdminRole,
  isOwnerRole
} from './permissions';

/**
 * Test script to verify the permission system is working correctly
 * Run this with: npx tsx src/lib/test-permissions.ts
 */

console.log('🔐 Testing Permission System...\n');

// Test 1: Role Permission Matrix
console.log('📋 Test 1: Role Permission Matrix');
Object.values(TeamMemberRole).forEach(role => {
  const permissions = getPermissionsForRole(role);
  console.log(`${role}: ${permissions.length} permissions`);
  permissions.forEach(permission => {
    console.log(`  ✅ ${permission}`);
  });
  console.log('');
});

// Test 2: Permission Checking
console.log('🔍 Test 2: Permission Checking');
const testPermissions = [
  PermissionAction.VIEW_OWN_CALENDAR,
  PermissionAction.MANAGE_TEAM_MEMBERS,
  PermissionAction.VIEW_BUSINESS_SETTINGS,
  PermissionAction.SYSTEM_CONFIGURATION
];

Object.values(TeamMemberRole).forEach(role => {
  console.log(`${role} role permissions:`);
  testPermissions.forEach(permission => {
    const hasPermission = roleHasPermission(role, permission);
    console.log(`  ${hasPermission ? '✅' : '❌'} ${permission}`);
  });
  console.log('');
});

// Test 3: Role Management
console.log('👥 Test 3: Role Management');
Object.values(TeamMemberRole).forEach(role => {
  const assignableRoles = getAssignableRoles(role);
  console.log(`${role} can assign: ${assignableRoles.join(', ')}`);
  
  Object.values(TeamMemberRole).forEach(targetRole => {
    const canManage = canManageRole(role, targetRole);
    console.log(`  ${canManage ? '✅' : '❌'} Can manage ${targetRole}`);
  });
  console.log('');
});

// Test 4: Role Utilities
console.log('🛠️ Test 4: Role Utilities');
Object.values(TeamMemberRole).forEach(role => {
  console.log(`${role}:`);
  console.log(`  Display Name: ${getRoleDisplayName(role)}`);
  console.log(`  Description: ${getRoleDescription(role)}`);
  console.log(`  Color: ${getRoleColor(role)}`);
  console.log(`  Elevated: ${isElevatedRole(role)}`);
  console.log(`  Admin Level: ${isAdminRole(role)}`);
  console.log(`  Owner: ${isOwnerRole(role)}`);
  console.log('');
});

// Test 5: Permission Validation
console.log('✅ Test 5: Permission Validation');
const allPermissions = Object.values(PermissionAction);
console.log(`Total permissions defined: ${allPermissions.length}`);

// Check if all permissions are assigned to at least one role
const unassignedPermissions: PermissionAction[] = [];
allPermissions.forEach(permission => {
  let assigned = false;
  Object.values(TeamMemberRole).forEach(role => {
    if (roleHasPermission(role, permission)) {
      assigned = true;
    }
  });
  if (!assigned) {
    unassignedPermissions.push(permission);
  }
});

if (unassignedPermissions.length === 0) {
  console.log('✅ All permissions are assigned to at least one role');
} else {
  console.log('❌ Unassigned permissions found:');
  unassignedPermissions.forEach(permission => {
    console.log(`  ${permission}`);
  });
}

console.log('\n🎉 Permission system test completed!');

// Export for use in other tests
export {
  testPermissions,
  allPermissions,
  unassignedPermissions
};
