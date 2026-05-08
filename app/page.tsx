'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-4">
            Kesehatan Digital Indonesia
          </div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Redirect logged-in users to dashboard
  if (user) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-blue-600">
            Kesehatan Digital
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Masuk</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
            Kesehatan Lebih Mudah, Lebih Dekat
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
            Platform kesehatan digital untuk seluruh Indonesia. Booking dokter,
            cek gejala, bantuan BPJS, dan edukasi kesehatan - semua dalam satu
            aplikasi
          </p>
          <div className="flex gap-4 justify-center flex-col md:flex-row">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full md:w-auto">
                Mulai Gratis Sekarang
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full md:w-auto"
              >
                Sudah Punya Akun
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-xl font-bold mb-3">Booking Antrian Real-Time</h3>
              <p className="text-gray-600 mb-4">
                Lihat jadwal dokter, pesan antrian, dan terima notifikasi kapan
                giliran Anda
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Status dokter real-time</li>
                <li>✓ Estimasi waktu tunggu</li>
                <li>✓ Notifikasi otomatis</li>
              </ul>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">💊</div>
              <h3 className="text-xl font-bold mb-3">Asisten BPJS Cerdas</h3>
              <p className="text-gray-600 mb-4">
                Panduan lengkap BPJS: cara rujukan, pindah faskes, dan daftar
                online
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Step-by-step guide</li>
                <li>✓ Dokumen yang dibutuhkan</li>
                <li>✓ Estimasi waktu & biaya</li>
              </ul>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-xl font-bold mb-3">Cek Gejala dengan AI</h3>
              <p className="text-gray-600 mb-4">
                Input gejala dan dapatkan saran tindakan awal yang aman
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Analisis kemungkinan kondisi</li>
                <li>✓ Tingkat urgensi</li>
                <li>✓ Rekomendasi tindakan</li>
              </ul>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="text-xl font-bold mb-3">Cari Fasilitas Terdekat</h3>
              <p className="text-gray-600 mb-4">
                1 tombol: temukan klinik, IGD, apotek, dan ambulans terdekat
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Maps interaktif</li>
                <li>✓ Jarak & waktu tempuh</li>
                <li>✓ Kontak & jam operasional</li>
              </ul>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-bold mb-3">Edukasi Kesehatan Harian</h3>
              <p className="text-gray-600 mb-4">
                Tips tidur, makan sehat, olahraga, dan kesehatan mental
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Konten singkat & mudah</li>
                <li>✓ Notifikasi setiap pagi</li>
                <li>✓ Untuk semua usia</li>
              </ul>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-bold mb-3">Kelola Keluarga</h3>
              <p className="text-gray-600 mb-4">
                Satu akun untuk kelola data kesehatan seluruh keluarga
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ BPJS keluarga</li>
                <li>✓ Riwayat kesehatan</li>
                <li>✓ Jadwal obat orang tua</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-blue-50 rounded-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-6">Kenapa Pilih Kami?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2">🇮🇩 Dibuat untuk Indonesia</h3>
              <p className="text-gray-700">
                Dirancang khusus untuk kebutuhan dan budaya kesehatan Indonesia,
                dari kota besar hingga desa terpencil
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">📱 Ringan & Cepat</h3>
              <p className="text-gray-700">
                Aplikasi mobile-friendly yang ringan, pas untuk daerah dengan
                koneksi internet terbatas
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">❤️ Fokus Empati</h3>
              <p className="text-gray-700">
                Dokter yang ramah, mendengarkan, dan tidak menghakimi adalah
                prioritas kami
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">🔒 Data Aman</h3>
              <p className="text-gray-700">
                Enkripsi tingkat enterprise untuk melindungi privasi kesehatan
                Anda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Siap Mengubah Cara Anda Menjaga Kesehatan?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Daftar sekarang dan dapatkan akses penuh ke semua fitur kesehatan digital
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Daftar Gratis Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="mb-4">© 2024 Kesehatan Digital Indonesia. Semua hak dilindungi.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white">Syarat Layanan</a>
            <a href="#" className="hover:text-white">Hubungi Kami</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
