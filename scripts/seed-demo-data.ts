import { createServerClient } from '@/lib/supabase/server'

// Demo data for testing
const DEMO_CLINICS = [
  {
    name: 'Klinik Kesehatan Jakarta Pusat',
    clinic_type: 'clinic',
    address: 'Jl. Merdeka No. 45, Jakarta Pusat',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postal_code: '10110',
    phone: '021-1234567',
    email: 'info@klinikjakarta.com',
    is_bpjs_partner: true,
    specialties: ['umum', 'kulit', 'gigi'],
    emergency_available: false,
    ambulance_available: false,
    operating_hours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '14:00' },
      sunday: { open: '10:00', close: '14:00' },
    },
  },
  {
    name: 'Rumah Sakit Besar Jakarta',
    clinic_type: 'hospital',
    address: 'Jl. Gatot Subroto No. 123, Jakarta',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postal_code: '12920',
    phone: '021-9876543',
    email: 'admisi@rsjbesar.com',
    is_bpjs_partner: true,
    specialties: ['umum', 'jantung', 'syaraf', 'orthopedi', 'mata', 'anak'],
    emergency_available: true,
    ambulance_available: true,
    operating_hours: {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' },
    },
  },
  {
    name: 'Apotek Sehat 24 Jam',
    clinic_type: 'pharmacy',
    address: 'Jl. Sudirman Blok A No. 10, Jakarta',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postal_code: '10210',
    phone: '021-5555555',
    email: 'apotek@sehat24.com',
    is_bpjs_partner: false,
    specialties: [],
    emergency_available: false,
    ambulance_available: false,
    operating_hours: {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' },
    },
  },
]

const DEMO_DOCTORS = [
  {
    full_name: 'Dr. Budi Santoso',
    specialization: 'umum',
    license_number: 'SIP-2024-001',
    phone: '0812-3456789',
    email: 'dr.budi@klinik.com',
    bio: 'Dokter umum berpengalaman 10 tahun, ramah dan sabar',
    years_experience: 10,
    consultation_fee: 150000,
    availability_status: 'available',
  },
  {
    full_name: 'Dr. Siti Nurhaliza',
    specialization: 'kulit',
    license_number: 'SIP-2024-002',
    phone: '0813-9876543',
    email: 'dr.siti@klinik.com',
    bio: 'Spesialis kulit dengan sertifikasi internasional',
    years_experience: 8,
    consultation_fee: 250000,
    availability_status: 'busy',
  },
  {
    full_name: 'Dr. Ahmad Wijaya',
    specialization: 'gigi',
    license_number: 'SIP-2024-003',
    phone: '0814-5555555',
    email: 'dr.ahmad@klinik.com',
    bio: 'Dokter gigi profesional, tidak buru-buru',
    years_experience: 15,
    consultation_fee: 200000,
    availability_status: 'on_break',
  },
]

const DEMO_SCHEDULES = [
  {
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '12:00',
    consultation_slot_duration_minutes: 30,
    max_patients_per_session: 6,
    break_time_start: '12:00',
    break_time_end: '13:00',
    is_active: true,
  },
  {
    day_of_week: 'tuesday',
    start_time: '14:00',
    end_time: '17:00',
    consultation_slot_duration_minutes: 30,
    max_patients_per_session: 6,
    is_active: true,
  },
  {
    day_of_week: 'wednesday',
    start_time: '09:00',
    end_time: '12:00',
    consultation_slot_duration_minutes: 30,
    max_patients_per_session: 6,
    break_time_start: '12:00',
    break_time_end: '13:00',
    is_active: true,
  },
]

