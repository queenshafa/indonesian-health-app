import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/sidebar'
import AdminHeader from '@/components/admin/header'

export const metadata = {
  title: 'Admin Dashboard - Kesehatan Digital Indonesia',
  description: 'Manage doctors, schedules, queues, and content',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated and is admin
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const isAdmin = user.user_metadata?.is_admin === true
  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex flex1 flex-col overflow-hidden w-full">
        {/* Header */}
        <AdminHeader user={user} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-8 px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
