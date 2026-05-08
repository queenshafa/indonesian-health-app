'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Queue {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
  queue_number: number
  estimated_wait_time_minutes: number
}

export function QueuesTable() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueues()
  }, [])

  const fetchQueues = async () => {
    try {
      const response = await fetch('/api/admin/queues')
      const data = await response.json()
      setQueues(data.queues || [])
    } catch (error) {
      console.error('Failed to fetch queues:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQueueStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/queues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })

      if (response.ok) {
        fetchQueues()
        alert('Status antrian berhasil diupdate!')
      }
    } catch (error) {
      alert('Gagal update status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-600'
      case 'called': return 'text-blue-600'
      case 'in_consultation': return 'text-purple-600'
      case 'completed': return 'text-green-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) return <div className="text-center py-8">Memuat...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Antrian Pasien</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">No Antrian</th>
                <th className="text-left p-2">Tanggal</th>
                <th className="text-left p-2">Jam</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Estimasi Tunggu</th>
                <th className="text-left p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {queues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Tidak ada antrian
                  </td>
                </tr>
              ) : (
                queues.map(queue => (
                  <tr key={queue.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-bold">{queue.queue_number || '-'}</td>
                    <td className="p-2">{queue.appointment_date}</td>
                    <td className="p-2">{queue.appointment_time}</td>
                    <td className={`p-2 font-medium ${getStatusColor(queue.status)}`}>
                      {queue.status}
                    </td>
                    <td className="p-2">{queue.estimated_wait_time_minutes || 0} menit</td>
                    <td className="p-2 space-x-1">
                      {queue.status === 'waiting' && (
                        <Button
                          size="sm"
                          onClick={() => updateQueueStatus(queue.id, 'called')}
                          className="text-xs"
                        >
                          Panggil
                        </Button>
                      )}
                      {queue.status === 'called' && (
                        <Button
                          size="sm"
                          onClick={() => updateQueueStatus(queue.id, 'in_consultation')}
                          className="text-xs"
                        >
                          Konsultasi
                        </Button>
                      )}
                      {queue.status === 'in_consultation' && (
                        <Button
                          size="sm"
                          onClick={() => updateQueueStatus(queue.id, 'completed')}
                          className="text-xs"
                        >
                          Selesai
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
