'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Condition {
  name: string
  likelihood: 'high' | 'medium' | 'low'
  description: string
}

interface SymptomAnalysisResult {
  disclaimer: string
  possible_conditions: Condition[]
  urgency_level: 'low' | 'medium' | 'high' | 'emergency'
  urgency_color: 'green' | 'yellow' | 'orange' | 'red'
  immediate_actions: string[]
  when_to_see_doctor: string
  red_flags: string[]
  follow_up_questions?: string[]
}

interface SymptomResultProps {
  result?: SymptomAnalysisResult
  onBack?: () => void
}

const URGENCY_DETAILS = {
  low: {
    title: 'Tingkat Urgensi: RENDAH',
    icon: '🟢',
    color: 'bg-green-100 text-green-900',
    advice: 'Anda bisa rawat sendiri di rumah. Pantau gejala Anda.',
  },
  medium: {
    title: 'Tingkat Urgensi: SEDANG',
    icon: '🟡',
    color: 'bg-yellow-100 text-yellow-900',
    advice: 'Sebaiknya kunjungi dokter dalam beberapa hari ke depan.',
  },
  high: {
    title: 'Tingkat Urgensi: TINGGI',
    icon: '🟠',
    color: 'bg-orange-100 text-orange-900',
    advice: 'Segera kunjungi dokter hari ini atau ke IGD.',
  },
  emergency: {
    title: 'Tingkat Urgensi: DARURAT',
    icon: '🔴',
    color: 'bg-red-100 text-red-900',
    advice: 'Hubungi ambulans atau langsung ke IGD rumah sakit terdekat!',
  },
}

const getLikelihoodColor = (likelihood: string) => {
  switch (likelihood) {
    case 'high':
      return 'bg-red-100 text-red-900'
    case 'medium':
      return 'bg-yellow-100 text-yellow-900'
    case 'low':
      return 'bg-green-100 text-green-900'
    default:
      return 'bg-gray-100 text-gray-900'
  }
}

export function SymptomResult({
  result,
  onBack,
}: SymptomResultProps) {

  // loading state async webhook
  if (!result) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">
          ⏳ Sedang memproses analisis...
        </p>
      </Card>
    )
  }

  const urgency =
    URGENCY_DETAILS[result?.urgency_level] ||
    URGENCY_DETAILS.low

  return (
    <div className="space-y-6">

      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200 p-4">
        <p className="text-sm text-amber-900 font-semibold">
          {result?.disclaimer}
        </p>
      </Card>

      {/* Urgency Level */}
      <Card className={`${urgency.color} p-6 border-2`}>
        <div className="text-center">
          <div className="text-4xl mb-3">
            {urgency.icon}
          </div>

          <h2 className="text-xl font-bold mb-2">
            {urgency.title}
          </h2>

          <p className="text-lg font-semibold">
            {urgency.advice}
          </p>
        </div>
      </Card>

      {/* Immediate Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          ✅ Tindakan Langsung yang Bisa Anda Lakukan
        </h3>

        <ul className="space-y-2">
          {result?.immediate_actions?.map(
            (action, idx) => (
              <li
                key={idx}
                className="flex gap-3 items-start"
              >
                <span className="text-green-600 font-bold flex-shrink-0 mt-1">
                  ✓
                </span>

                <span className="text-gray-700">
                  {action}
                </span>
              </li>
            )
          )}
        </ul>
      </div>

      {/* Possible Conditions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          📋 Kemungkinan Kondisi yang Umum
        </h3>

        <div className="space-y-3">
          {result?.possible_conditions?.map(
            (condition, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between gap-4 mb-2">

                  <h4 className="font-semibold text-gray-900">
                    {condition.name}
                  </h4>

                  <Badge
                    className={`whitespace-nowrap ${getLikelihoodColor(condition.likelihood)}`}
                  >
                    {condition.likelihood === 'high' &&
                      'Kemungkinan Tinggi'}

                    {condition.likelihood === 'medium' &&
                      'Kemungkinan Sedang'}

                    {condition.likelihood === 'low' &&
                      'Kemungkinan Rendah'}
                  </Badge>
                </div>

                <p className="text-gray-600 text-sm">
                  {condition.description}
                </p>
              </Card>
            )
          )}
        </div>
      </div>

      {/* When to See Doctor */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          🏥 Kapan Harus ke Dokter?
        </h3>

        <p className="text-blue-900 text-sm">
          {result?.when_to_see_doctor}
        </p>
      </Card>

      {/* Red Flags */}
      {result?.red_flags?.length > 0 && (
        <Card className="bg-red-50 border-red-200 p-4">

          <h3 className="font-semibold text-red-900 mb-3">
            ⚠️ Tanda Bahaya - Langsung ke IGD Jika:
          </h3>

          <ul className="space-y-2">
            {result?.red_flags?.map(
              (flag, idx) => (
                <li
                  key={idx}
                  className="flex gap-2 items-start text-red-900 text-sm"
                >
                  <span className="flex-shrink-0 mt-1">
                    ⚠️
                  </span>

                  <span>{flag}</span>
                </li>
              )
            )}
          </ul>
        </Card>
      )}

      {/* Follow Up Questions */}
{(result?.follow_up_questions?.length ?? 0) > 0 && (
  <Card className="bg-gray-50 p-4">

    <h3 className="font-semibold mb-3">
      💭 Pertanyaan Lanjutan untuk Dokter:
    </h3>

    <ul className="space-y-2">
      {result?.follow_up_questions?.map(
        (question, idx) => (
          <li
            key={idx}
            className="flex gap-2 text-gray-700 text-sm"
          >
            <span className="flex-shrink-0 mt-1">
              ❓
            </span>

            <span>{question}</span>
          </li>
        )
      )}
    </ul>
  </Card>
)}

      {/* Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {(result?.urgency_level === 'high' ||
          result?.urgency_level === 'emergency') && (
          <Button className="bg-red-600 hover:bg-red-700">
            📍 Cari IGD Terdekat
          </Button>
        )}

        <Button>
          👨‍⚕️ Booking Dokter
        </Button>

        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
          >
            ← Analisis Ulang
          </Button>
        )}
      </div>

      {/* Note */}
      <Card className="bg-gray-50 p-4 border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Hasil analisis ini hanya panduan awal.
          Dokter adalah satu-satunya yang dapat
          memberikan diagnosis resmi dan
          pengobatan yang tepat.
        </p>
      </Card>
    </div>
  )
}