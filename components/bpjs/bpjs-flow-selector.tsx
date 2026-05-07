'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BPJSFlowSelectorProps {
  onSelect: (action: string) => void
}

const BPJS_OPTIONS = [
  {
    id: 'rujukan',
    title: 'Cara Mengajukan Rujukan',
    icon: '📋',
    description: 'Dari fasilitas kesehatan tingkat 1 ke spesialis',
    time: '~1-3 hari',
  },
  {
    id: 'pindah_faskes',
    title: 'Pindah Fasilitas Kesehatan',
    icon: '🏥',
    description: 'Mengubah tempat berobat utama BPJS Anda',
    time: '~5 hari',
  },
  {
    id: 'daftar_online',
    title: 'Daftar BPJS Online',
    icon: '💻',
    description: 'Cara mendaftar menjadi peserta BPJS',
    time: '~1 minggu',
  },
  {
    id: 'informasi',
    title: 'Informasi BPJS Umum',
    icon: 'ℹ️',
    description: 'Tips & trik menggunakan BPJS dengan efektif',
    time: 'Referensi',
  },
  {
    id: 'dokumen',
    title: 'Dokumen yang Dibutuhkan',
    icon: '📄',
    description: 'Dokumen apa saja untuk berbagai transaksi BPJS',
    time: 'Checklist',
  },
  {
    id: 'klaim',
    title: 'Proses Klaim BPJS',
    icon: '✅',
    description: 'Cara mengajukan dan menyelesaikan klaim BPJS',
    time: '~2 minggu',
  },
]

export function BPJSFlowSelector({ onSelect }: BPJSFlowSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Bagaimana BPJS Bekerja?</h3>
        <p className="text-blue-900 text-sm mb-4">
          BPJS Kesehatan adalah sistem asuransi kesehatan milik pemerintah. Dengan BPJS, Anda bisa
          berobat gratis atau dengan biaya terjangkau di fasilitas kesehatan yang bekerja sama.
        </p>
        <p className="text-blue-900 text-sm">
          Pilih salah satu topik di bawah untuk mendapatkan panduan step-by-step yang sesuai dengan
          kebutuhan Anda.
        </p>
      </Card>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BPJS_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="text-left"
          >
            <Card className="p-6 hover:shadow-lg transition-all h-full hover:border-blue-300">
              <div className="text-4xl mb-3">{option.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{option.description}</p>
              <div className="text-xs text-blue-600 font-medium">⏱️ {option.time}</div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
