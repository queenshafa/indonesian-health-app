'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DoctorForm } from '@/components/admin/forms/doctor-form'
import { DoctorsTable } from '@/components/admin/tables/doctors-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DoctorsManagement() {
  const [activeTab, setActiveTab] = useState('list')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Dokter</h1>
        <p className="text-gray-600 mt-1">Kelola data dokter dan jadwal praktik</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Daftar Dokter</TabsTrigger>
          <TabsTrigger value="add">Tambah Dokter</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <DoctorsTable key={refreshTrigger} />
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <DoctorForm
            clinicId="default-clinic"
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
