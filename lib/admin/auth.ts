import { createClient } from '@/lib/supabase/server'

export type AdminRole = 'super_admin' | 'admin' | 'doctor' | 'nurse' | 'staff'

export interface AdminUser {
  id: string
  email: string
  full_name?: string
  role: AdminRole
  clinic_id?: string
  is_active: boolean
  permissions: string[]
}

// Check if user is admin
export async function checkAdminAccess(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // For now, check if user has admin metadata
    const isAdmin = user.user_metadata?.is_admin === true
    const role = user.user_metadata?.admin_role || 'staff'

    if (!isAdmin) return null

    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      role,
      clinic_id: user.user_metadata?.clinic_id,
      is_active: true,
      permissions: getPermissionsByRole(role),
    }
  } catch (error) {
    console.error('Admin auth check error:', error)
    return null
  }
}

// Get permissions based on role
export function getPermissionsByRole(role: AdminRole): string[] {
  const permissions: Record<AdminRole, string[]> = {
    super_admin: [
      'manage_users',
      'manage_admins',
      'manage_clinics',
      'manage_doctors',
      'manage_schedules',
      'manage_queues',
      'manage_health_education',
      'manage_traditional_medicine',
      'view_reports',
      'view_analytics',
    ],
    admin: [
      'manage_doctors',
      'manage_schedules',
      'manage_queues',
      'manage_health_education',
      'view_reports',
    ],
    doctor: [
      'view_queues',
      'update_queue_status',
      'view_patient_records',
    ],
    nurse: [
      'view_queues',
      'update_queue_status',
      'manage_schedules',
    ],
    staff: [
      'view_queues',
      'manage_queues',
    ],
  }

  return permissions[role] || []
}

// Check specific permission
export function hasPermission(admin: AdminUser | null, permission: string): boolean {
  if (!admin) return false
  return admin.permissions.includes(permission)
}
