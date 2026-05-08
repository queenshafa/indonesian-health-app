'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { HealthEducationForm } from '@/components/admin/forms/health-education-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CATEGORIES: Record<string, string> = {
  sleep: 'Tidur',
  nutrition: 'Nutrisi',
  exercise: 'Olahraga',
  mental_health: 'Kesehatan Mental',
  first_aid: 'Pertolongan Pertama',
  disease_prevention: 'Pencegahan Penyakit',
  hygiene: 'Kebersihan',
  vaccination: 'Vaksinasi',
}

export default function HealthEducationAdmin() {
  const [activeTab, setActiveTab] = useState('list')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [articles, setArticles] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0
  })

  // Fetch articles when component mounts or refreshes
  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/admin/health-education')
      const data = await response.json()
      setArticles(data.educations || [])
      setStats({
        total: (data.educations || []).length,
        published: (data.educations || []).filter((a: any) => a.is_published).length,
        draft: (data.educations || []).filter((a: any) => !a.is_published).length
      })
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    }
  }

  React.useEffect(() => {
    fetchArticles()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return

    try {
      const response = await fetch('/api/admin/health-education', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        alert('Artikel berhasil dihapus!')
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      alert('Gagal menghapus artikel')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Edukasi Kesehatan</h1>
        <p className="text-gray-600 mt-1">Kelola artikel dan konten edukasi kesehatan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Artikel</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.published}</div>
              <div className="text-sm text-gray-600 mt-1">Dipublikasikan</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.draft}</div>
              <div className="text-sm text-gray-600 mt-1">Draft</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Daftar Artikel</TabsTrigger>
          <TabsTrigger value="add">Artikel Baru</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Judul</th>
                    <th className="text-left p-3">Kategori</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Tanggal</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        Tidak ada artikel
                      </td>
                    </tr>
                  ) : (
                    articles.map(article => (
                      <tr key={article.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{article.title}</td>
                        <td className="p-3">{CATEGORIES[article.category] || article.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            article.is_published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {article.is_published ? 'Dipublikasi' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">
                          {new Date(article.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-3 space-x-2">
                          <button
                            onClick={() => window.open(`/dashboard/health-education/${article.id}`, '_blank')}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            Lihat
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <HealthEducationForm
            onSuccess={() => {
              setActiveTab('list')
              setRefreshTrigger(prev => prev + 1)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
