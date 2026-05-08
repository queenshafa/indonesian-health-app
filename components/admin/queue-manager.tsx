'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Queue {
  id: string
  queue_number: number
  status: string
  appointment_date: string
  appointment_time: string
  doctor?: { full_name: string; specialization: string }
  clinic?: { name: string }
  patient?: { email: string }
}

export default function QueueManager() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQueues()
  }, [])

  const fetchQueues = async () => {
    try {
      const response = await fetch('/api/admin/queues')
      if (!response.ok) throw new Error('Failed to fetch queues')
      const data = await response.json()
      setQueues(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading queues')
    } finally {
      setLoading(false)
    }
  }

  const updateQueueStatus = async (queueId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/queues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_id: queueId, status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update queue')

      toast.success(`Antrian diperbarui menjadi ${newStatus}`)
      fetchQueues()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error updating queue')
    }
  }

  const cancelQueue = async (queueId: string) => {
    try {
      const response = await fetch('/api/admin/queues', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_id: queueId }),
      })

      if (!response.ok) throw new Error('Failed to cancel queue')

      toast.success('Antrian dibatalkan')
      fetchQueues()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error canceling queue')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'called':
        return 'bg-blue-100 text-blue-800'
      case 'in_consultation':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Menunggu'
      case 'called':
        return 'Dipanggil'
      case 'in_consultation':
        return 'Konsultasi'
      case 'completed':
        return 'Selesai'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data antrian...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Antrian</CardTitle>
          <CardDescription>
            Total antrian: {queues.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
              <p className="text-red-900">❌ {error}</p>
            </div>
          )}

          {queues.length === 0 ? (
            <p className="text-gray-600">Tidak ada antrian saat ini</p>
          ) : (
            <div className="space-y-3">
              {queues.map((queue) => (
                <div
                  key={queue.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl font-bold text-blue-600">#{queue.queue_number}</span>
                      <Badge className={getStatusColor(queue.status)}>
                        {getStatusLabel(queue.status)}
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900">{queue.doctor?.full_name}</p>
                    <p className="text-sm text-gray-600">{queue.clinic?.name}</p>
                    <p className="text-xs text-gray-500">
                      {queue.appointment_date} {queue.appointment_time} • {queue.patient?.email}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {queue.status === 'waiting' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateQueueStatus(queue.id, 'called')}
                        >
                          Panggil
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelQueue(queue.id)}
                        >
                          Batal
                        </Button>
                      </>
                    )}
                    {queue.status === 'called' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateQueueStatus(queue.id, 'in_consultation')}
                      >
                        Konsultasi
                      </Button>
                    )}
                    {queue.status === 'in_consultation' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateQueueStatus(queue.id, 'completed')}
                      >
                        Selesai
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
