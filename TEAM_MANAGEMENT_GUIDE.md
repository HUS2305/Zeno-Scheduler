# Team Management System Guide

## Overview

The Team Management System provides comprehensive functionality for managing team members, roles, permissions, and invitations in the Zeno Scheduler application. It implements a robust Role-Based Access Control (RBAC) system with secure invitation workflows.

## 🏗️ **System Architecture**

### **Core Components**

1. **Team Member Management** - CRUD operations for team members
2. **Role-Based Access Control** - Permission system with 4 role levels
3. **Invitation System** - Secure email-based team member invitations
4. **Permission Guards** - UI components for conditional rendering
5. **Audit Logging** - Comprehensive activity tracking

### **Role Hierarchy**

```
OWNER (4) > ADMIN (3) > ENHANCED (2) > STANDARD (1)
```

- **OWNER**: Full access to all features and settings
- **ADMIN**: Manage team members, business settings, full calendar access
- **ENHANCED**: Extended permissions, team calendar access
- **STANDARD**: Basic permissions, own calendar access

## 🚀 **Getting Started**

### **Environment Setup**

1. **Email Configuration** (Required for invitations)
   ```bash
   # .env.local
   RESEND_API_KEY=your_resend_api_key_here
   FROM_EMAIL=noreply@yourbusiness.com
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

### **Installation**

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Resend Email Service**
   - Sign up at [resend.com](https://resend.com)
   - Get your API key
   - Add to environment variables

## 📧 **Invitation System**

### **How It Works**

1. **Team member sends invitation** via dashboard
2. **Email sent** with secure invitation link
3. **Invitee clicks link** and fills out form
4. **Account created** automatically with assigned role
5. **Team member activated** and can log in

### **Invitation Flow**

```
Send Invitation → Email Sent → Invitee Clicks Link → 
Fill Form → Account Created → Team Member Active
```

### **Invitation Expiration**

- **Default**: 7 days
- **Configurable** in `src/app/api/team/invite/route.ts`
- **Automatic cleanup** of expired invitations

## 🔐 **Permission System**

### **Permission Actions**

```typescript
enum PermissionAction {
  VIEW_OWN_CALENDAR = 'VIEW_OWN_CALENDAR',
  VIEW_TEAM_CALENDAR = 'VIEW_TEAM_CALENDAR',
  VIEW_ALL_CALENDAR = 'VIEW_ALL_CALENDAR',
  MANAGE_APPOINTMENTS = 'MANAGE_APPOINTMENTS',
  VIEW_OWN_CUSTOMERS = 'VIEW_OWN_CUSTOMERS',
  VIEW_ALL_CUSTOMERS = 'VIEW_ALL_CUSTOMERS',
  MANAGE_CUSTOMERS = 'MANAGE_CUSTOMERS',
  VIEW_TEAM_MEMBERS = 'VIEW_TEAM_MEMBERS',
  INVITE_TEAM_MEMBERS = 'INVITE_TEAM_MEMBERS',
  MANAGE_TEAM_MEMBERS = 'MANAGE_TEAM_MEMBERS',
  MANAGE_BUSINESS_SETTINGS = 'MANAGE_BUSINESS_SETTINGS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_SERVICES = 'MANAGE_SERVICES'
}
```

### **Role Permissions Matrix**

| Permission | STANDARD | ENHANCED | ADMIN | OWNER |
|------------|----------|----------|-------|-------|
| View Own Calendar | ✅ | ✅ | ✅ | ✅ |
| View Team Calendar | ❌ | ✅ | ✅ | ✅ |
| View All Calendar | ❌ | ❌ | ✅ | ✅ |
| Manage Team Members | ❌ | ❌ | ✅ | ✅ |
| Business Settings | ❌ | ❌ | ✅ | ✅ |

## 🛠️ **API Endpoints**

### **Team Invitations**

#### **Send Invitation**
```http
POST /api/team/invite
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "STANDARD",
  "message": "Welcome to the team!",
  "businessId": "business_id_here"
}
```

#### **Get Pending Invitations**
```http
GET /api/team/invite?businessId=business_id_here
```

#### **Cancel Invitation**
```http
POST /api/team/invitations/{invitationId}/cancel
```

### **Team Members**

#### **Update Role**
```http
PUT /api/team/members/{memberId}
Content-Type: application/json

