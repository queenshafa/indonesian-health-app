'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ScheduleFormProps {
  doctorId: string
  onSuccess?: () => void
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function ScheduleForm({ doctorId, onSuccess }: ScheduleFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    day_of_week: 'monday',
    start_time: '08:00',
    end_time: '17:00',
    break_time_start: '12:00',
    break_time_end: '13:00',
    max_patients_per_session: 20
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctorId,
          ...formData
        })
      })

      if (!response.ok) throw new Error('Failed to create schedule')

      alert('Jadwal berhasil ditambahkan!')
      onSuccess?.()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Jadwal Dokter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Hari</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                className="w-full border rounded px-2 py-2 mt-1"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Max Pasien/Sesi</label>
              <Input
                type="number"
                value={formData.max_patients_per_session}
                onChange={(e) => setFormData({ ...formData, max_patients_per_session: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Jam Mulai</label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Jam Selesai</label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Istirahat Mulai</label>
              <Input
                type="time"
                value={formData.break_time_start}
                onChange={(e) => setFormData({ ...formData, break_time_start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Istirahat Selesai</label>
              <Input
                type="time"
                value={formData.break_time_end}
                onChange={(e) => setFormData({ ...formData, break_time_end: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menyimpan...' : 'Tambah Jadwal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
