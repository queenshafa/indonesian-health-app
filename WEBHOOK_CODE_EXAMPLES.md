# Webhook Code Examples: Before & After

## Example 1: Symptom Analysis

### BEFORE (Synchronous)

```typescript
// app/api/symptoms/analyze/route.ts (OLD)
export async function POST(request: NextRequest) {
  const user = await getUser()
  const { symptoms } = await request.json()

  // ❌ This blocks for 2-30 seconds!
  const result = await model.generateContent(prompt)
  const analysis = parseResponse(result)

  // Save to DB
  await supabase.from('health_records').insert({ ... })

  // Return result (user had to wait the whole time)
  return NextResponse.json(analysis)
}
```

**Client Code (OLD):**
```typescript
// This call blocks/waits for the entire processing
const response = await fetch('/api/symptoms/analyze', {
  method: 'POST',
  body: JSON.stringify({ symptoms })
})

// ❌ User sees loading spinner for 2-30 seconds
const result = await response.json()
```

### AFTER (Asynchronous with Webhooks)

```typescript
// app/api/symptoms/analyze/route.ts (NEW)
import { sendJobToN8N } from '@/lib/n8n/send-job'

export async function POST(request: NextRequest) {
  const user = await getUser()
  const { symptoms } = await request.json()

  // ✅ Send to N8N, return immediately
  const { job_id } = await sendJobToN8N("/symptom-analysis", {
    patient_id: user.id,
    symptoms,
    duration: request.duration,
    severity: request.severity
  })

  // Return job_id (takes <100ms)
  return NextResponse.json(
    { job_id, status: "processing" },
    { status: 202 }
  )
}
```

**Webhook Receiver:**
```typescript
// app/api/webhooks/symptom-analysis/route.ts (NEW)
export async function POST(request: NextRequest) {
  const {
    job_id,
    patient_id,
    analysis_result,
    error_message
  } = await request.json()

  // N8N has already done the processing
  // Just save the results
  await supabase
    .from('health_records')
    .insert({
      patient_id,
      ai_suggestion: JSON.stringify(analysis_result),
      urgency_level: analysis_result.urgency_level
    })

  // Update job status
  await supabase
    .from('async_jobs')
    .update({ status: 'completed', result: analysis_result })
    .eq('job_id', job_id)

  return NextResponse.json({ success: true })
}
```

**Client Code (NEW):**
```typescript
// Step 1: Queue the job (returns immediately)
const response = await fetch('/api/symptoms/analyze', {
  method: 'POST',
  body: JSON.stringify({ symptoms })
})

const { job_id } = await response.json()

// Step 2: Poll for results (in a component)
const { job, isCompleted } = useAsyncJob(job_id, {
  autoStart: true // Starts polling automatically
})

if (isCompleted) {
  // Results are ready
  showResults(job.result)
}
```

---

## Example 2: Nearby Facilities

### BEFORE (Synchronous)

```typescript
// app/api/facilities/nearby/route.ts (OLD)
export async function POST(request: NextRequest) {
  const { lat, lng, radius } = await request.json()

  // ❌ Fetch all clinics
  const clinics = await supabase.from('clinics').select('*')

  // ❌ Calculate distance for EACH clinic (blocking)
  const facilities = clinics.map(clinic => ({
    ...clinic,
    distance_km: calculateDistance(lat, lng, clinic.lat, clinic.lng)
  }))

  // ❌ Filter and sort (more CPU)
  const filtered = facilities
    .filter(f => f.distance_km <= radius)
    .sort((a, b) => a.distance_km - b.distance_km)

  // ❌ Call N8N webhook synchronously
  const webhook = await fetch(N8N_URL, { body: filtered })

  // Return after ALL of this completes
  return NextResponse.json({
    success: true,
    facilities: filtered,
    webhook_response: await webhook.json()
  })
}
```

### AFTER (Asynchronous)

