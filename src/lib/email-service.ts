import { Resend } from 'resend';
import { TeamMemberRole } from '@prisma/client';
import { getRoleDisplayName } from './permissions';

// Initialize Resend client (optional)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email templates
export interface TeamInvitationEmailData {
  to: string;
  name: string;
  businessName: string;
  role: TeamMemberRole;
  invitationUrl: string;
  invitedBy: string;
  message?: string;
}

export interface WelcomeEmailData {
  to: string;
  name: string;
  businessName: string;
  role: TeamMemberRole;
  loginUrl: string;
}

export interface RoleChangeEmailData {
  to: string;
  name: string;
  businessName: string;
  oldRole: TeamMemberRole;
  newRole: TeamMemberRole;
  changedBy: string;
}

/**
 * Send team member invitation email
 */
export async function sendTeamInvitationEmail(data: TeamInvitationEmailData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return {
        success: true,
        messageId: 'mock-message-id',
      };
    }

    const roleDisplayName = getRoleDisplayName(data.role);
    
    if (!resend) {
      console.warn('Resend client not initialized, skipping email send');
      return {
        success: true,
        messageId: 'mock-message-id',
      };
    }

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@zenoscheduler.com',
      to: data.to,
      subject: `You're invited to join ${data.businessName} on Zeno Scheduler`,
      html: generateTeamInvitationEmailHTML(data, roleDisplayName),
      text: generateTeamInvitationEmailText(data, roleDisplayName),
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Error sending team invitation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email to new team member
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return {
        success: true,
        messageId: 'mock-message-id',
      };
    }

    const roleDisplayName = getRoleDisplayName(data.role);
    
    if (!resend) {
      console.warn('Resend client not initialized, skipping email send');
      return {
        success: true,
        messageId: 'mock-message-id',
      };
    }

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@zenoscheduler.com',
      to: data.to,
      subject: `Welcome to ${data.businessName} on Zeno Scheduler!`,
      html: generateWelcomeEmailHTML(data, roleDisplayName),
      text: generateWelcomeEmailText(data, roleDisplayName),
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send role change notification email
 */
export async function sendRoleChangeEmail(data: RoleChangeEmailData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return {
        success: true,
        messageId: 'mock-message-id',
      };
    }

    const oldRoleDisplayName = getRoleDisplayName(data.oldRole);
    const newRoleDisplayName = getRoleDisplayName(data.newRole);
    
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@zenoscheduler.com',
      to: data.to,
      subject: `Your role has been updated at ${data.businessName}`,
      html: generateRoleChangeEmailHTML(data, oldRoleDisplayName, newRoleDisplayName),
      text: generateRoleChangeEmailText(data, oldRoleDisplayName, newRoleDisplayName),
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Error sending role change email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate HTML for team invitation email
 */
