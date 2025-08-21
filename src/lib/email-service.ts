import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Fallback email service for development (logs to console)
const logEmailToConsole = (emailData: any) => {
  console.log('📧 EMAIL WOULD BE SENT:');
  console.log('To:', emailData.to);
  console.log('Subject:', emailData.subject);
  console.log('HTML Content Length:', emailData.html?.length || 0);
  console.log('--- Email Content Preview ---');
  console.log(emailData.html?.substring(0, 500) + '...');
  console.log('--- End Preview ---');
};

export async function sendTeamInvitation({
  to,
  name,
  businessName,
  role,
  token,
  message,
  expiresAt,
}: {
  to: string;
  name: string;
  businessName: string;
  role: string;
  token: string;
  message?: string;
  expiresAt: Date;
}) {
  try {
    const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`;
    const expiresDate = expiresAt.toLocaleDateString();
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">You're Invited!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Join ${businessName} as a team member</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You've been invited to join <strong>${businessName}</strong> as a <strong>${role}</strong> team member.
          </p>
          
          ${message ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 0; color: #495057; font-style: italic;">"${message}"</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Important:</strong> This invitation expires on ${expiresDate}. Please accept it before then.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If you have any questions, please contact the person who sent you this invitation.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>This invitation was sent from ${businessName}</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    const emailData = {
      from: process.env.FROM_EMAIL || 'noreply@zenoscheduler.com',
      to: [to],
      subject: `You're invited to join ${businessName} as a team member`,
      html: htmlContent,
    };

    // Check if we have a valid API key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      // Development mode - log to console
      logEmailToConsole(emailData);
      
      // Return success for development
      return { 
        success: true, 
        data: { id: 'dev-mode-' + Date.now() },
        message: 'Email logged to console (development mode)'
      };
    }

    // Production mode - send via Resend
    const result = await resend.emails.send(emailData);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send team invitation email:', error);
    
    // If Resend fails, fall back to console logging
    if (process.env.NODE_ENV === 'development') {
      logEmailToConsole({
        to,
        subject: `You're invited to join ${businessName} as a team member`,
        html: 'Email content would be here...'
      });
      
      return { 
        success: true, 
        data: { id: 'fallback-' + Date.now() },
        message: 'Email logged to console due to Resend error'
      };
    }
    
    return { success: false, error: (error as Error).message };
  }
}

// Test email function for development
export async function testEmailService() {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.log('📧 Email service is in development mode');
      console.log('To enable real emails, set RESEND_API_KEY in your .env.local file');
      return { success: true, mode: 'development' };
    }

    // Test Resend connection
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@zenoscheduler.com',
      to: ['test@example.com'],
      subject: 'Test Email',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    });

    return { success: true, mode: 'production', data: result };
  } catch (error) {
    console.error('Email service test failed:', error);
    return { success: false, error: (error as Error).message };
  }
}
