'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScheduleForm } from '@/components/admin/forms/schedule-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DAYS: Record<string, string> = {
  'monday': 'Senin',
  'tuesday': 'Selasa',
  'wednesday': 'Rabu',
  'thursday': 'Kamis',
  'friday': 'Jumat',
  'saturday': 'Sabtu',
  'sunday': 'Minggu'
}

export default function SchedulesManagement() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => {
    fetchDoctorsAndSchedules()
  }, [])

  const fetchDoctorsAndSchedules = async () => {
    try {
      const [doctorsRes, schedulesRes] = await Promise.all([
        fetch('/api/admin/doctors'),
        fetch('/api/admin/schedules')
      ])

      const doctorsData = await doctorsRes.json()
      const schedulesData = await schedulesRes.json()

      setDoctors(doctorsData.doctors || [])
      setSchedules(schedulesData.schedules || [])
      if (doctorsData.doctors?.length > 0) {
        setSelectedDoctor(doctorsData.doctors[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return

    try {
      // Implement delete schedule endpoint if needed
      alert('Delete schedule functionality coming soon')
    } catch (error) {
      alert('Gagal menghapus jadwal')
    }
  }

  const filteredSchedules = selectedDoctor
    ? schedules.filter(s => s.doctor_id === selectedDoctor)
    : schedules

  if (loading) return <div className="text-center py-8">Memuat...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Jadwal</h1>
        <p className="text-gray-600 mt-1">Kelola jadwal praktik dokter</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Daftar Jadwal</TabsTrigger>
          <TabsTrigger value="add">Tambah Jadwal</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {/* Filter by Doctor */}
            <div>
              <label className="text-sm font-medium">Filter Dokter:</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-2"
              >
                <option value="">Semua Dokter</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.full_name} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* Schedules Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredSchedules.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    Tidak ada jadwal untuk dokter ini
                  </CardContent>
                </Card>
              ) : (
                filteredSchedules.map(schedule => (
                  <Card key={schedule.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">
                            {DAYS[schedule.day_of_week]}
                          </div>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <p>Jam: {schedule.start_time} - {schedule.end_time}</p>
                            {schedule.break_time_start && (
                              <p>Istirahat: {schedule.break_time_start} - {schedule.break_time_end}</p>
                            )}
                            <p>Max Pasien: {schedule.max_patients_per_session}</p>
                            <p>Durasi Konsultasi: {schedule.consultation_slot_duration_minutes} menit</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                            schedule.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.is_active ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          {selectedDoctor ? (
            <ScheduleForm
              doctorId={selectedDoctor}
              onSuccess={() => {
                setActiveTab('list')
                fetchDoctorsAndSchedules()
              }}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Pilih dokter terlebih dahulu untuk menambah jadwal
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
