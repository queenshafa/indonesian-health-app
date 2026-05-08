'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QueuesTable } from '@/components/admin/tables/queues-table'

export default function QueuesManagement() {
  const [stats, setStats] = useState({
    totalToday: 0,
    waiting: 0,
    inConsultation: 0,
    completed: 0
  })

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/admin/queues?date=${today}`)
      const data = await response.json()
      
      const queues = data.queues || []
      setStats({
        totalToday: queues.length,
        waiting: queues.filter((q: any) => q.status === 'waiting').length,
        inConsultation: queues.filter((q: any) => q.status === 'in_consultation').length,
        completed: queues.filter((q: any) => q.status === 'completed').length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Antrian</h1>
        <p className="text-gray-600 mt-1">Kelola antrian dan status pasien real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalToday}</div>
              <div className="text-sm text-gray-600 mt-1">Total Hari Ini</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.waiting}</div>
              <div className="text-sm text-gray-600 mt-1">Menunggu</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.inConsultation}</div>
              <div className="text-sm text-gray-600 mt-1">Konsultasi</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600 mt-1">Selesai</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Table */}
      <QueuesTable />
    </div>
  )
}
