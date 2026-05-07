'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SymptomInputProps {
  onAnalyze?: (symptoms: string[], severity: string, duration: string) => void
  loading?: boolean
}

const COMMON_SYMPTOMS = [
  { id: 'demam', label: 'Demam', icon: '🌡️' },
  { id: 'batuk', label: 'Batuk', icon: '💨' },
  { id: 'pilek', label: 'Pilek', icon: '🤧' },
  { id: 'sakit_kepala', label: 'Sakit Kepala', icon: '🤕' },
  { id: 'mual', label: 'Mual', icon: '😵' },
  { id: 'muntah', label: 'Muntah', icon: '🤮' },
  { id: 'diare', label: 'Diare', icon: '💫' },
  { id: 'sakit_perut', label: 'Sakit Perut', icon: '🫠' },
  { id: 'sesak_napas', label: 'Sesak Napas', icon: '😮‍💨' },
  { id: 'nyeri_dada', label: 'Nyeri Dada', icon: '💔' },
  { id: 'sakit_tenggorokan', label: 'Sakit Tenggorokan', icon: '😣' },
  { id: 'lelah', label: 'Lelah', icon: '😴' },
  { id: 'hilang_selera_makan', label: 'Hilang Selera Makan', icon: '🍽️' },
  { id: 'ruam', label: 'Ruam Kulit', icon: '🔴' },
  { id: 'gatal', label: 'Gatal', icon: '🤜' },
]

export function SymptomInput({ onAnalyze, loading }: SymptomInputProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState('moderate')
  const [duration, setDuration] = useState('1 hari')
  const [customSymptom, setCustomSymptom] = useState('')

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    )
  }

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom)) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom])
      setCustomSymptom('')
    }
  }

  const handleAnalyze = () => {
    if (selectedSymptoms.length > 0) {
      onAnalyze?.(selectedSymptoms, severity, duration)
    }
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200 p-4">
        <p className="text-sm text-amber-900">
          ⚠️ <strong>Disclaimer Medis:</strong> Tools ini hanya untuk informasi awal. Bukan
          diagnosis resmi. Selalu konsultasi dokter untuk diagnosis dan pengobatan yang tepat.
        </p>
      </Card>

      {/* Symptom Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pilih Gejala yang Anda Alami</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {COMMON_SYMPTOMS.map((symptom) => (
            <button
              key={symptom.id}
              onClick={() => toggleSymptom(symptom.id)}
              className={`p-4 rounded-lg text-center transition-all ${
                selectedSymptoms.includes(symptom.id)
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">{symptom.icon}</div>
              <div className="text-sm font-medium text-balance">{symptom.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Symptom */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Gejala Lainnya (Tidak di Atas)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ketik gejala lainnya..."
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <Button
            onClick={addCustomSymptom}
            variant="outline"
            size="sm"
          >
            Tambah
          </Button>
        </div>
      </div>

      {/* Selected Symptoms Display */}
      {selectedSymptoms.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Gejala Dipilih ({selectedSymptoms.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((symptom) => (
              <Badge
                key={symptom}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom} ✕
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Berapa Lama Gejala Ini?
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="< 1 hari">Kurang dari 1 hari</option>
          <option value="1 hari">1 hari</option>
          <option value="2-3 hari">2-3 hari</option>
          <option value="1 minggu">1 minggu</option>
          <option value="> 1 minggu">Lebih dari 1 minggu</option>
        </select>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Seberapa Parah Gejalanya?
        </label>
        <div className="space-y-2">
          {[
            { value: 'mild', label: '🟢 Ringan - Mengganggu tapi bisa beraktivitas', color: 'bg-green-100 border-green-300' },
            { value: 'moderate', label: '🟡 Sedang - Mengurangi aktivitas', color: 'bg-yellow-100 border-yellow-300' },
            { value: 'severe', label: '🔴 Berat - Sulit beraktivitas', color: 'bg-red-100 border-red-300' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSeverity(option.value)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                severity === option.value
                  ? `${option.color} ring-2`
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={selectedSymptoms.length === 0 || loading}
        size="lg"
        className="w-full"
      >
        {loading ? 'Menganalisis...' : 'Analisis Gejala Saya'}
      </Button>
    </div>
  )
}
