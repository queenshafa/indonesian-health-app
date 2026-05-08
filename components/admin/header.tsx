'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AdminHeader({ user }: { user: User }) {
  const router = useRouter()

  const handleLogout = async () => {
    // Call logout endpoint
    await fetch('/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Selamat datang, {user.user_metadata?.full_name || user.email}
        </h2>
        <p className="text-sm text-gray-600">
          Role: {user.user_metadata?.admin_role || 'staff'}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
