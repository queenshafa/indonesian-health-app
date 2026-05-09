'use client'

import { useEffect, useState } from 'react'
import QueueStatus from '@/components/queue/queue-status'
import DoctorSearch from '@/components/queue/doctor-search'
import QuickActions from '@/components/dashboard/quick-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

export default function DashboardPage() {
  const [queues, setQueues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQueues()

    // Auto refresh setiap 15 detik
    const interval = setInterval(fetchQueues, 15000)

    return () => clearInterval(interval)
  }, [])

  const fetchQueues = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/queues', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch queues')
      }

      const data = await response.json()

      // Pastikan selalu array
      setQueues(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Fetch queues error:', err)
      setError(
        err instanceof Error ? err.message : 'Error loading queues'
      )
      setQueues([])
    } finally {
      setLoading(false)
    }
  }

  // Queue aktif
  const activeQueues = queues.filter((q) =>
    ['waiting', 'called', 'in_consultation'].includes(q.status)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Kesehatan
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola antrian, jadwal dokter, dan kesehatan Anda
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Memuat data antrian...
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Active Queues */}
      {!loading && activeQueues.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">
              Antrian Aktif Anda
            </CardTitle>
            <CardDescription>
              Anda memiliki {activeQueues.length} antrian yang sedang
              berlangsung
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {activeQueues.map((queue) => (
                <QueueStatus
                  key={queue.id ?? `${queue.doctor_id}-${queue.appointment_date}`}
                  queue={queue}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="booking">
            Booking Dokter
          </TabsTrigger>
          <TabsTrigger value="history">
            Riwayat Antrian
          </TabsTrigger>
        </TabsList>

        {/* Booking Tab */}
        <TabsContent value="booking" className="space-y-4">
          <DoctorSearch onQueueCreated={fetchQueues} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Antrian</CardTitle>
              <CardDescription>
                Riwayat semua antrian dan konsultasi Anda
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-gray-500">
                  Memuat riwayat antrian...
                </p>
              ) : queues.length === 0 ? (
                <p className="text-gray-500">
                  Belum ada riwayat antrian
                </p>
              ) : (
                <div className="space-y-2">
                  {queues.map((queue) => (
                    <div
                      key={
                        queue.id ??
                        `${queue.doctor_id}-${queue.appointment_date}`
                      }
                      className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">
                          {queue.doctor?.full_name ??
                            'Dokter Tidak Diketahui'}
                        </p>

                        <p className="text-sm text-gray-500">
                          {queue.clinic?.name ??
                            'Klinik Tidak Diketahui'}
                        </p>

                        <p className="text-xs text-gray-400">
                          {queue.appointment_date
                            ? new Date(
                                queue.appointment_date
                              ).toLocaleDateString('id-ID')
                            : '-'}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          queue.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : queue.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {queue.status === 'completed'
                          ? 'Selesai'
                          : queue.status === 'cancelled'
                          ? 'Batal'
                          : queue.status === 'waiting'
                          ? 'Menunggu'
                          : queue.status === 'called'
                          ? 'Dipanggil'
                          : queue.status === 'in_consultation'
                          ? 'Konsultasi'
                          : queue.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}