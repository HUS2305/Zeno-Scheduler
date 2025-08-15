import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/nextauth';
import { PermissionAction, TeamMemberRole } from '@prisma/client';
import { prisma } from './prisma';
import { roleHasPermission } from './permissions';

// Interface for team member context
export interface TeamMemberContext {
  id: string;
  role: TeamMemberRole;
  businessId: string;
  userId?: string;
  status: string;
}

// Interface for permission check result
export interface PermissionCheckResult {
  allowed: boolean;
  teamMember?: TeamMemberContext;
  error?: string;
}

/**
 * Get team member context for the current user
 */
export async function getTeamMemberContext(userId: string, businessId: string): Promise<TeamMemberContext | null> {
  try {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: userId,
        businessId: businessId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        role: true,
        businessId: true,
        userId: true,
        status: true,
      },
    });

    return teamMember;
  } catch (error) {
    console.error('Error getting team member context:', error);
    return null;
  }
}

/**
 * Check if a team member has a specific permission
 */
export async function checkTeamMemberPermission(
  userId: string,
  businessId: string,
  requiredPermission: PermissionAction
): Promise<PermissionCheckResult> {
  try {
    // Get team member context
    const teamMember = await getTeamMemberContext(userId, businessId);
    
    if (!teamMember) {
      return {
        allowed: false,
        error: 'Team member not found or inactive',
      };
    }

    // Check if role has the required permission
    const hasPermission = roleHasPermission(teamMember.role, requiredPermission);
    
    return {
      allowed: hasPermission,
      teamMember,
      error: hasPermission ? undefined : 'Insufficient permissions',
    };
  } catch (error) {
    console.error('Error checking team member permission:', error);
    return {
      allowed: false,
      error: 'Error checking permissions',
    };
  }
}

/**
 * Middleware to protect API routes based on permissions
 */
export async function requirePermission(
  request: NextRequest,
  requiredPermission: PermissionAction
): Promise<NextResponse | null> {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business ID from request (you might need to adjust this based on your route structure)
    const businessId = request.nextUrl.searchParams.get('businessId') || 
                      request.headers.get('x-business-id') ||
                      await extractBusinessIdFromRequest(request);

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // Check permission
    const permissionResult = await checkTeamMemberPermission(
      session.user.id,
      businessId,
      requiredPermission
    );

    if (!permissionResult.allowed) {
      return NextResponse.json(
        { error: permissionResult.error || 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add team member context to request for use in route handlers
    (request as any).teamMember = permissionResult.teamMember;
    
    return null; // Continue to route handler
  } catch (error) {
    console.error('Error in permission middleware:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Middleware to require admin or owner role
 */
export async function requireAdminRole(request: NextRequest): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = request.nextUrl.searchParams.get('businessId') || 
                      request.headers.get('x-business-id') ||
                      await extractBusinessIdFromRequest(request);

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const teamMember = await getTeamMemberContext(session.user.id, businessId);
    
    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 403 });
    }

    // Check if role is admin or owner
    if (teamMember.role !== TeamMemberRole.ADMIN && teamMember.role !== TeamMemberRole.OWNER) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    (request as any).teamMember = teamMember;
    return null;
  } catch (error) {
    console.error('Error in admin role middleware:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Middleware to require owner role only
 */
export async function requireOwnerRole(request: NextRequest): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = request.nextUrl.searchParams.get('businessId') || 
                      request.headers.get('x-business-id') ||
                      await extractBusinessIdFromRequest(request);

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const teamMember = await getTeamMemberContext(session.user.id, businessId);
    
    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 403 });
    }

    // Check if role is owner
    if (teamMember.role !== TeamMemberRole.OWNER) {
      return NextResponse.json({ error: 'Owner role required' }, { status: 403 });
    }

    (request as any).teamMember = teamMember;
    return null;
  } catch (error) {
    console.error('Error in owner role middleware:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Helper function to extract business ID from request
 * This might need to be customized based on your route structure
 */
async function extractBusinessIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Try to get from URL path
    const pathParts = request.nextUrl.pathname.split('/');
    const businessIndex = pathParts.findIndex(part => part === 'business');
    if (businessIndex !== -1 && pathParts[businessIndex + 1]) {
      return pathParts[businessIndex + 1];
    }

    // Try to get from request body (for POST/PUT requests)
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const body = await request.json().catch(() => ({}));
      return body.businessId || null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get team member context from request (after middleware has run)
 */
export function getTeamMemberFromRequest(request: NextRequest): TeamMemberContext | null {
  return (request as any).teamMember || null;
}

/**
 * Check if current user is business owner
 */
export async function isBusinessOwner(userId: string, businessId: string): Promise<boolean> {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });

    return business?.ownerId === userId;
  } catch (error) {
    console.error('Error checking if user is business owner:', error);
    return false;
  }
}

/**
 * Check if current user can manage a specific team member
 */
export async function canManageTeamMember(
  managerId: string,
  targetMemberId: string,
  businessId: string
): Promise<boolean> {
  try {
    const manager = await prisma.teamMember.findFirst({
      where: { userId: managerId, businessId, status: 'ACTIVE' },
      select: { role: true },
    });

    const target = await prisma.teamMember.findFirst({
      where: { id: targetMemberId, businessId, status: 'ACTIVE' },
      select: { role: true },
    });

    if (!manager || !target) return false;

    // Import role hierarchy from permissions
    const { canManageRole } = await import('./permissions');
    return canManageRole(manager.role, target.role);
  } catch (error) {
    console.error('Error checking if user can manage team member:', error);
    return false;
  }
}
