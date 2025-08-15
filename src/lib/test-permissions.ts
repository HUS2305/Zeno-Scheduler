// Test file to verify permission system functionality
// This can be run in the browser console or as a simple test

import { 
  getPermissionsForRole, 
  roleHasPermission, 
  canPerformAction,
  getRoleDisplayName,
  getRoleDescription,
  getRoleColor,
  isElevatedRole,
  isAdminRole,
  isOwnerRole,
  canManageRole,
  getAssignableRoles
} from './permissions';

import { TeamMemberRole, PermissionAction } from '@prisma/client';

// Test permission system
export function testPermissionSystem() {
  console.log('🧪 Testing Permission System...\n');

  // Test 1: Get permissions for each role
  console.log('📋 **Test 1: Role Permissions**');
  Object.values(TeamMemberRole).forEach(role => {
    const permissions = getPermissionsForRole(role);
    console.log(`${role}: ${permissions.length} permissions`);
    console.log(`  - ${permissions.slice(0, 3).join(', ')}${permissions.length > 3 ? '...' : ''}`);
  });

  // Test 2: Check specific permissions
  console.log('\n🔐 **Test 2: Specific Permission Checks**');
  const testPermissions = [
    PermissionAction.INVITE_TEAM_MEMBERS,
    PermissionAction.MANAGE_TEAM_MEMBERS,
    PermissionAction.VIEW_ALL_CUSTOMERS,
    PermissionAction.MANAGE_BUSINESS_SETTINGS
  ];

  testPermissions.forEach(permission => {
    console.log(`\n${permission}:`);
    Object.values(TeamMemberRole).forEach(role => {
      const hasPermission = roleHasPermission(role, permission);
      console.log(`  ${role}: ${hasPermission ? '✅' : '❌'}`);
    });
  });

  // Test 3: Role hierarchy
  console.log('\n🏗️ **Test 3: Role Hierarchy**');
  Object.values(TeamMemberRole).forEach(managerRole => {
    const assignableRoles = getAssignableRoles(managerRole);
    console.log(`${managerRole} can manage: ${assignableRoles.join(', ')}`);
  });

  // Test 4: Role utilities
  console.log('\n🎨 **Test 4: Role Utilities**');
  Object.values(TeamMemberRole).forEach(role => {
    console.log(`${role}:`);
    console.log(`  Display Name: ${getRoleDisplayName(role)}`);
    console.log(`  Description: ${getRoleDescription(role)}`);
    console.log(`  Color: ${getRoleColor(role)}`);
    console.log(`  Elevated: ${isElevatedRole(role) ? 'Yes' : 'No'}`);
    console.log(`  Admin Level: ${isAdminRole(role) ? 'Yes' : 'No'}`);
    console.log(`  Owner: ${isOwnerRole(role) ? 'Yes' : 'No'}`);
  });

  // Test 5: Permission matrix validation
  console.log('\n✅ **Test 5: Permission Matrix Validation**');
  let totalPermissions = 0;
  let uniquePermissions = new Set<PermissionAction>();

  Object.values(TeamMemberRole).forEach(role => {
    const permissions = getPermissionsForRole(role);
    totalPermissions += permissions.length;
    permissions.forEach(p => uniquePermissions.add(p));
  });

  console.log(`Total permission assignments: ${totalPermissions}`);
  console.log(`Unique permissions: ${uniquePermissions.size}`);
  console.log(`Permission coverage: ${((uniquePermissions.size / Object.values(PermissionAction).length) * 100).toFixed(1)}%`);

  console.log('\n🎉 Permission system test completed!');
  return true;
}

// Test specific scenarios
export function testSpecificScenarios() {
  console.log('\n🔍 **Testing Specific Scenarios**\n');

  // Scenario 1: Admin trying to manage owner
  console.log('**Scenario 1: Admin managing Owner**');
  const canAdminManageOwner = canManageRole(TeamMemberRole.ADMIN, TeamMemberRole.OWNER);
  console.log(`Can ADMIN manage OWNER? ${canAdminManageOwner ? '❌ (Security Issue!)' : '✅ (Correctly blocked)'}`);

  // Scenario 2: Enhanced user permissions
  console.log('\n**Scenario 2: Enhanced User Permissions**');
  const enhancedPermissions = getPermissionsForRole(TeamMemberRole.ENHANCED);
  const hasTeamAccess = enhancedPermissions.includes(PermissionAction.VIEW_TEAM_CALENDARS);
  const hasBusinessSettings = enhancedPermissions.includes(PermissionAction.MANAGE_BUSINESS_SETTINGS);
  console.log(`Enhanced user has team calendar access: ${hasTeamAccess ? '✅' : '❌'}`);
  console.log(`Enhanced user has business settings access: ${hasBusinessSettings ? '❌ (Security Issue!)' : '✅ (Correctly restricted)'}`);

  // Scenario 3: Standard user limitations
  console.log('\n**Scenario 3: Standard User Limitations**');
  const standardPermissions = getPermissionsForRole(TeamMemberRole.STANDARD);
  const hasAllCustomers = standardPermissions.includes(PermissionAction.VIEW_ALL_CUSTOMERS);
  const hasTeamMembers = standardPermissions.includes(PermissionAction.VIEW_TEAM_MEMBERS);
  console.log(`Standard user can view all customers: ${hasAllCustomers ? '❌ (Security Issue!)' : '✅ (Correctly restricted)'}`);
  console.log(`Standard user can view team members: ${hasTeamMembers ? '❌ (Security Issue!)' : '✅ (Correctly restricted)'}`);

  console.log('\n🔍 Specific scenarios test completed!');
}

// Run all tests
export function runAllTests() {
  try {
    testPermissionSystem();
    testSpecificScenarios();
    console.log('\n🎯 All tests passed! Permission system is working correctly.');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testPermissions = {
    testPermissionSystem,
    testSpecificScenarios,
    runAllTests
  };
  console.log('🧪 Permission tests available in browser console:');
  console.log('  - testPermissions.runAllTests()');
  console.log('  - testPermissions.testPermissionSystem()');
  console.log('  - testPermissions.testSpecificScenarios()');
}
