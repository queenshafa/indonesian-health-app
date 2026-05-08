'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface HealthEdFormProps {
  onSuccess?: () => void
}

const CATEGORIES = ['sleep', 'nutrition', 'exercise', 'mental_health', 'first_aid', 'disease_prevention', 'hygiene', 'vaccination']
const DIFFICULTIES = ['easy', 'medium', 'hard']

export function HealthEducationForm({ onSuccess }: HealthEdFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'nutrition',
    difficulty_level: 'easy',
    image_url: '',
    author: 'Admin',
    target_age_min: 0,
    target_age_max: 100,
    is_published: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/health-education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create education content')

      alert('Konten edukasi berhasil ditambahkan!')
      setFormData({
        title: '',
        content: '',
        category: 'nutrition',
        difficulty_level: 'easy',
        image_url: '',
        author: 'Admin',
        target_age_min: 0,
        target_age_max: 100,
        is_published: true
      })
      onSuccess?.()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Edukasi Kesehatan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Judul"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded px-2 py-2 mt-1"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Tingkat Kesulitan</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full border rounded px-2 py-2 mt-1"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Umur Minimal"
              value={formData.target_age_min}
              onChange={(e) => setFormData({ ...formData, target_age_min: parseInt(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Umur Maksimal"
              value={formData.target_age_max}
              onChange={(e) => setFormData({ ...formData, target_age_max: parseInt(e.target.value) })}
            />
          </div>

          <Input
            placeholder="URL Gambar"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />

          <textarea
            placeholder="Konten Lengkap"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={5}
            className="w-full border rounded px-2 py-2"
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            />
            <label className="text-sm">Publikasikan</label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menyimpan...' : 'Tambah Edukasi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
