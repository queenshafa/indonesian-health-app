# Webhook-Based Async Processing Setup

This application now uses a webhook-based architecture for long-running operations. All heavy processing is delegated to N8N workflows, which then call back to your application via webhooks.

## Architecture Overview

### Flow

1. **Client** → POST to `/api/route` with data
2. **Route Handler** → Validates input, creates job record, sends to N8N
3. **Route Handler** → Returns immediately with `job_id` (HTTP 202)
4. **N8N** → Processes the workflow asynchronously
5. **N8N** → Calls webhook to `/api/webhooks/[handler]` with results
6. **Webhook Handler** → Saves results to database
7. **Client** → Polls `/api/jobs/[job_id]` to check status

## Routes Converted to Webhooks

### 1. POST /api/symptoms/analyze
**What it does:** Analyzes symptoms using Gemini AI

**Request:**
```json
{
  "symptoms": ["fever", "cough"],
  "duration": "3 days",
  "severity": "mild",
  "age": 25
}
```

**Response (HTTP 202):**
```json
{
  "message": "Symptom analysis queued",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

**Webhook Response:** `/api/webhooks/symptom-analysis`

**N8N Expected Payload:**
```json
{
  "job_id": "...",
  "patient_id": "...",
  "symptoms": [...],
  "duration": "...",
  "severity": "...",
  "analysis_result": { ... },
  "status": "completed",
  "error_message": null
}
```

---

### 2. POST /api/facilities/nearby
**What it does:** Finds nearby health facilities

**Request:**
```json
{
  "lat": -6.2088,
  "lng": 106.8456,
  "radius": 10,
  "facility_type": "clinic"
}
```

**Response (HTTP 202):**
```json
{
  "message": "Facility search queued",
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "processing"
}
```

**Webhook Response:** `/api/webhooks/facility-finder`

**N8N Expected Payload:**
```json
{
  "job_id": "...",
  "user_id": "...",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "radius_km": 10,
  "facility_type": "clinic",
  "facilities": [...],
  "status": "completed",
  "error_message": null
}
```

---

### 3. POST /api/queues
**What it does:** Creates a queue/appointment

**Request:**
```json
{
  "doctor_id": "...",
  "clinic_id": "...",
  "appointment_date": "2025-06-15",
  "appointment_time": "14:00",
  "reason_for_visit": "Check-up",
  "consultation_type": "general"
}
```

**Response (HTTP 202):**
```json
{
  "message": "Queue appointment queued",
  "job_id": "550e8400-e29b-41d4-a716-446655440002",
  "status": "processing"
}
```

**Webhook Response:** `/api/webhooks/queue-processing`

**N8N Expected Payload:**
```json
{
  "job_id": "...",
  "patient_id": "...",
  "doctor_id": "...",
  "clinic_id": "...",
  "appointment_date": "...",
  "appointment_time": "...",
  "queue_number": 5,
  "estimated_wait_time": 150,
  "status": "completed",
  "error_message": null
}
```

---

## Client-Side Implementation

### Check Job Status

```typescript
async function checkJobStatus(jobId: string) {
  const response = await fetch(`/api/jobs/${jobId}`);
  const job = await response.json();
  
  console.log(job.status); // 'pending', 'processing', 'completed', 'failed'
  console.log(job.result);
  console.log(job.error_message);
}
```

### Polling Pattern (Recommended)

```typescript
async function pollJobStatus(
  jobId: string,
  maxWaitTime = 60000,
  pollInterval = 2000
) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const response = await fetch(`/api/jobs/${jobId}`);
    const job = await response.json();
    
    if (job.status === 'completed') {
      return job.result;
    }
    
    if (job.status === 'failed') {
      throw new Error(job.error_message);
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error('Job polling timeout');
}
```

## Database Setup

Run this SQL to create the async_jobs table:

```sql
-- scripts/create-async-jobs-table.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy the contents of `scripts/create-async-jobs-table.sql`
3. Execute the query

## Environment Variables Required

```env
# N8N Configuration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-endpoint

# Optional: For generating full webhook URLs
NEXT_PUBLIC_API_URL=https://your-app.com
# or use VERCEL_URL (automatically set by Vercel)
```

## N8N Workflow Configuration

Each N8N workflow should:

1. **Accept job_id and webhook_url** as inputs
2. **Process the data** (e.g., call Gemini AI, calculate distances)
3. **Make POST request** to the webhook_url with results:

```javascript
// N8N HTTP Request node

{
  "job_id": $json.job_id,
  "patient_id": $json.patient_id, // or user_id
  "analysis_result": $json.result, // your processed data
  "status": "completed",
  "error_message": null
}
```

## Error Handling

### Job Not Found
```json
{ "status": 404, "error": "Job not found" }
```

### Invalid Job Status
If webhook receives invalid data, it updates the job with:
```json
{ 
  "status": "failed",
  "error_message": "..." 
}
```

## Monitoring & Debugging

### Check Job Status
```bash
curl https://your-app.com/api/jobs/550e8400-e29b-41d4-a716-446655440000
```

### Database Query
```sql
SELECT * FROM async_jobs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Notes

- Routes return **HTTP 202 (Accepted)** to indicate async processing
- Jobs are stored in `async_jobs` table for tracking
- Webhooks validate `job_id` to ensure data integrity
- Client must implement polling for job results
- Failed jobs store error messages for debugging
