'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface HealthEducation {
  id: string
  title: string
  content: string
  category: string
  difficulty_level: string
  duration_minutes: number
  image_url?: string
  source?: string
  author?: string
  likes_count: number
  shares_count: number
  created_at: string
  updated_at: string
  target_age_min?: number
  target_age_max?: number
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  sleep: { label: 'Tidur', icon: '😴', color: 'bg-blue-100 text-blue-800' },
  nutrition: { label: 'Nutrisi', icon: '🥗', color: 'bg-green-100 text-green-800' },
  exercise: { label: 'Olahraga', icon: '🏃', color: 'bg-yellow-100 text-yellow-800' },
  mental_health: { label: 'Kesehatan Mental', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  first_aid: { label: 'Pertolongan Pertama', icon: '🚑', color: 'bg-red-100 text-red-800' },
  disease_prevention: { label: 'Pencegahan Penyakit', icon: '🛡️', color: 'bg-indigo-100 text-indigo-800' },
  hygiene: { label: 'Kebersihan', icon: '🧼', color: 'bg-cyan-100 text-cyan-800' },
  vaccination: { label: 'Vaksinasi', icon: '💉', color: 'bg-pink-100 text-pink-800' },
}

const DIFFICULTY_LABELS = {
  easy: { label: 'Mudah', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Sedang', color: 'bg-yellow-100 text-yellow-800' },
  hard: { label: 'Sulit', color: 'bg-red-100 text-red-800' },
}

export default function HealthEducationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<HealthEducation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)

  const id = params.id as string

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/health-education?id=${id}`)
        
        if (!response.ok) {
          throw new Error('Gagal memuat artikel')
        }

        const data = await response.json()
        if (Array.isArray(data)) {
          setArticle(data[0])
        } else {
          setArticle(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchArticle()
  }, [id])

  const handleLike = async () => {
    if (!article) return
    try {
      await fetch(`/api/health-education/${article.id}/like`, { method: 'POST' })
      setLiked(true)
      setArticle(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null)
    } catch (err) {
      console.error('Failed to like:', err)
    }
  }

  const handleShare = async () => {
    if (!article) return
    
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.content.substring(0, 100),
          url: window.location.href,
        })
        setShared(true)
        await fetch(`/api/health-education/${article.id}/share`, { method: 'POST' })
        setArticle(prev => prev ? { ...prev, shares_count: prev.shares_count + 1 } : null)
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShared(true)
        alert('Link telah disalin ke clipboard!')
      } catch (err) {
        console.error('Copy failed:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Memuat artikel...</p>
        </Card>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Artikel tidak ditemukan'}</p>
          <Button onClick={() => router.back()} variant="outline">
            Kembali
          </Button>
        </Card>
      </div>
    )
  }

  const categoryInfo = CATEGORY_LABELS[article.category as keyof typeof CATEGORY_LABELS]
  const difficultyInfo = DIFFICULTY_LABELS[article.difficulty_level as keyof typeof DIFFICULTY_LABELS]

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Kembali
        </Button>
        
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        
        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categoryInfo && (
            <Badge className={categoryInfo.color}>
              {categoryInfo.icon} {categoryInfo.label}
            </Badge>
          )}
          {difficultyInfo && (
            <Badge className={difficultyInfo.color}>
              {difficultyInfo.label}
            </Badge>
          )}
          {article.duration_minutes && (
            <Badge variant="outline">
              ⏱️ {article.duration_minutes} menit
            </Badge>
          )}
          {article.target_age_min && article.target_age_max && (
            <Badge variant="outline">
              👥 Usia {article.target_age_min}-{article.target_age_max}
            </Badge>
          )}
        </div>

        {/* Author & Date */}
        <div className="text-gray-600 text-sm mb-6">
          {article.author && <span>Penulis: {article.author}</span>}
          {article.source && <span> • Sumber: {article.source}</span>}
          <span> • {new Date(article.created_at).toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      {/* Image */}
      {article.image_url && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <Card className="p-8 mb-8">
        <div className="prose prose-sm max-w-none">
          {article.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && (
              <p key={i} className="mb-4 leading-relaxed text-gray-700">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={handleLike}
            variant={liked ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            👍 Suka ({article.likes_count})
          </Button>
          <Button 
            onClick={handleShare}
            variant={shared ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            🔗 Bagikan ({article.shares_count})
          </Button>
        </div>
      </Card>

      {/* Related Articles */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Baca Juga</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/health-education">
            <Button variant="outline" className="w-full justify-start">
              📚 Kembali ke Daftar Artikel
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              🏠 Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
