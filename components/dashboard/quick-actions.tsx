'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'

const actions = [
  {
    icon: '🏥',
    label: 'Cari Dokter',
    href: '/dashboard?tab=booking',
    color: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    icon: '🚑',
    label: 'Darurat Terdekat',
    href: '/emergency',
    color: 'bg-red-50 hover:bg-red-100',
  },
  {
    icon: '💊',
    label: 'BPJS Assistant',
    href: '/bpjs-assistant',
    color: 'bg-green-50 hover:bg-green-100',
  },
  {
    icon: '🩺',
    label: 'Cek Gejala',
    href: '/symptom-checker',
    color: 'bg-purple-50 hover:bg-purple-100',
  },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className={`p-4 cursor-pointer transition-colors ${action.color}`}>
            <div className="text-3xl mb-2">{action.icon}</div>
            <p className="font-medium text-sm">{action.label}</p>
          </Card>
        </Link>
      ))}
    </div>
  )
}