const DEMO_HEALTH_EDUCATIONS = [
  {
    title: 'Tidur Berkualitas untuk Kesehatan Optimal',
    content: `Tidur 7-8 jam setiap malam membantu tubuh pulih dan menjaga kesehatan.
    
Tips tidur berkualitas:
- Tidur pada jam yang sama setiap hari (bahkan di akhir pekan)
- Hindari gadget 30 menit sebelum tidur
- Pastikan kamar gelap, sejuk, dan sunyi
- Hindari kafein setelah jam 3 sore
- Olahraga teratur tapi bukan dekat waktu tidur`,
    category: 'sleep',
    difficulty_level: 'easy',
    duration_minutes: 3,
    author: 'Departemen Kesehatan Indonesia',
    source: 'WHO Sleep Guidelines',
  },
  {
    title: 'Makan Sehat untuk Hidup Sehat',
    content: `Pola makan sehat adalah kunci kesehatan jangka panjang.

Aturan piring sehat:
- 1/2 piring: sayur dan buah
- 1/4 piring: protein (daging, ikan, tahu, telur)
- 1/4 piring: karbohidrat (nasi, roti, pasta)
- Minum air putih minimal 8 gelas per hari

Tips praktis:
- Sarapan pagi yang bergizi
- Makan buah sebagai cemilan
- Kurangi garam dan gula`,
    category: 'nutrition',
    difficulty_level: 'easy',
    duration_minutes: 4,
    author: 'Departemen Kesehatan Indonesia',
    source: 'Panduan Gizi Indonesia',
  },
  {
    title: 'Pentingnya Olahraga untuk Kesehatan Mental',
    content: `Olahraga tidak hanya baik untuk tubuh tapi juga pikiran.

Manfaat olahraga:
- Mengurangi stres dan kecemasan
- Meningkatkan kepercayaan diri
- Membantu tidur lebih nyenyak
- Meningkatkan energi sepanjang hari

Rekomendasi:
- Olahraga minimal 30 menit, 5 hari seminggu
- Bisa dimulai dengan berjalan kaki
- Pilih olahraga yang Anda sukai`,
    category: 'exercise',
    difficulty_level: 'easy',
    duration_minutes: 4,
    author: 'Departemen Kesehatan Indonesia',
    source: 'WHO Physical Activity Guidelines',
  },
]

async function seedDemoData() {
  const supabase = await createServerClient()

  console.log('🌱 Mulai seeding demo data...')

  // Seed clinics
  console.log('📍 Seeding clinics...')
  const { data: clinicsData, error: clinicsError } = await supabase
    .from('clinics')
    .insert(DEMO_CLINICS)
    .select()

  if (clinicsError) {
    console.error('❌ Error seeding clinics:', clinicsError)
    return
  }

  console.log(`✅ ${clinicsData?.length} clinics created`)

  // Seed doctors
  if (clinicsData && clinicsData.length > 0) {
    console.log('👨‍⚕️ Seeding doctors...')

    const doctorsWithClinic = DEMO_DOCTORS.map((doctor, index) => ({
      ...doctor,
      clinic_id: clinicsData[index % clinicsData.length].id,
    }))

    const { data: doctorsData, error: doctorsError } = await supabase
      .from('doctors')
      .insert(doctorsWithClinic)
      .select()

    if (doctorsError) {
      console.error('❌ Error seeding doctors:', doctorsError)
      return
    }

    console.log(`✅ ${doctorsData?.length} doctors created`)

    // Seed schedules
    if (doctorsData && doctorsData.length > 0) {
      console.log('📅 Seeding schedules...')

      const schedulesWithDoctors = DEMO_SCHEDULES.flatMap((schedule) =>
        doctorsData.map((doctor) => ({
          ...schedule,
          doctor_id: doctor.id,
        }))
      )

      const { data: schedulesData, error: schedulesError } = await supabase
        .from('doctor_schedules')
        .insert(schedulesWithDoctors)
        .select()

      if (schedulesError) {
        console.error('❌ Error seeding schedules:', schedulesError)
        return
      }

      console.log(`✅ ${schedulesData?.length} schedules created`)
    }
  }

  // Seed health education
  console.log('📚 Seeding health education...')
  const { data: educationData, error: educationError } = await supabase
    .from('health_educations')
    .insert(
      DEMO_HEALTH_EDUCATIONS.map((ed) => ({
        ...ed,
        is_published: true,
        scheduled_at: new Date().toISOString(),
      }))
    )
    .select()

  if (educationError) {
    console.error('❌ Error seeding health education:', educationError)
    return
  }

  console.log(`✅ ${educationData?.length} health education posts created`)

  console.log('✨ Demo data seeding complete!')
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seedDemoData
