'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface Step {
  number: number
  title: string
  description: string
  documents: string[]
  time?: string
}

interface BPJSGuideDisplayProps {
  title: string
  description: string
  steps: Step[]
  keyPoints: string[]
  tips: string[]
  onBack: () => void
  contactInfo?: {
    phone: string
    website: string
    email?: string
  }
}

export function BPJSGuideDisplay({
  title,
  description,
  steps,
  keyPoints,
  tips,
  onBack,
  contactInfo,
}: BPJSGuideDisplayProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-lg font-bold mb-4">📋 Langkah-Langkah</h3>
        <div className="space-y-3">
          {steps.map((step) => (
            <Card
              key={step.number}
              className="p-0 cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow"
              onClick={() =>
                setExpandedStep(expandedStep === step.number ? null : step.number)
              }
            >
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{step.title}</p>
                    {step.time && (
                      <p className="text-xs text-gray-600">⏱️ {step.time}</p>
                    )}
                  </div>
                </div>
                <span className="text-xl">
                  {expandedStep === step.number ? '▼' : '▶'}
                </span>
              </div>

              {expandedStep === step.number && (
                <div className="p-4 border-t border-gray-200">
                  <p className="text-gray-700 mb-4">{step.description}</p>

                  {step.documents.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-900 mb-2">
                        📄 Dokumen yang Dibutuhkan:
                      </p>
                      <ul className="space-y-1">
                        {step.documents.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-6">
          <h3 className="font-bold text-green-900 mb-4">✅ Poin-Poin Penting</h3>
          <ul className="space-y-2">
            {keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-green-900">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
          <h3 className="font-bold text-yellow-900 mb-4">💡 Tips & Trik</h3>
          <ul className="space-y-2">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-yellow-600 font-bold flex-shrink-0 mt-0.5">
                  💡
                </span>
                <span className="text-yellow-900">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact Info */}
      {contactInfo && (
        <Card className="p-6 bg-blue-50">
          <h3 className="font-bold mb-4">📞 Kontak BPJS Kesehatan</h3>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">Telepon:</span>{' '}
              <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:underline">
                {contactInfo.phone}
              </a>
            </p>
            <p>
              <span className="font-semibold">Website:</span>{' '}
              <a
                href={contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {contactInfo.website}
              </a>
            </p>
            {contactInfo.email && (
              <p>
                <span className="font-semibold">Email:</span>{' '}
                <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">
                  {contactInfo.email}
                </a>
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Kembali
        </Button>
        <Button className="flex-1">
          💬 Chat dengan BPJS
        </Button>
      </div>
    </div>
  )
}