```typescript
// app/api/facilities/nearby/route.ts (NEW)
import { sendJobToN8N } from '@/lib/n8n/send-job'

export async function POST(request: NextRequest) {
  const { lat, lng, radius } = await request.json()

  // Validate input (minimal processing)
  if (!lat || !lng) {
    return NextResponse.json({ error: 'Coordinates required' }, { status: 400 })
  }

  // ✅ Queue job and return immediately
  const { job_id } = await sendJobToN8N("/facility-finder", {
    user_id: user.id,
    latitude: lat,
    longitude: lng,
    radius_km: radius,
    facility_type: "clinic"
  })

  // Return immediately (all heavy work is queued)
  return NextResponse.json(
    { job_id, status: "processing" },
    { status: 202 }
  )
}
```

**N8N Workflow Does:**
```
1. Receive job with coordinates
2. Query clinics database
3. Calculate distances
4. Filter by radius
5. Sort by distance
6. POST results to webhook
```

**Client Usage:**
```typescript
// Queue the search
const { job_id } = await queueFacilitySearch({ lat, lng, radius })

// Poll for results
const { job, isCompleted } = useAsyncJob(job_id)

if (isCompleted) {
  const { facilities } = job.result
  displayOnMap(facilities)
}
```

---

## Example 3: Queue/Appointment Creation

### BEFORE (Synchronous)

```typescript
// app/api/queues/route.ts (OLD - POST only)
export async function POST(request: NextRequest) {
  const user = await getUser()
  const {
    doctor_id,
    clinic_id,
    appointment_date,
    appointment_time
  } = await request.json()

  // ❌ Get max queue number (DB query)
  const maxQueue = await supabase
    .from('queues')
    .select('queue_number')
    .eq('doctor_id', doctor_id)
    .eq('appointment_date', appointment_date)
    .order('queue_number', { ascending: false })
    .limit(1)

  const queueNumber = (maxQueue?.[0]?.queue_number || 0) + 1

  // ❌ Insert appointment (DB write)
  const newQueue = await supabase
    .from('queues')
    .insert({
      patient_id: user.id,
      doctor_id,
      clinic_id,
      queue_number,
      estimated_wait_time_minutes: queueNumber * 30
    })
    .select()
    .single()

  // Return after DB insert completes
  return NextResponse.json(newQueue, { status: 201 })
}
```

### AFTER (Asynchronous)

```typescript
// app/api/queues/route.ts (NEW - POST)
import { sendJobToN8N } from '@/lib/n8n/send-job'

export async function POST(request: NextRequest) {
  const user = await getUser()
  const {
    doctor_id,
    clinic_id,
    appointment_date,
    appointment_time
  } = await request.json()

  // ✅ Send to N8N (N8N handles queue number calculation)
  const { job_id } = await sendJobToN8N("/queue-processing", {
    patient_id: user.id,
    doctor_id,
    clinic_id,
    appointment_date,
    appointment_time
  })

  // Return immediately
  return NextResponse.json(
    { job_id, status: "processing" },
    { status: 202 }
  )
}

// ✅ GET stays unchanged - it's a simple read
export async function GET(request: NextRequest) {
  const user = await getUser()

  const { data: queues } = await supabase
    .from('queues')
    .select('*')
    .eq('patient_id', user.id)
    .order('appointment_date', { ascending: true })

  return NextResponse.json(queues)
}
```

**Webhook Receiver:**
```typescript
// app/api/webhooks/queue-processing/route.ts (NEW)
export async function POST(request: NextRequest) {
  const {
    job_id,
    patient_id,
    queue_number,
    estimated_wait_time,
    error_message
  } = await request.json()

  if (error_message) {
    // N8N encountered error, mark job as failed
    await supabase
      .from('async_jobs')
      .update({ status: 'failed', error_message })
      .eq('job_id', job_id)

    return NextResponse.json({ success: true })
  }

  // Create queue entry with calculated queue_number
  const newQueue = await supabase
    .from('queues')
    .insert({
      patient_id,
      queue_number,
      estimated_wait_time_minutes: estimated_wait_time
    })
    .select()
    .single()

  // Update job with result
  await supabase
    .from('async_jobs')
    .update({ status: 'completed', result: newQueue })
    .eq('job_id', job_id)

  return NextResponse.json({ success: true })
}
```

