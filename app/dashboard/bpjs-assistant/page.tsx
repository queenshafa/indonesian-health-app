'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  informasi: {
    title: 'Informasi BPJS Umum',
    description: 'Informasi dasar dan tips menggunakan BPJS dengan efektif',
    steps: [
      {
        number: 1,
        title: 'Apa Itu BPJS Kesehatan?',
        description: 'BPJS Kesehatan adalah badan penyelenggara asuransi kesehatan milik pemerintah Indonesia. Program ini dirancang untuk memberikan perlindungan kesehatan kepada seluruh masyarakat Indonesia dengan cara yang terjangkau.',
        documents: [],
      },
      {
        number: 2,
        title: 'Siapa yang Berhak Menjadi Peserta?',
        description: 'Semua penduduk Indonesia dapat menjadi peserta BPJS Kesehatan, baik yang bekerja maupun tidak bekerja. Peserta dapat mendaftar secara individual atau melalui pemberi kerja.',
        documents: ['KTP/Paspor', 'Kartu Keluarga (untuk pendaftar keluarga)'],
      },
      {
        number: 3,
        title: 'Berapa Iuran BPJS Setiap Bulan?',
        description: 'Iuran BPJS tergantung dari kelas yang dipilih. Kelas I: Rp 150.000/bulan, Kelas II: Rp 100.000/bulan, Kelas III: Rp 35.000/bulan. Peserta tidak bekerja dapat membayar iuran lebih ringan.',
        documents: [],
      },
      {
        number: 4,
        title: 'Apa Saja Manfaat BPJS Kesehatan?',
        description: 'BPJS Kesehatan mencakup pemeriksaan kesehatan dasar di fasilitas kesehatan tingkat 1, rujukan ke rumah sakit, persalinan, pemeriksaan ibu hamil, imunisasi anak, dan berbagai layanan kesehatan lainnya dengan biaya terjangkau.',
        documents: [],
      },
      {
        number: 5,
        title: 'Bagaimana Jika Belum Punya Kartu BPJS?',
        description: 'Anda bisa mendaftar melalui website www.bpjs-kesehatan.go.id, aplikasi JKN Care, atau langsung datang ke kantor BPJS terdekat. Proses pendaftaran mudah dan cepat dengan menggunakan NIK saja.',
        documents: ['NIK', 'Nomor Telepon'],
      }
    ],
    keyPoints: [
      'BPJS Kesehatan adalah hak setiap warga negara Indonesia',
      'Iuran BPJS lebih terjangkau dibandingkan asuransi kesehatan swasta',
      'Layanan BPJS dapat digunakan di seluruh fasilitas kesehatan yang bekerja sama',
      'BPJS mencakup pemeriksaan kesehatan preventif dan kuratif'
    ],
    tips: [
      'Selalu bawa kartu BPJS saat berobat untuk menghindari antrian pembayaran',
      'Cek fasilitas kesehatan mana saja yang bekerja sama dengan BPJS di aplikasi JKN Care',
      'Jangan lupa untuk membayar iuran BPJS agar tetap aktif',
      'Jika ada keluhan dengan pelayanan BPJS, hubungi customer service mereka'
    ],
    contactInfo: {
      phone: '1500-400 (BPJS Kesehatan)',
      website: 'www.bpjs-kesehatan.go.id',
      email: 'contact@bpjs-kesehatan.go.id'
    }
  },
  dokumen: {
    title: 'Dokumen yang Dibutuhkan untuk Transaksi BPJS',
    description: 'Checklist lengkap dokumen yang diperlukan untuk berbagai keperluan BPJS',
    steps: [
      {
        number: 1,
        title: 'Untuk Pendaftaran BPJS Baru',
        description: 'Siapkan dokumen identitas dan data pribadi untuk mendaftar sebagai peserta BPJS Kesehatan.',
        documents: ['KTP asli (fotokopi juga diperlukan)', 'Kartu Keluarga asli (jika mendaftar keluarga)', 'Paspor (jika tidak punya KTP)', 'Nomor Telepon yang aktif', 'Email (opsional)'],
      },
      {
        number: 2,
        title: 'Untuk Pemeriksaan Kesehatan Rutin',
        description: 'Dokumen yang perlu dibawa saat mengunjungi fasilitas kesehatan BPJS untuk pemeriksaan rutin.',
        documents: ['Kartu BPJS asli', 'Kartu Identitas (KTP/SIM/Paspor)', 'Kartu Keluarga (jika ada tanggungan)', 'Asuransi Kesehatan lain (jika ada)', 'Resep obat lama (jika ada riwayat perawatan)'],
      },
      {
        number: 3,
        title: 'Untuk Mengajukan Rujukan ke Spesialis',
        description: 'Dokumen wajib dibawa saat meminta rujukan dari dokter tingkat 1 ke dokter spesialis.',
        documents: ['Kartu BPJS asli', 'Kartu Identitas', 'Hasil pemeriksaan dari dokter tingkat 1', 'Catatan medis sebelumnya (jika ada)', 'Resep obat (jika ada)'],
      },
      {
        number: 4,
        title: 'Untuk Perawatan Ibu Hamil',
        description: 'Dokumen khusus yang diperlukan untuk pemeriksaan kesehatan ibu hamil dan persalinan.',
        documents: ['Kartu BPJS asli', 'Kartu Identitas', 'Buku KIA (Kesehatan Ibu dan Anak)', 'Foto USG (jika sudah ada)', 'Riwayat kehamilan sebelumnya (jika ada)', 'Vaksin yang sudah diterima'],
      },
      {
        number: 5,
        title: 'Untuk Klaim atau Santunan BPJS',
        description: 'Dokumen yang diperlukan jika ingin mengajukan klaim atau santunan dari BPJS.',
        documents: ['Bukti pembayaran iuran BPJS yang aktif', 'Kartu BPJS asli', 'Kartu Identitas', 'Surat permohonan klaim', 'Bukti pembayaran pelayanan kesehatan (invoice/kwitansi)', 'Laporan medis dari fasilitas kesehatan', 'Resep obat dan bukti pembelian obat'],
      },
      {
        number: 6,
        title: 'Untuk Perubahan Data atau Pindah Faskes',
        description: 'Dokumen yang diperlukan saat ingin mengubah data pribadi atau pindah ke fasilitas kesehatan lain.',
        documents: ['Kartu BPJS asli', 'Kartu Identitas terbaru', 'Fotokopi KTP (2 lembar)', 'Surat perubahan data dari Desa/Kelurahan (jika pindah alamat)', 'Email aktif (untuk verifikasi online)'],
      }
    ],
    keyPoints: [
      'Selalu bawa kartu BPJS asli saat berobat, fotokopi tidak berlaku di fasilitas kesehatan',
      'Dokumen harus masih berlaku dan tidak kadaluarsa',
      'Jika kartu BPJS hilang, segera lapor ke kantor BPJS untuk membuat kartu pengganti',
      'Simpan fotokopi dokumen penting di rumah untuk keperluan mendesak'
    ],
    tips: [
      'Fotokopi dokumen penting dan simpan di beberapa tempat yang aman',
      'Catat nomor peserta BPJS di ponsel untuk keperluan mendesak',
      'Jika melupakan kartu BPJS, Anda masih bisa berobat dengan menunjukkan KTP dan nomor peserta',
      'Selalu update data pribadi Anda di aplikasi JKN Care agar terhindar dari masalah administratif'
    ],
    contactInfo: {
      phone: '1500-400 (BPJS Kesehatan)',
      website: 'www.bpjs-kesehatan.go.id',
      email: 'contact@bpjs-kesehatan.go.id'
    }
  },
  klaim: {
    title: 'Proses Klaim BPJS Kesehatan',
    description: 'Panduan lengkap untuk mengajukan dan menyelesaikan klaim BPJS dengan lancar',
    steps: [
      {
        number: 1,
        title: 'Berobat dan Simpan Bukti Pembayaran',
        description: 'Ketika berobat di fasilitas kesehatan yang tergabung dalam BPJS, mintalah bukti pembayaran/invoice dari fasilitas kesehatan tersebut. Simpan semua bukti dengan baik.',
        documents: ['Kartu BPJS', 'Invoice/Kwitansi pembayaran', 'Resep obat dan bukti pembelian obat', 'Laporan medis'],
      },
      {
        number: 2,
        title: 'Kumpulkan Dokumen Klaim yang Diperlukan',
        description: 'Siapkan semua dokumen yang diperlukan untuk mengajukan klaim, termasuk bukti pembayaran, resep, dan laporan medis.',
        documents: ['Fotokopi kartu BPJS', 'Fotokopi kartu identitas', 'Bukti pembayaran iuran BPJS (3 bulan terakhir)', 'Invoice/Kwitansi dari fasilitas kesehatan', 'Resep dokter dan struk pembelian obat', 'Laporan medis/hasil pemeriksaan', 'Formulir permohonan klaim BPJS'],
      },
      {
        number: 3,
        title: 'Ajukan Klaim ke BPJS',
        description: 'Datang ke kantor BPJS terdekat dengan membawa semua dokumen yang sudah disiapkan. Anda juga bisa mengajukan klaim melalui aplikasi JKN Care untuk beberapa jenis klaim.',
        documents: ['Semua dokumen yang sudah disiapkan'],
        time: '2-3 jam'
      },
      {
        number: 4,
        title: 'BPJS Melakukan Verifikasi',
        description: 'Petugas BPJS akan memverifikasi semua dokumen dan data Anda. Proses verifikasi biasanya memakan waktu 3-7 hari kerja.',
        documents: [],
        time: '3-7 hari kerja'
      },
      {
        number: 5,
        title: 'Tunggu Proses Administratif',
        description: 'Jika dokumen lengkap dan valid, BPJS akan memproses klaim Anda. Untuk klaim medis besar, mungkin ada pemeriksaan lebih lanjut dari tim medis BPJS.',
        documents: [],
        time: '5-14 hari kerja'
      },
      {
        number: 6,
        title: 'Terima Persetujuan atau Penolakan',
        description: 'BPJS akan mengirimkan surat keputusan tentang klaim Anda. Jika disetujui, Anda akan menerima penggantian biaya sesuai dengan ketentuan BPJS.',
        documents: ['Surat keputusan klaim dari BPJS'],
        time: '2-3 minggu'
      }
    ],
    keyPoints: [
      'Klaim hanya bisa diajukan jika Anda adalah peserta BPJS aktif (iuran terbayar)',
      'Klaim harus diajukan paling lambat 1 tahun setelah tanggal perawatan kesehatan',
      'Fasilitas kesehatan tempat berobat harus terdaftar dan bekerja sama dengan BPJS',
      'BPJS hanya menanggung layanan kesehatan yang termasuk dalam paket benefit BPJS'
    ],
    tips: [
      'Ambil nomor referensi saat mengajukan klaim untuk tracking progress',
      'Fotokopi semua dokumen sebelum diserahkan ke BPJS',
      'Tanyakan berapa lama waktu proses klaim kepada petugas BPJS',
      'Jika klaim ditolak, Anda bisa mengajukan banding ke kantor BPJS dalam 30 hari',
      'Simpan bukti pengajuan klaim di rumah untuk arsip pribadi Anda'
    ],
    contactInfo: {
      phone: '1500-400 (BPJS Kesehatan)',
      website: 'www.bpjs-kesehatan.go.id',
      email: 'contact@bpjs-kesehatan.go.id'
    }
  },
}

export default function BPJSAssistantPage() {
  const router = useRouter()
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold">Asisten BPJS Interaktif</h1>
            <p className="text-gray-600 mt-2">
              Panduan step-by-step untuk berbagai keperluan BPJS Anda
            </p>
          </div>
        </div>

        {!selectedGuide && <BPJSFlowSelector onSelect={setSelectedGuide} />}

        {selectedGuide && selectedGuide in BPJS_GUIDES && (
          <BPJSGuideDisplay
            {...BPJS_GUIDES[selectedGuide as keyof typeof BPJS_GUIDES]}
            onBack={() => setSelectedGuide(null)}
          />
        )}
      </div>
    </div>
  )
}
