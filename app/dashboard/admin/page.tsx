import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkIsAdmin } from '@/lib/auth/check-admin'
import QueueManager from '@/components/admin/queue-manager'
import DoctorAvailability from '@/components/admin/doctor-availability'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function AdminDashboard() {
  // Check if user is admin
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Kelola antrian, dokter, dan sistem kesehatan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Antrian Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-gray-600">Real-time updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dokter Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-gray-600">Status hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Klinik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-gray-600">Fasilitas partner</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="queues" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queues">Manajemen Antrian</TabsTrigger>
          <TabsTrigger value="doctors">Ketersediaan Dokter</TabsTrigger>
        </TabsList>

        <TabsContent value="queues" className="space-y-4">
          <QueueManager />
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <DoctorAvailability />
        </TabsContent>
      </Tabs>
    </div>
  )
}