function generateTeamInvitationEmailHTML(data: TeamInvitationEmailData, roleDisplayName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Team Invitation - ${data.businessName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        .role-badge { display: inline-block; padding: 4px 12px; background: #e9ecef; border-radius: 20px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You're Invited!</h1>
          <p><strong>${data.invitedBy}</strong> has invited you to join their team on Zeno Scheduler.</p>
        </div>
        
        <h2>Business: ${data.businessName}</h2>
        <p><strong>Role:</strong> <span class="role-badge">${roleDisplayName}</span></p>
        
        ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
        
        <p>Zeno Scheduler is a powerful appointment booking and business management platform that will help you:</p>
        <ul>
          <li>Manage appointments and schedules</li>
          <li>Handle customer relationships</li>
          <li>Streamline business operations</li>
          <li>Collaborate with your team</li>
        </ul>
        
        <a href="${data.invitationUrl}" class="button">Accept Invitation</a>
        
        <p><small>This invitation will expire in 7 days. If you have any questions, please contact ${data.invitedBy}.</small></p>
        
        <div class="footer">
          <p>This email was sent by Zeno Scheduler. If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate text version for team invitation email
 */
function generateTeamInvitationEmailText(data: TeamInvitationEmailData, roleDisplayName: string): string {
  return `
You're Invited to Join ${data.businessName} on Zeno Scheduler!

${data.invitedBy} has invited you to join their team on Zeno Scheduler.

Business: ${data.businessName}
Role: ${roleDisplayName}
${data.message ? `Message: ${data.message}` : ''}

Zeno Scheduler is a powerful appointment booking and business management platform.

Accept your invitation here: ${data.invitationUrl}

This invitation will expire in 7 days. If you have any questions, please contact ${data.invitedBy}.

---
This email was sent by Zeno Scheduler. If you didn't expect this invitation, you can safely ignore this email.
  `;
}

/**
 * Generate HTML for welcome email
 */
function generateWelcomeEmailHTML(data: WelcomeEmailData, roleDisplayName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${data.businessName}!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        .role-badge { display: inline-block; padding: 4px 12px; background: #e9ecef; border-radius: 20px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to the Team!</h1>
          <p>Your account has been activated and you're now part of <strong>${data.businessName}</strong> on Zeno Scheduler.</p>
        </div>
        
        <h2>Your Role: <span class="role-badge">${roleDisplayName}</span></h2>
        
        <p>You now have access to:</p>
        <ul>
          <li>Your personalized dashboard</li>
          <li>Appointment management tools</li>
          <li>Customer relationship features</li>
          <li>Team collaboration tools</li>
        </ul>
        
        <a href="${data.loginUrl}" class="button">Access Your Dashboard</a>
        
        <p><strong>Getting Started Tips:</strong></p>
        <ol>
          <li>Complete your profile setup</li>
          <li>Review your permissions and access levels</li>
          <li>Explore the calendar and appointment features</li>
          <li>Connect with your team members</li>
        </ol>
        
        <div class="footer">
          <p>Welcome aboard! If you need help getting started, don't hesitate to reach out to your team lead.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate text version for welcome email
 */
function generateWelcomeEmailText(data: WelcomeEmailData, roleDisplayName: string): string {
  return `
Welcome to the Team!

Your account has been activated and you're now part of ${data.businessName} on Zeno Scheduler.

Your Role: ${roleDisplayName}

You now have access to:
- Your personalized dashboard
- Appointment management tools
- Customer relationship features
- Team collaboration tools

Access your dashboard: ${data.loginUrl}

Getting Started Tips:
1. Complete your profile setup
2. Review your permissions and access levels
3. Explore the calendar and appointment features
4. Connect with your team members

Welcome aboard! If you need help getting started, don't hesitate to reach out to your team lead.
  `;
}

/**
 * Generate HTML for role change email
 */
function generateRoleChangeEmailHTML(data: RoleChangeEmailData, oldRoleDisplayName: string, newRoleDisplayName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Role Update - ${data.businessName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .role-change { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .old-role { color: #856404; }
        .new-role { color: #155724; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Role Update</h1>
          <p>Your role at <strong>${data.businessName}</strong> has been updated.</p>
        </div>
        
        <div class="role-change">
          <h3>Role Change Details</h3>
          <p><strong>Previous Role:</strong> <span class="old-role">${oldRoleDisplayName}</span></p>
          <p><strong>New Role:</strong> <span class="new-role">${newRoleDisplayName}</span></p>
          <p><strong>Changed By:</strong> ${data.changedBy}</p>
        </div>
        
        <p>This change may affect your access to certain features and permissions within the system.</p>
        
        <p><strong>What This Means:</strong></p>
        <ul>
          <li>Your permissions have been updated to match your new role</li>
          <li>You may have access to new features</li>
          <li>Some features may no longer be available</li>
          <li>Your team collaboration options may have changed</li>
        </ul>
        
        <p>If you have any questions about your new role or permissions, please contact your team lead or administrator.</p>
        
        <div class="footer">
          <p>This is an automated notification from Zeno Scheduler. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate text version for role change email
 */
function generateRoleChangeEmailText(data: RoleChangeEmailData, oldRoleDisplayName: string, newRoleDisplayName: string): string {
  return `
Role Update

Your role at ${data.businessName} has been updated.

Role Change Details:
- Previous Role: ${oldRoleDisplayName}
- New Role: ${newRoleDisplayName}
- Changed By: ${data.changedBy}

This change may affect your access to certain features and permissions within the system.

What This Means:
- Your permissions have been updated to match your new role
- You may have access to new features
- Some features may no longer be available
- Your team collaboration options may have changed

If you have any questions about your new role or permissions, please contact your team lead or administrator.

---
This is an automated notification from Zeno Scheduler. Please do not reply to this email.
  `;
}

/**
 * Test email service configuration
 */
export async function testEmailService(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: 'RESEND_API_KEY not configured',
      };
    }

    // Try to send a test email to verify configuration
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@zenoscheduler.com',
      to: 'test@example.com',
      subject: 'Email Service Test',
      html: '<p>This is a test email to verify the email service configuration.</p>',
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message || 'Failed to send test email',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
