# Admin Dashboard Setup Guide

## Overview
The admin dashboard provides complete management of the healthcare platform including doctors, schedules, queues, users, clinics, and health education content.

## Access Admin Dashboard

### URL
```
https://your-domain.com/admin
```

### Current Security Status
⚠️ **IMPORTANT**: Currently, the admin dashboard does NOT have role-based access control (RBAC). Any authenticated user can access admin features.

### TODO - Add Admin Authentication
Before going to production, implement proper admin authentication:

```typescript
// lib/admin/auth.ts - ENHANCE THIS
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, admin_role')
    .eq('id', userId)
    .single()
  
  return profile?.is_admin === true
}

// Add these columns to profiles table:
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN admin_role TEXT DEFAULT 'viewer'; -- 'admin', 'editor', 'viewer'
```

## Admin Features

### 1. Dashboard Overview
- **URL**: `/admin`
- **Stats**: Total users, doctors, queues, articles
- **Quick Access**: Links to all management sections
- **Real-time**: Auto-refreshes queue statistics every 30 seconds

### 2. Doctor Management
- **URL**: `/admin/doctors`
- **Features**:
  - View all doctors with specialization and contact info
  - Add new doctors with form
  - Delete doctors
  - Track empathy and communication ratings
  
**API**: `POST/GET/DELETE /api/admin/doctors`

### 3. Schedule Management
- **URL**: `/admin/schedules`
- **Features**:
  - Manage doctor schedules by day of week
  - Set practice hours and break times
  - Configure max patients per session
  - Set consultation slot duration
  - Filter schedules by doctor

**API**: `POST/GET/PATCH /api/admin/schedules`

### 4. Queue Management
- **URL**: `/admin/queues`
- **Features**:
  - Real-time queue status (updates every 30 seconds)
  - Change queue status: waiting → called → in_consultation → completed
  - View queue statistics (total, waiting, in consultation, completed)
  - Filter by doctor, status, or date
  - See estimated wait times

**API**: `GET/PATCH/DELETE /api/admin/queues`

### 5. User Management
- **URL**: `/admin/users`
- **Features**:
  - View all registered users
  - See insurance type (BPJS, Private, None)
  - Track BPJS numbers
  - View registration date
  - Delete users if needed
  - Stats: Total users, BPJS users, private insurance, uninsured, families

**API**: `GET/PATCH/DELETE /api/admin/users`

### 6. Clinic Management
- **URL**: `/admin/clinics`
- **Features**:
  - Manage healthcare facilities (clinics, hospitals, emergency rooms, pharmacies)
  - Add new clinics with address, phone, email
  - Mark BPJS partners
  - Indicate emergency services availability
  - Mark ambulance availability
  - Track by city

**API**: `POST/GET/PATCH/DELETE /api/admin/clinics`

### 7. Health Education Content
- **URL**: `/admin/health-education`
- **Features**:
  - Create health education articles
  - Set category (sleep, nutrition, exercise, mental health, first aid, disease prevention, hygiene, vaccination)
  - Set difficulty level
  - Target age groups
  - Publish/unpublish articles
  - View published/draft counts
  - Delete articles

**API**: `POST/GET/PATCH/DELETE /api/admin/health-education`

## Database Setup

All admin features use the existing Supabase schema. Ensure these tables exist:

```sql
-- Core tables used by admin
- profiles (users)
- doctors
- doctor_schedules
- queues (appointments)
- clinics
- health_educations
- facilities
```

## API Endpoints Reference

### Doctors
```
GET    /api/admin/doctors              - List all doctors
POST   /api/admin/doctors              - Create new doctor
PATCH  /api/admin/doctors              - Update doctor (planned)
DELETE /api/admin/doctors              - Delete doctor
```

### Schedules
```
GET    /api/admin/schedules            - List schedules
POST   /api/admin/schedules            - Create schedule
PATCH  /api/admin/schedules            - Update schedule (planned)
DELETE /api/admin/schedules            - Delete schedule (planned)
```

### Queues
```
GET    /api/admin/queues?date=YYYY-MM-DD  - List queues with filters
PATCH  /api/admin/queues               - Update queue status
DELETE /api/admin/queues               - Cancel queue
```

### Users
```
GET    /api/admin/users                - List all users
PATCH  /api/admin/users                - Update user profile
DELETE /api/admin/users                - Delete user
```

### Clinics
```
GET    /api/admin/clinics              - List clinics
POST   /api/admin/clinics              - Create clinic
PATCH  /api/admin/clinics              - Update clinic
DELETE /api/admin/clinics              - Delete clinic
```

### Health Education
```
GET    /api/admin/health-education     - List articles
POST   /api/admin/health-education     - Create article
PATCH  /api/admin/health-education     - Update article
DELETE /api/admin/health-education     - Delete article
```

## Initial Data Setup

### Seeding Demo Data
To populate with sample data for testing:

```bash
# Run the seed script (if available)
pnpm run seed

# Or manually add:
1. Create 2-3 test clinics via Admin → Klinik & RS
2. Add 5-6 doctors per clinic via Admin → Dokter
3. Add schedules for each doctor via Admin → Jadwal
4. Create 10+ health education articles via Admin → Edukasi Kesehatan
```

## Production Checklist

- [ ] Implement admin authentication (see TODO above)
- [ ] Add role-based access control (admin, editor, viewer)
- [ ] Enable audit logging for admin actions
- [ ] Set up admin email notifications
- [ ] Configure backup strategy for admin-created content
- [ ] Add rate limiting to admin APIs
- [ ] Implement data validation on all admin forms
- [ ] Add CSRF protection
- [ ] Test all CRUD operations
- [ ] Train admin users on platform

## Troubleshooting

### Issue: Can't see admin data after adding it
**Solution**: 
- Check Row Level Security (RLS) policies on tables
- Ensure authenticated user has read/write permissions
- Verify Supabase connection is working

### Issue: Forms not submitting
**Solution**:
- Check browser console for errors
- Verify API endpoints are responding
- Check Supabase credentials in .env.local
- Ensure OPENAI_API_KEY is set if using AI features

### Issue: Queue status not updating
**Solution**:
- Verify the PATCH endpoint is working
- Check if queue exists in database
- Ensure user has permission to modify queue
- Try refreshing the page

## Future Enhancements

1. **Advanced Analytics**
   - Doctor performance metrics
   - Patient demographics
   - Peak hours analysis
   - Revenue tracking

2. **Bulk Operations**
   - Import doctors from CSV
   - Bulk schedule creation
   - Batch user invitations

3. **Automated Tasks**
   - Send appointment reminders
   - Daily health education scheduling
   - Queue cleanup (auto-cancel no-shows)

4. **Audit Trail**
   - Log all admin actions
   - Track changes to critical data
   - Export audit logs

5. **Integration**
   - Connect with N8N for automation
   - Send notifications via SMS/Email
   - Export data for reporting
