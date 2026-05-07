'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="text-5xl font-bold text-green-600 mb-2">✓</div>
          <CardTitle>Pendaftaran Berhasil!</CardTitle>
          <CardDescription>
            Silakan cek email Anda untuk verifikasi akun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                Kami telah mengirim email verifikasi ke alamat email Anda. Silakan klik link di email untuk mengaktifkan akun Anda.
              </p>
            </div>
            
            <div className="pt-4">
              <Link href="/auth/login">
                <Button className="w-full">Kembali ke Halaman Masuk</Button>
              </Link>
            </div>

            <p className="text-center text-xs text-gray-500">
              Tidak menerima email? Cek folder spam Anda
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
