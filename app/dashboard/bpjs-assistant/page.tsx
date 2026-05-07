'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BPJSFlowSelector } from '@/components/bpjs/bpjs-flow-selector'
import { BPJSGuideDisplay } from '@/components/bpjs/bpjs-guide-display'

interface Step {
  number: number
  title: string
  description: string
  documents: string[]
  time?: string
}

interface BPJSGuide {
  title: string
  description: string
  steps: Step[]
  keyPoints: string[]
  tips: string[]
  contactInfo: { phone: string; website: string; email?: string }
}

const BPJS_GUIDES: Record<string, BPJSGuide> = {
  rujukan: {
    title: 'Cara Mengajukan Rujukan BPJS',
    description: 'Panduan lengkap untuk mendapatkan surat rujukan dari fasilitas kesehatan tingkat 1 ke spesialis',
    steps: [
      {
        number: 1,
        title: 'Kunjungi Fasilitas Kesehatan Tingkat 1',
        description: 'Datang ke Puskesmas, Klinik, atau dokter praktik yang menjadi faskes BPJS Anda. Bawa kartu BPJS asli dan kartu identitas.',
        documents: ['Kartu BPJS Asli', 'Kartu Identitas (KTP/SIM)', 'Asuransi Kesehatan Lainnya (jika ada)'],
        time: '30 menit'
      },
      {
        number: 2,
        title: 'Jelaskan Keluhan Kepada Dokter',
        description: 'Ceritakan gejala dan keluhan kesehatan Anda secara detail. Dokter akan melakukan pemeriksaan awal.',
        documents: [],
        time: '15-20 menit'
      },
      {
        number: 3,
        title: 'Dokter Mengevaluasi Perlu Rujukan',
        description: 'Jika dokter berpendapat Anda memerlukan penanganan spesialis, dia akan membuat surat rujukan.',
        documents: [],
        time: '5-10 menit'
      },
      {
        number: 4,
        title: 'Terima Surat Rujukan',
        description: 'Ambil surat rujukan yang sudah ditandatangani dokter. Surat ini akan menyebutkan spesialis apa yang Anda butuhkan.',
        documents: ['Surat Rujukan Asli', 'Fotokopi Surat Rujukan'],
        time: '2 menit'
      },
      {
        number: 5,
        title: 'Kunjungi Fasilitas Rujukan',
        description: 'Pergi ke rumah sakit atau klinik spesialis yang tercantum dalam surat rujukan. Datang sesuai jadwal yang ditentukan.',
        documents: ['Kartu BPJS', 'Surat Rujukan', 'Kartu Identitas', 'Surat Rujukan Fotokopi'],
        time: '1-3 hari'
      }
    ],
    keyPoints: [
      'Rujukan hanya berlaku 90 hari dari tanggal dibuat',
      'Jangan melewatkan jadwal rujukan atau surat akan hangus',
      'Surat rujukan dapat dibuat di hari yang sama saat kunjungan',
      'Beberapa spesialis tertentu mungkin memerlukan rujukan bertingkat'
    ],
    tips: [
      'Datang ke faskes tingkat 1 saat jam operasional untuk menghindari antrean panjang',
      'Minta fotokopi surat rujukan untuk arsip pribadi Anda',
      'Catat nama dokter spesialis dan nomor telepon rumah sakit tujuan',
      'Jika surat rujukan hangus, Anda bisa minta surat baru dari faskes tingkat 1'
    ],
    contactInfo: {
      phone: '1500-400 (BPJS Kesehatan)',
      website: 'www.bpjs-kesehatan.go.id',
      email: 'contact@bpjs-kesehatan.go.id'
    }
  },
  pindah_faskes: {
    title: 'Cara Pindah Fasilitas Kesehatan (Faskes)',
    description: 'Panduan untuk mengubah tempat berobat utama Anda dari satu faskes ke faskes lain',
    steps: [
      {
        number: 1,
        title: 'Persiapkan Data Pribadi',
        description: 'Siapkan nomor peserta BPJS atau NIK Anda. Anda bisa mengecek di kartu BPJS atau melalui aplikasi JKN Care.',
        documents: ['Kartu BPJS atau NIK'],
        time: '2 menit'
      },
      {
        number: 2,
        title: 'Buka Aplikasi JKN Care atau Website BPJS',
        description: 'Download aplikasi JKN Care di smartphone atau akses website www.bpjs-kesehatan.go.id. Login dengan akun Anda.',
        documents: [],
        time: '5 menit'
      },
      {
        number: 3,
        title: 'Pilih Menu "Ubah Faskes Tingkat 1"',
        description: 'Di aplikasi JKN Care, cari menu "Ubah Faskes" atau "Perubahan Data". Di website, cari menu serupa di bagian profil.',
        documents: [],
        time: '2 menit'
      },
      {
        number: 4,
        title: 'Pilih Faskes Baru',
        description: 'Cari fasilitas kesehatan baru yang diinginkan berdasarkan kecamatan, kelurahan, atau nama faskes. Baca rating dan informasi faskes.',
        documents: [],
        time: '5-10 menit'
      },
      {
        number: 5,
        title: 'Konfirmasi Perubahan',
        description: 'Tekan tombol "Ubah Faskes" untuk mengonfirmasi pilihan. Sistem akan menampilkan ringkasan perubahan.',
        documents: [],
        time: '1 menit'
      },
      {
        number: 6,
        title: 'Tunggu Proses Perubahan',
        description: 'Perubahan faskes memerlukan waktu 1x24 jam untuk diproses oleh sistem BPJS. Setelah itu, faskes baru Anda sudah aktif.',
        documents: [],
        time: '24 jam'
      }
    ],
    keyPoints: [
      'Perubahan faskes dapat dilakukan 1 kali per bulan',
      'Proses pindah faskes gratis dan tidak ada biaya tambahan',
      'Perubahan efektif setelah 24 jam, pastikan data benar sebelum submit',
      'Anda masih bisa menggunakan faskes lama selama masa transisi'
    ],
    tips: [
      'Pilih faskes yang dekat dengan rumah atau tempat kerja untuk kemudahan akses',
      'Cek jam operasional dan spesialisasi dokter sebelum memilih faskes baru',
      'Jika aplikasi JKN Care bermasalah, Anda bisa langsung datang ke kantor BPJS terdekat',
      'Catat tanggal perubahan agar Anda tahu kapan faskes baru aktif'
    ],
    contactInfo: {
      phone: '1500-400 (BPJS Kesehatan)',
      website: 'www.bpjs-kesehatan.go.id',
      email: 'contact@bpjs-kesehatan.go.id'
    }
  },
  daftar_online: {
    title: 'Cara Daftar Online di Faskes BPJS',
    description: 'Panduan untuk mendaftar dan membuat antrian online sebelum mengunjungi fasilitas kesehatan',
    steps: [
      {
        number: 1,
        title: 'Download Aplikasi JKN Care',
        description: 'Download aplikasi "JKN Care" atau "JKN Mobile" dari App Store (iOS) atau Google Play (Android). Atau akses website jkn.bpjs-kesehatan.go.id',
        documents: [],
        time: '3 menit'
      },
      {
        number: 2,
        title: 'Login ke Aplikasi',
        description: 'Masuk dengan nomor peserta BPJS dan password. Jika belum punya akun, daftar terlebih dahulu menggunakan NIK dan data pribadi.',
        documents: ['Nomor Peserta BPJS', 'NIK'],
        time: '5 menit'
      },
      {
        number: 3,
        title: 'Pilih Faskes Tujuan',
        description: 'Cari fasilitas kesehatan Anda di menu "Faskes" atau "Cari Faskes". Filter berdasarkan lokasi atau nama faskes.',
        documents: [],
        time: '5 menit'
      },
      {
        number: 4,
        title: 'Lihat Jadwal Dokter',
        description: 'Setelah memilih faskes, lihat jadwal dokter yang tersedia. Anda bisa memilih dokter spesifik atau dokter yang tersedia.',
        documents: [],
        time: '5 menit'
      },
      {
        number: 5,
        title: 'Pilih Jadwal Kunjungan',
        description: 'Tentukan tanggal dan jam yang Anda inginkan. Pastikan faskes membuka pada jam tersebut dan dokter tersedia.',
        documents: [],
        time: '3 menit'
      },
      {
        number: 6,
        title: 'Konfirmasi Pendaftaran',
        description: 'Review data yang sudah diisi (nama, alamat, tanggal kunjungan). Klik "Daftar" untuk menyelesaikan pendaftaran.',
        documents: [],
        time: '1 menit'
      },
      {
        number: 7,
        title: 'Dapatkan Nomor Antrian',
        description: 'Sistem akan memberikan nomor antrian Anda. Screenshot atau catat nomor ini untuk dibawa saat kunjungan ke faskes.',
        documents: ['Nomor Antrian Digital'],
        time: '1 menit'
      }
    ],
    keyPoints: [
      'Pendaftaran online dapat dilakukan 7 hari sebelum tanggal kunjungan',
      'Faskes memiliki kuota pendaftaran online yang terbatas',
      'Nomor antrian online dapat berbeda dengan antrian di tempat',
      'Tetap datang tepat waktu meskipun sudah mendaftar online'
    ],
    tips: [
      'Daftar online di pagi hari untuk mendapatkan slot terbaik',
      'Datang 15 menit lebih awal dari jadwal terdaftar',
      'Jika tidak bisa datang, batalkan pendaftaran agar slot bisa digunakan orang lain',
      'Simpan bukti pendaftaran online di ponsel untuk ditunjukkan ke petugas faskes'
    ],
    contactInfo: {
      phone: '1500-400 (BPJS Kesehatan)',
      website: 'jkn.bpjs-kesehatan.go.id',
      email: 'contact@bpjs-kesehatan.go.id'
    }
  },
}

export default function BPJSAssistantPage() {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Asisten BPJS Interaktif</h1>
        <p className="text-gray-600 mt-2">
          Panduan step-by-step untuk berbagai keperluan BPJS Anda
        </p>
      </div>

      {!selectedGuide && <BPJSFlowSelector onSelect={setSelectedGuide} />}

      {selectedGuide && selectedGuide in BPJS_GUIDES && (
        <BPJSGuideDisplay
          {...BPJS_GUIDES[selectedGuide as keyof typeof BPJS_GUIDES]}
          onBack={() => setSelectedGuide(null)}
        />
      )}
    </div>
  )
}
