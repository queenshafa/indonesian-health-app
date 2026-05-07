'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Doctor {
  id: string
  full_name: string
  specialization: string
  clinic?: {
    name: string
  }
}

interface DoctorBookingModalProps {
  doctor: Doctor
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DoctorBookingModal({
  doctor,
  isOpen,
  onClose,
  onSuccess,
}: DoctorBookingModalProps) {
  const [step, setStep] = useState(1)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [reasonForVisit, setReasonForVisit] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!appointmentDate || !appointmentTime || !reasonForVisit) {
      setError('Semua field harus diisi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get clinic_id from doctor
      const doctorResponse = await fetch(`/api/doctors?doctor_id=${doctor.id}`)
      const doctorData = await doctorResponse.json()

      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
          clinic_id: doctorData[0]?.clinic_id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason_for_visit: reasonForVisit,
          consultation_type: 'general',
        }),
      })

      if (!response.ok) throw new Error('Failed to create appointment')

      const result = await response.json()
      console.log('[v0] Appointment created:', result)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating appointment')
    } finally {
      setLoading(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Jadwal Konsultasi</DialogTitle>
          <DialogDescription>
            {doctor.full_name} • {doctor.specialization}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pilih Tanggal
                </label>
                <Input
                  type="date"
                  min={minDate}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pilih Jam
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setAppointmentTime(time)}
                      className={`p-2 rounded text-sm font-medium transition-colors ${
                        appointmentTime === time
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!appointmentDate || !appointmentTime}
                className="w-full"
              >
                Lanjut
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <span className="font-medium">Tanggal:</span> {appointmentDate}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Jam:</span> {appointmentTime}
                  </p>
                </CardContent>
              </Card>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Keluhan / Alasan Kunjungan
                </label>
                <textarea
                  className="w-full p-2 border rounded resize-none"
                  rows={4}
                  placeholder="Jelaskan keluhan atau alasan kunjungan Anda..."
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Memproses...' : 'Konfirmasi Booking'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