{
  "role": "ENHANCED"
}
```

#### **Remove Member**
```http
DELETE /api/team/members/{memberId}
```

### **Invitation Acceptance**

#### **Accept Invitation**
```http
POST /api/team/accept-invitation
Content-Type: application/json

{
  "invitationId": "invitation_id_here",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "secure_password"
}
```

## 🎨 **UI Components**

### **PermissionGuard**

Conditional rendering based on user permissions:

```tsx
import { AdminOnly, CanInviteTeam } from '@/components/dashboard/PermissionGuard';

<AdminOnly>
  <button>Admin Only Action</button>
</AdminOnly>

<CanInviteTeam>
  <button>Invite Team Member</button>
</CanInviteTeam>
```

### **TeamMemberForm**

Reusable form for creating/inviting team members:

```tsx
import TeamMemberForm from '@/components/dashboard/TeamMemberForm';

<TeamMemberForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  currentUserRole={currentUser.role}
  businessId={business.id}
  isInvitation={true}
/>
```

### **TeamAnalytics**

Comprehensive team statistics and insights:

```tsx
import TeamAnalytics from '@/components/dashboard/TeamAnalytics';

<TeamAnalytics
  teamMembers={teamMembers}
  teamInvitations={teamInvitations}
  businessName={business.name}
/>
```

## 🔒 **Security Features**

### **Permission Validation**

- **Server-side checks** on all API endpoints
- **Role hierarchy enforcement** (can't promote above own level)
- **Business isolation** (can't access other businesses)
- **Audit logging** for all sensitive operations

### **Invitation Security**

- **Secure tokens** (32-character hex strings)
- **Time-limited** invitations (7 days)
- **Email verification** required
- **One-time use** invitations

### **Data Protection**

- **Password hashing** with bcrypt
- **Session management** via NextAuth.js
- **CSRF protection** built-in
- **Input validation** and sanitization

## 📊 **Analytics & Reporting**

### **Team Metrics**

- **Member count** by role and status
- **Invitation statistics** (pending, accepted, expired)
- **Recent activity** (last 30 days)
- **Role distribution** visualization

### **Audit Trail**

- **All team changes** logged with timestamps
- **User actions** tracked for compliance
- **Business context** preserved in logs
- **Export capabilities** for reporting

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Invitation emails not sending**
   - Check `RESEND_API_KEY` in environment
   - Verify `FROM_EMAIL` is configured
   - Check Resend dashboard for delivery status

2. **Permission errors**
   - Verify user has correct role
   - Check role hierarchy permissions
   - Ensure business context is correct

3. **Database connection issues**
   - Verify Prisma configuration
   - Check MongoDB connection string
   - Run `npm run db:generate` if schema changed

### **Debug Mode**

Enable detailed logging:

```typescript
// In development
console.log('Team member context:', teamMember);
console.log('Permissions:', teamMember.permissions);
console.log('Role:', teamMember.role);
```

## 🔄 **Maintenance**

### **Regular Tasks**

1. **Clean expired invitations** (automatic)
2. **Review audit logs** monthly
3. **Update role permissions** as needed
4. **Monitor email delivery** rates

### **Backup & Recovery**

- **Database backups** recommended weekly
- **Audit log retention** configurable
- **Invitation cleanup** automatic

## 📚 **Additional Resources**

### **Related Documentation**

- [Permission System Guide](./PERMISSIONS.md)
- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)

### **Code Examples**

- [Team Management Examples](./examples/team-management.md)
- [Permission Implementation](./examples/permissions.md)
- [Email Templates](./examples/email-templates.md)

---

## 🤝 **Support**

For questions or issues:

1. **Check this guide** for common solutions
2. **Review audit logs** for error details
3. **Test permissions** with different user roles
4. **Verify environment** configuration

---

*Last updated: December 2024*
*Version: 1.0.0*






