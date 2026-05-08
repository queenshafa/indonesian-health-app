'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Queue {
  id: string
  queue_number: number
  estimated_wait_time_minutes: number
  status: string
  doctor?: {
    full_name: string
    specialization: string
    avatar_url?: string
  }
  clinic?: {
    name: string
    phone: string
  }
  appointment_date: string
  appointment_time: string
}

interface QueueStatusProps {
  queue: Queue
  onStatusChange?: () => void
}

export default function QueueStatus({ queue: initialQueue, onStatusChange }: QueueStatusProps) {
  const [queue, setQueue] = useState(initialQueue)
  const [remainingWaitTime, setRemainingWaitTime] = useState(queue.estimated_wait_time_minutes)
  const [queueAhead, setQueueAhead] = useState(queue.queue_number - 1)

  useEffect(() => {
    // Update wait time every 30 seconds
    const interval = setInterval(() => {
      setRemainingWaitTime((prev) => Math.max(0, prev - 0.5))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to real-time updates for this specific queue
    const channel = supabase
      .channel(`queue:${queue.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queues',
          filter: `id=eq.${queue.id}`,
        },
        (payload) => {
          console.log('[v0] Queue update received:', payload)
          
          const updatedQueue = payload.new || queue
          setQueue(updatedQueue)
          
          // Notify user when status changes to 'called'
          if (payload.new?.status === 'called' && queue.status !== 'called') {
            toast.success(`Giliran Anda! Silahkan menuju ruangan dokter ${queue.doctor?.full_name}`, {
              description: `Klinik ${queue.clinic?.name}`,
              duration: 10000,
            })
          }
          
          // Update queue ahead count
          if (updatedQueue.queue_number) {
            setQueueAhead(Math.max(0, updatedQueue.queue_number - 1))
          }
          
          onStatusChange?.()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queue.id, queue.status, queue.doctor?.full_name, queue.clinic?.name, onStatusChange])

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
      default:
        return status
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{queue.doctor?.full_name}</h3>
              <p className="text-sm text-gray-600">{queue.doctor?.specialization}</p>
            </div>
            <Badge className={getStatusColor(queue.status)}>
              {getStatusLabel(queue.status)}
            </Badge>
          </div>

          {/* Queue Number & Wait Time */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Nomor Antrian</p>
                <p className="text-2xl font-bold text-blue-600">#{queue.queue_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Estimasi Tunggu</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.ceil(remainingWaitTime)} menit
                </p>
              </div>
            </div>
            {queueAhead > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {queueAhead} orang lagi sebelum Anda
              </p>
            )}
          </div>

          {/* Appointment Info */}
          <div className="border-t pt-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{queue.clinic?.name}</span> • {queue.appointment_date} {queue.appointment_time}
            </p>
            {queue.clinic?.phone && (
              <p className="text-sm text-gray-500 mt-1">{queue.clinic.phone}</p>
            )}
          </div>

          {/* Notification Message */}
          {queue.status === 'waiting' && (
            <div className="bg-green-50 border border-green-200 p-2 rounded text-sm text-green-800">
              ✓ Anda akan menerima notifikasi setelah 5 orang sebelum giliran Anda
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
