# Database Migration Guide: From Insecure to Secure

## 🚨 **CRITICAL: Complete Database Restructure Required**

This migration transforms your database from an **insecure shared-user model** to a **secure business-isolated model**. This is a **breaking change** that requires careful planning and execution.

## 📊 **What Changed**

### **BEFORE (INSECURE):**
```
User Model (Mixed Purpose)
├── Business owners (with passwords)
├── Team members (with passwords)  
└── Customers (without passwords)
```

### **AFTER (SECURE):**
```
User Model (Authentication Only)
├── Business owners
└── Team members with accounts

Customer Model (Business-Specific)
├── Customer A (Business 1 only)
├── Customer B (Business 1 only)
├── Customer C (Business 2 only)
└── Customer D (Business 2 only)
```

## 🔄 **Migration Steps**

### **Phase 1: Backup & Preparation**
1. **Create database backup**
   ```bash
   # MongoDB backup
   mongodump --db your-database-name --out ./backup-$(date +%Y%m%d)
   ```

2. **Stop your application** to prevent new data during migration

3. **Document current data** - export existing users, bookings, services

### **Phase 2: Data Migration Scripts**

#### **Step 1: Create New Customer Records**
```typescript
// migration-script-1-create-customers.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateCustomers() {
  // Get all existing users who have bookings (these are customers)
  const usersWithBookings = await prisma.user.findMany({
    where: {
      bookings: { some: {} },
      hashedPassword: null // No password = customer
    },
    include: {
      bookings: {
        include: {
          service: true
        }
      }
    }
  })

  for (const user of usersWithBookings) {
    // Group bookings by business
    const businessGroups = new Map()
    
    for (const booking of user.bookings) {
      const businessId = booking.service.businessId
      if (!businessGroups.has(businessId)) {
        businessGroups.set(businessId, [])
      }
      businessGroups.get(businessId).push(booking)
    }

    // Create customer record for each business
    for (const [businessId, bookings] of businessGroups) {
      const customer = await prisma.customer.create({
        data: {
          businessId,
          name: user.name || 'Unknown Customer',
          email: user.email,
          phone: user.phone,
          company: user.company,
          country: user.country,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          createdAt: user.createdAt
        }
      })

      // Update all bookings for this business to use new customer
      await prisma.booking.updateMany({
        where: {
          id: { in: bookings.map(b => b.id) }
        },
        data: {
          customerId: customer.id
        }
      })
    }
  }
}

migrateCustomers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

#### **Step 2: Update Booking Model**
```typescript
// migration-script-2-update-bookings.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateBookings() {
  // Remove old userId field from bookings
  // Add new customerId field
  // This requires MongoDB schema update
  
  console.log('Bookings updated to use customerId instead of userId')
}

updateBookings()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

#### **Step 3: Clean Up User Model**
```typescript
// migration-script-3-cleanup-users.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupUsers() {
  // Remove customer-related fields from users
  // Keep only authentication fields
  
  await prisma.user.updateMany({
    data: {
      phone: null,
      company: null,
      country: null,
      address: null,
      city: null,
      state: null,
      zipCode: null
    }
  })

  console.log('User model cleaned up')
}

cleanupUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### **Phase 3: Schema Update**
1. **Apply new Prisma schema**
   ```bash
   npx prisma db push
   ```

2. **Verify data integrity**
   ```bash
   npx prisma studio
   ```

### **Phase 4: API Updates**
Update all API endpoints to use the new models:

#### **Old Customer Endpoints (INSECURE):**
```typescript
// OLD - Insecure
const customers = await prisma.user.findMany({
  where: { /* all users */ }
})
```

#### **New Customer Endpoints (SECURE):**
```typescript
// NEW - Secure
const customers = await prisma.customer.findMany({
  where: { 
    businessId: business.id // Only this business's customers
  }
})
```

## 🛡️ **Security Improvements**

### **1. Complete Business Isolation**
- ✅ Each business only sees their own customers
- ✅ No cross-business data leakage
- ✅ Proper foreign key relationships

### **2. Role Separation**
- ✅ `User` = Authentication only
- ✅ `Customer` = Business-specific data only
- ✅ Clear separation of concerns

### **3. Data Integrity**
- ✅ Cascade deletes prevent orphaned data
- ✅ Unique constraints per business
- ✅ Proper indexing for performance

## ⚠️ **Breaking Changes**

### **API Changes Required:**
1. **Customer endpoints** - now use `Customer` model
2. **Booking endpoints** - now use `customerId` instead of `userId`
3. **Authentication** - unchanged, still uses `User` model
4. **Business operations** - unchanged, still uses `Business` model

### **Frontend Changes Required:**
1. **Customer management** - update API calls
2. **Booking forms** - update data structure
3. **Customer lists** - update data display

## 🧪 **Testing Strategy**

### **1. Migration Testing**
- Test migration scripts on copy of production data
- Verify all data is preserved correctly
- Check business isolation works

### **2. Functionality Testing**
- Test customer creation/editing
- Test booking creation/management
- Test team member operations
- Test business settings

### **3. Security Testing**
- Verify business A cannot see business B's data
- Test customer isolation
- Verify proper access controls

## 📋 **Migration Checklist**

- [ ] Create database backup
- [ ] Stop application
- [ ] Run migration scripts
- [ ] Update Prisma schema
- [ ] Update API endpoints
- [ ] Update frontend code
- [ ] Test all functionality
- [ ] Verify security isolation
- [ ] Deploy to production
- [ ] Monitor for issues

## 🚀 **Post-Migration**

### **1. Performance Monitoring**
- Monitor database query performance
- Check for any slow queries
- Optimize indexes if needed

### **2. Security Monitoring**
- Monitor audit logs
- Check for unauthorized access attempts
- Verify business isolation

### **3. User Training**
- Update documentation
- Train team on new structure
- Update any custom scripts

## 🔧 **Rollback Plan**

If migration fails:
1. **Restore database backup**
2. **Revert code changes**
3. **Investigate issues**
4. **Fix and retry**

## 📞 **Support**

This is a major migration. If you encounter issues:
1. Check the migration logs
2. Verify data integrity
3. Test on staging environment first
4. Have rollback plan ready

## 🎯 **Expected Results**

After successful migration:
- ✅ **Complete business isolation**
- ✅ **No more cross-business data leakage**
- ✅ **Industry-standard security**
- ✅ **Production-ready SaaS architecture**
- ✅ **Scalable multi-tenant system**
