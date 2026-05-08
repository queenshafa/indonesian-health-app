import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [doctorsResult, schedulesResult, queuesResult, usersResult] = await Promise.all([
    supabase.from('doctors').select('*', { count: 'exact', head: true }),
    supabase.from('doctor_schedules').select('*', { count: 'exact', head: true }),
    supabase.from('queues').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      label: 'Total Dokter',
      value: doctorsResult.count || 0,
      icon: '👨‍⚕️',
      href: '/admin/doctors',
    },
    {
      label: 'Total Jadwal',
      value: schedulesResult.count || 0,
      icon: '📅',
      href: '/admin/schedules',
    },
    {
      label: 'Total Antrian',
      value: queuesResult.count || 0,
      icon: '📋',
      href: '/admin/queues',
    },
    {
      label: 'Total Pengguna',
      value: usersResult.count || 0,
      icon: '👥',
      href: '/admin/users',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Kelola semua aspek platform kesehatan</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
            <a href={stat.href} className="block">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </a>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Aktivitas Terbaru</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Antrian baru dari pasien</p>
              <p className="text-sm text-gray-600">5 menit yang lalu</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Jadwal dokter diupdate</p>
              <p className="text-sm text-gray-600">1 jam yang lalu</p>
            </div>
            <span className="text-2xl">📅</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Pengguna baru mendaftar</p>
              <p className="text-sm text-gray-600">2 jam yang lalu</p>
            </div>
            <span className="text-2xl">👤</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Tindakan Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/admin/doctors/new" className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
            <span className="text-2xl">➕</span>
            <p className="text-sm font-medium mt-2">Tambah Dokter</p>
          </a>
          <a href="/admin/schedules" className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
            <span className="text-2xl">📝</span>
            <p className="text-sm font-medium mt-2">Buat Jadwal</p>
          </a>
          <a href="/admin/health-education/new" className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
            <span className="text-2xl">📖</span>
            <p className="text-sm font-medium mt-2">Post Edukasi</p>
          </a>
          <a href="/admin/reports" className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center">
            <span className="text-2xl">📊</span>
            <p className="text-sm font-medium mt-2">Lihat Laporan</p>
          </a>
        </div>
      </Card>
    </div>
  )
}
