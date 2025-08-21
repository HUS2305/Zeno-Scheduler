# Zeno Scheduler

A comprehensive appointment booking system with team management and role-based access control.

## 🚀 **Current Status: ~60% Complete**

### ✅ **What We've Accomplished So Far**

#### **Phase 1: Foundation & Database** 
- ✅ **Database Schema Design** - Complete with all new models and relationships
- ✅ **Permission System Architecture** - RBAC with 4 roles (Standard, Enhanced, Admin, Owner)
- ✅ **Email Service Setup** - Resend integration with fallback handling
- ✅ **Core Team Management Functions** - Invite, accept, update, remove team members

#### **Phase 2: Core Team Management**
- ✅ **Team Management UI** - Complete dashboard interface with modals
- ✅ **Invitation System** - Working invitation form and API endpoint
- ✅ **Team Member Display** - List view with role badges and status indicators
- ✅ **Basic CRUD Operations** - Invite, view, and manage team members

#### **Phase 3: Authentication & Authorization** ✅ **COMPLETED**
- ✅ **Session Management Updates** - NextAuth configured with team member context
- ✅ **Route Protection** - Permission-based middleware implemented
- ✅ **Permission Checking** - Complete permission system with role-based access control
- ✅ **Team Member Context** - Session includes team member permissions and business context

#### **Phase 4: Feature Integration** ✅ **PARTIALLY COMPLETED**
- ✅ **Role-based UI Rendering** - Navigation and components show/hide based on permissions
- ✅ **Permission-aware Components** - PermissionGuard components for conditional rendering
- ✅ **API Permission Checks** - Customers and team APIs include permission validation
- ✅ **Dashboard Permission Display** - Shows user's current permissions and role

---

## 🎯 **What Still Needs to Be Done**

### **Phase 4: Feature Integration** (Remaining Items)

#### **4.1 Calendar & Appointment Access**
- [ ] **Implement role-based calendar access** (own vs. team vs. all)
- [ ] **Add permission checks** to appointment creation/editing
- [ ] **Create team calendar views** for different permission levels
- [ ] **Implement appointment sharing** between team members

#### **4.2 Customer Management Access**
- [ ] **Add permission checks** to customer CRUD operations (partially done)
- [ ] **Implement customer sharing** between team members
- [ ] **Create role-based customer views** (own vs. team vs. all)
- [ ] **Add team member filtering** to customer lists

#### **4.3 Settings & Configuration Access**
- [ ] **Implement role-based settings access**
- [ ] **Add permission checks** to business configuration
- [ ] **Create role-based settings UI** (hide/show options)
- [ ] **Implement team member management** in settings

### **Phase 5: Advanced Features** (Future Enhancements)

#### **5.1 Team Analytics**
- [ ] **Create team performance dashboards**
- [ ] **Implement team member activity tracking**
- [ ] **Add team collaboration metrics**
- [ ] **Create role-based reporting**

#### **5.2 Bulk Operations**
- [ ] **Implement bulk customer operations**
- [ ] **Add bulk appointment management**
- [ ] **Create team-wide data export**
- [ ] **Implement bulk team member operations**

#### **5.3 Security & Compliance**
- [ ] **Add audit logging** for all team actions
- [ ] **Implement data access controls**
- [ ] **Add security monitoring**
- [ ] **Create compliance reporting**

### **Phase 6: Email & Invitation System** (Partially Working)

#### **6.1 Email Configuration**
- [ ] **Set up RESEND_API_KEY** in environment variables
- [ ] **Configure FROM_EMAIL** address
- [ ] **Test email delivery** and templates
- [ ] **Implement email error handling**

#### **6.2 Invitation Flow**
- [ ] **Create invitation acceptance page** (`/invite/[token]`)
- [ ] **Implement invitation expiration handling**
- [ ] **Add invitation status tracking**
- [ ] **Create invitation management UI**

### **Phase 7: Testing & Quality Assurance**

#### **7.1 Functionality Testing**
- [ ] **Test all team member operations** (CRUD)
- [ ] **Verify permission system** works correctly
- [ ] **Test role-based access** to features
- [ ] **Validate email invitation flow**

#### **7.2 Security Testing**
- [ ] **Test permission bypass attempts**
- [ ] **Verify role escalation prevention**
- [ ] **Test unauthorized access attempts**
- [ ] **Validate session security**

---

## 🔧 **Technical Implementation Details**

### **Permission System Architecture**

The system uses a **Role-Based Access Control (RBAC)** model with the following components:

1. **Roles**: STANDARD, ENHANCED, ADMIN, OWNER
2. **Permissions**: Granular actions like VIEW_OWN_CALENDAR, MANAGE_TEAM_MEMBERS, etc.
3. **Permission Matrix**: Each role has predefined permissions
4. **Session Context**: NextAuth sessions include team member context and permissions
5. **Permission Guards**: React components for conditional UI rendering
6. **API Middleware**: Server-side permission validation

### **Key Components**

- **`/lib/permissions.ts`** - Permission definitions and role hierarchy
- **`/lib/auth-middleware.ts`** - Server-side permission checking
- **`/components/dashboard/PermissionGuard.tsx`** - Client-side permission components
- **`/app/api/auth/nextauth.ts`** - Enhanced NextAuth with team context
- **`/app/dashboard/layout.tsx`** - Permission-aware dashboard layout

### **Database Schema**

The system includes models for:
- **User** - Basic user accounts
- **Business** - Business entities
- **TeamMember** - Team members with roles and permissions
- **TeamMemberPermission** - Junction table for custom permissions
- **TeamInvitation** - Team member invitations
- **AuditLog** - Security and compliance logging

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- MongoDB database
- Resend API key (for email functionality)

### **Environment Variables**
```env
DATABASE_URL="mongodb://..."
NEXTAUTH_SECRET="your-secret"
RESEND_API_KEY="your-resend-key"
FROM_EMAIL="noreply@yourdomain.com"
```

### **Installation**
```bash
npm install
npm run dev
```

### **Database Setup**
```bash
npx prisma generate
npx prisma db push
```

---

## 📊 **Permission Matrix**

| Permission | Standard | Enhanced | Admin | Owner |
|------------|----------|----------|-------|-------|
| View Own Calendar | ✅ | ✅ | ✅ | ✅ |
| Manage Own Appointments | ✅ | ✅ | ✅ | ✅ |
| View Team Calendars | ❌ | ✅ | ✅ | ✅ |
| Manage Team Appointments | ❌ | ✅ | ✅ | ✅ |
| View All Customers | ❌ | ✅ | ✅ | ✅ |
| Manage Team Members | ❌ | ❌ | ✅ | ✅ |
| Business Settings | ❌ | ❌ | ✅ | ✅ |
| System Configuration | ❌ | ❌ | ❌ | ✅ |

---

## 🤝 **Contributing**

This project is actively being developed. The permission system foundation is complete and ready for feature integration.

## 📝 **License**

[Your License Here]
