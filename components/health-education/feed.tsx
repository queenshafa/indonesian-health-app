'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HealthEducation {
  id: string
  title: string
  content: string
  category: string
  image_url?: string
  duration_minutes?: number
  likes_count?: number
}

const mockEducations: HealthEducation[] = [
  {
    id: '1',
    title: 'Cara Tidur Berkualitas untuk Kesehatan',
    content: 'Tidur yang cukup dan berkualitas sangat penting. Usahakan tidur 7-8 jam per hari, atur jadwal tidur yang konsisten, dan hindari gadget 1 jam sebelum tidur.',
    category: 'sleep',
    duration_minutes: 5,
    likes_count: 234,
  },
  {
    id: '2',
    title: 'Pola Makan Sehat untuk Setiap Hari',
    content: 'Makan makanan bergizi dengan porsi seimbang. Konsumsi sayuran, buah, protein, dan karbohidrat. Hindari makanan berlebihan gula dan minyak.',
    category: 'nutrition',
    duration_minutes: 6,
    likes_count: 156,
  },
  {
    id: '3',
    title: 'Olahraga Ringan 30 Menit Setiap Hari',
    content: 'Olahraga teratur meningkatkan kesehatan jantung dan mental. Coba jalan cepat, bersepeda, atau berenang selama 30 menit.',
    category: 'exercise',
    duration_minutes: 4,
    likes_count: 198,
  },
  {
    id: '4',
    title: 'Manajemen Stres untuk Kesejahteraan Mental',
    content: 'Kelola stres dengan meditasi, yoga, atau aktivitas yang Anda nikmati. Istirahat cukup dan jangan ragu untuk meminta bantuan.',
    category: 'mental_health',
    duration_minutes: 7,
    likes_count: 212,
  },
]

const categoryLabels: Record<string, string> = {
  sleep: '😴 Tidur',
  nutrition: '🥗 Nutrisi',
  exercise: '🏃 Olahraga',
  mental_health: '🧘 Kesehatan Mental',
  first_aid: '🩹 Pertolongan Pertama',
  disease_prevention: '🛡️ Pencegahan Penyakit',
  hygiene: '🧼 Kebersihan',
  vaccination: '💉 Vaksinasi',
}

export default function HealthEducationFeed() {
  const [educations, setEducations] = useState<HealthEducation[]>(mockEducations)
  const [loading, setLoading] = useState(false)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sleep: 'bg-blue-100 text-blue-800',
      nutrition: 'bg-green-100 text-green-800',
      exercise: 'bg-orange-100 text-orange-800',
      mental_health: 'bg-purple-100 text-purple-800',
      first_aid: 'bg-red-100 text-red-800',
      disease_prevention: 'bg-yellow-100 text-yellow-800',
      hygiene: 'bg-cyan-100 text-cyan-800',
      vaccination: 'bg-pink-100 text-pink-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>Edukasi Kesehatan Harian</CardTitle>
          <CardDescription>
            Tips kesehatan sederhana untuk meningkatkan kualitas hidup Anda
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Memuat edukasi...</p>
      ) : (
        <div className="space-y-3">
          {educations.map((edu) => (
            <Card key={edu.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{edu.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {edu.duration_minutes} menit baca
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getCategoryColor(edu.category)}`}>
                      {categoryLabels[edu.category] || edu.category}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {edu.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <button className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1">
                      ❤️ {edu.likes_count || 0}
                    </button>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Baca Selengkapnya →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
