'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SymptomInput } from '@/components/symptom/symptom-input'
import { SymptomResult } from '@/components/symptom/symptom-result'

interface AnalysisResult {
  disclaimer: string
  possible_conditions: Array<{
    name: string
    likelihood: 'high' | 'medium' | 'low'
    description: string
  }>
  urgency_level: 'low' | 'medium' | 'high' | 'emergency'
  urgency_color: 'green' | 'yellow' | 'orange' | 'red'
  immediate_actions: string[]
  when_to_see_doctor: string
  red_flags: string[]
  follow_up_questions?: string[]
}

export default function SymptomCheckerPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async (symptoms: string[], severity: string, duration: string) => {
    setLoading(true)
    setError('')
    setInfo('')

    try {
      const response = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          severity,
          duration,
        }),
      })

      if (!response.ok) {
        throw new Error('Gagal menganalisis gejala')
      }

      const data = await response.json()

      if (data?.status === 'processing') {
        setInfo('Permintaan analisis berhasil dikirim. Tunggu beberapa saat hingga N8N selesai memproses.')
        return
      }

      if (data?.analysis_result || Array.isArray(data?.possible_conditions)) {
        setResult(data)
        setStep('result')
        return
      }

      throw new Error(data?.error || 'Response analisis tidak valid')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cek Gejala Anda</h1>
            <p className="text-gray-600 mt-2">
              Input gejala Anda dan dapatkan saran tindakan awal yang aman
            </p>
          </div>
        </div>

      {step === 'intro' && (
        <Card className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-4">AI Symptom Checker</h2>
            <p className="text-gray-600 mb-6 max-w-xl">
              Alat bantu untuk menganalisis gejala yang Anda alami. Memberikan estimasi kondisi
              umum dan saran tindakan awal. Bukan pengganti konsultasi dokter profesional.
            </p>
            <Button
              onClick={() => setStep('input')}
              size="lg"
            >
              Mulai Analisis
            </Button>
          </div>
        </Card>
      )}

      {step === 'input' && (
        <>
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-900">❌ {error}</p>
            </div>
          )}
          {info && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-blue-900">ℹ️ {info}</p>
            </div>
          )}
          <SymptomInput onAnalyze={handleAnalyze} loading={loading} />
        </>
      )}

      {step === 'result' && result && (
        <SymptomResult
          result={result}
          onBack={() => setStep('input')}
        />
      )}
      </div>
    </div>
  )
}
