'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const adminMenuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: '📊',
  },
  {
    label: 'Dokter',
    href: '/admin/doctors',
    icon: '👨‍⚕️',
  },
  {
    label: 'Jadwal',
    href: '/admin/schedules',
    icon: '📅',
  },
  {
    label: 'Antrian',
    href: '/admin/queues',
    icon: '📋',
  },
  {
    label: 'Pengguna',
    href: '/admin/users',
    icon: '👥',
  },
  {
    label: 'Klinik & RS',
    href: '/admin/clinics',
    icon: '🏥',
  },
  {
    label: 'Edukasi Kesehatan',
    href: '/admin/health-education',
    icon: '📚',
  },
  {
    label: 'Pengobatan Tradisional',
    href: '/admin/traditional-medicine',
    icon: '🌿',
  },
  {
    label: 'Laporan',
    href: '/admin/reports',
    icon: '📈',
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-slate-400">Kesehatan Digital ID</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          ← Kembali ke Dashboard User
        </Link>
      </div>
    </div>
  )
}
