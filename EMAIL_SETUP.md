# Email Setup Guide for Team Invitations

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Get a Free Resend Account**
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address
4. Get your API key from the dashboard

### **Step 2: Configure Environment Variables**
Create a `.env.local` file in your project root:

```bash
# Email Configuration
RESEND_API_KEY=re_1234567890abcdef...
FROM_EMAIL=noreply@yourbusiness.com

# NextAuth Configuration  
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Database Configuration
DATABASE_URL="your_mongodb_connection_string"
```

### **Step 3: Test Email Service**
Restart your development server and try sending an invitation!

## 📧 **Email Service Options**

### **Option 1: Resend (Recommended)**
- **Free tier**: 3,000 emails/month
- **Easy setup**: Just API key
- **Professional delivery**: 99.9%+ delivery rate
- **Analytics**: Track email performance

### **Option 2: SendGrid**
- **Free tier**: 100 emails/day
- **Setup**: API key + domain verification
- **Good for**: High volume businesses

### **Option 3: Nodemailer (Self-hosted)**
- **Free**: Use your own SMTP server
- **Setup**: Gmail, Outlook, or custom SMTP
- **Good for**: Complete control

## 🔧 **Resend Setup Details**

### **1. Domain Verification**
1. Add your domain in Resend dashboard
2. Add DNS records (MX, SPF, DKIM)
3. Wait for verification (usually 5-10 minutes)

### **2. API Key Security**
- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Monitor usage in dashboard

### **3. Email Templates**
The system includes professional HTML templates:
- Team invitations
- Welcome emails  
- Role change notifications
- Password resets

## 🧪 **Testing Email Service**

### **Development Mode**
When `RESEND_API_KEY` is not set, emails are logged to console:
```
📧 EMAIL WOULD BE SENT:
To: john@example.com
Subject: You're invited to join Business Name as a team member
HTML Content Length: 1234
--- Email Content Preview ---
<div style="font-family: Arial, sans-serif; max-width: 600px...
--- End Preview ---
```

### **Production Mode**
With valid API key, emails are sent via Resend:
- Check Resend dashboard for delivery status
- Monitor bounce rates and engagement
- Set up webhooks for real-time updates

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Email sent successfully" but no email received**
   - Check spam/junk folder
   - Verify FROM_EMAIL is correct
   - Check Resend dashboard for errors

2. **"Failed to send invitation email" error**
   - Verify RESEND_API_KEY is correct
   - Check API key permissions
   - Ensure domain is verified

3. **Emails going to spam**
   - Verify domain DNS records
   - Use consistent FROM_EMAIL
   - Avoid spam trigger words

### **Debug Steps**

1. **Check console logs** for email content
2. **Verify environment variables** are loaded
3. **Test API key** in Resend dashboard
4. **Check domain verification** status

## 📊 **Email Analytics**

### **Resend Dashboard Features**
- **Delivery rates**: Track successful sends
- **Bounce rates**: Monitor failed deliveries
- **Open rates**: See engagement metrics
- **Click tracking**: Monitor invitation acceptance

### **Custom Analytics**
- Track invitation acceptance rates
- Monitor team member onboarding
- Analyze email performance by role

## 🔒 **Security Best Practices**

### **API Key Management**
- Use environment variables
- Rotate keys monthly
- Monitor usage patterns
- Set up alerts for unusual activity

### **Email Content**
- Avoid spam trigger words
- Use professional templates
- Include unsubscribe options
- Respect privacy regulations

## 💰 **Cost Optimization**

### **Resend Pricing**
- **Free**: 3,000 emails/month
- **Pro**: $20/month for 50,000 emails
- **Business**: Custom pricing for high volume

### **Tips to Reduce Costs**
- Clean email lists regularly
- Monitor bounce rates
- Use efficient templates
- Batch invitations when possible

---

## 🆘 **Need Help?**

1. **Check this guide** for common solutions
2. **Review Resend documentation** at [resend.com/docs](https://resend.com/docs)
3. **Test email service** with the built-in test function
4. **Monitor console logs** for detailed error information

---

*Last updated: December 2024*
*Email service: Resend*