**Client Code:**
```typescript
const { job_id } = await queueAppointment({
  doctor_id: '123',
  appointment_date: '2025-06-15'
})

// Poll for confirmation
const { job, isCompleted } = useAsyncJob(job_id, { autoStart: true })

if (isCompleted) {
  const { queue_number, estimated_wait_time } = job.result
  showConfirmation(`Queue #${queue_number}, wait ~${estimated_wait_time}min`)
}
```

---

## Comparison Table

| Aspect | Before (Sync) | After (Async) |
|--------|---|---|
| **Response Time** | 2-30 seconds | <100ms |
| **User Experience** | Long loading spinner | Quick response + polling UI |
| **Server Load** | Spikes during requests | Distributed via N8N |
| **Scaling** | Harder (blocked threads) | Easier (immediate response) |
| **Error Recovery** | Retry entire operation | Resume from job status |
| **Client Complexity** | Simple fetch | fetch + polling loop |
| **Server Complexity** | Heavy processing inline | Light validation only |

---

## Hook Usage Patterns

### Pattern 1: Auto-start Polling

```typescript
export function SymptomAnalysis() {
  const [jobId, setJobId] = useState('')

  const handleAnalyze = async () => {
    const res = await fetch('/api/symptoms/analyze', {
      method: 'POST',
      body: JSON.stringify({ symptoms: ['fever'] })
    })
    const { job_id } = await res.json()
    setJobId(job_id) // Starts polling automatically
  }

  // Hook with autoStart=true starts polling when jobId is set
  const { job, isCompleted, error } = useAsyncJob(jobId, {
    autoStart: true,
    pollInterval: 2000
  })

  return (
    <>
      <button onClick={handleAnalyze}>Analyze</button>
      {!isCompleted && <Spinner />}
      {isCompleted && <Results data={job?.result} />}
      {error && <Error message={error} />}
    </>
  )
}
```

### Pattern 2: Manual Control

```typescript
export function FacilityFinder() {
  const { job, fetchJobStatus, startPolling } = useAsyncJob(null, {
    autoStart: false // Manual control
  })

  const handleSearch = async () => {
    const res = await fetch('/api/facilities/nearby', { ... })
    const { job_id } = await res.json()

    // Manually start polling
    startPolling(job_id)
  }

  const handleRefresh = async () => {
    // Manually check status
    await fetchJobStatus(job.job_id)
  }

  return (
    <>
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleRefresh}>Refresh</button>
      {job?.result && <FacilityList facilities={job.result.facilities} />}
    </>
  )
}
```

### Pattern 3: Progress Indication

```typescript
export function QueueBooking() {
  const { job, isLoading } = useAsyncJob(jobId)

  const progressSteps = {
    pending: 'Queueing...',
    processing: 'Creating appointment...',
    completed: 'Booked!',
    failed: 'Error'
  }

  return (
    <Progress 
      status={job?.status} 
      label={progressSteps[job?.status]}
    />
  )
}
```

---

## N8N Workflow Example

```javascript
// N8N Webhook Trigger
// Receives: job_id, webhook_url, patient_id, symptoms, etc.

// Step 1: Call Gemini AI
const aiResponse = await fetch('https://gemini.api.com/generate', {
  body: JSON.stringify({
    prompt: `Analyze symptoms: ${$json.symptoms.join(', ')}`
  })
})

// Step 2: Parse response
const analysisResult = JSON.parse(aiResponse.text())

// Step 3: POST results back to webhook
await fetch($json.webhook_url, {
  method: 'POST',
  body: JSON.stringify({
    job_id: $json.job_id,
    patient_id: $json.patient_id,
    analysis_result: analysisResult,
    status: 'completed'
  })
})
```

---

## Database Schema

```sql
-- Before: No tracking of async jobs
-- Table: health_records, queues (direct inserts)

-- After: Track all async operations
CREATE TABLE async_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID UNIQUE,
  status TEXT, -- 'pending', 'processing', 'completed', 'failed'
  payload JSONB, -- Original request data
  result JSONB, -- Final result
  error_message TEXT,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- health_records and queues created by webhooks instead of routes
```
