# Webhook Migration Implementation Guide

This guide explains how all routes have been converted to use webhook-based async processing.

## What Changed

### Routes Converted to Async/Webhook Pattern

| Route | Old Behavior | New Behavior |
|-------|-------------|--------------|
| `POST /api/symptoms/analyze` | Synchronous (inline AI processing) | Queue job, return immediately with job_id |
| `POST /api/facilities/nearby` | Synchronous (inline distance calculation) | Queue job, return immediately with job_id |
| `POST /api/queues` | Synchronous (direct DB insert) | Queue job, return immediately with job_id |
| `GET /api/doctors` | Unchanged (simple read-only query) | - |
| `GET /api/queues` | Unchanged (simple read-only query) | - |
| `GET /auth/callback` | Unchanged (OAuth flow) | - |

## Database Changes Required

### 1. Create async_jobs Table

Run the SQL migration:

```bash
# Option A: Via Supabase Dashboard
1. Go to SQL Editor
2. Copy contents of scripts/create-async-jobs-table.sql
3. Execute

# Option B: Via Supabase CLI
supabase db push
```

**Table Structure:**
```sql
CREATE TABLE async_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL UNIQUE,
  webhook_url TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

Add to your `.env.local` or Vercel project settings:

```env
# N8N Webhook URL - where to send jobs
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/job-processor

# Optional: Your app's base URL (auto-detected from VERCEL_URL if not set)
NEXT_PUBLIC_API_URL=https://your-app.com
```

## New Endpoints

### 1. Job Status Checker
```
GET /api/jobs/[job_id]
```

**Response (HTTP 200):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "result": null,
  "error_message": null,
  "created_at": "2025-05-08T10:30:00Z",
  "completed_at": null
}
```

### 2. Webhook Receivers
- `POST /api/webhooks/symptom-analysis` - Symptom analysis results
- `POST /api/webhooks/facility-finder` - Facility search results  
- `POST /api/webhooks/queue-processing` - Appointment queue results

## Client-Side Implementation

### Using the Hook (Recommended)

```typescript
'use client'

import { useState } from 'react'
import { useAsyncJob } from '@/lib/hooks/useAsyncJob'

export function SymptomAnalyzer() {
  const [jobId, setJobId] = useState<string | null>(null)
  const { job, isLoading, error, isCompleted } = useAsyncJob(jobId, {
    pollInterval: 2000,
    autoStart: !!jobId,
  })

  const analyzeSymptoms = async () => {
    try {
      const response = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: ['fever', 'cough'],
          severity: 'mild',
        }),
      })

      if (!response.ok) throw new Error('Failed to start analysis')

      const data = await response.json()
      setJobId(data.job_id) // Auto-starts polling
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div>
      <button onClick={analyzeSymptoms}>Analyze Symptoms</button>

      {isLoading && <p>Processing...</p>}
      {isCompleted && <p>Done! Result: {JSON.stringify(job?.result)}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

### Manual Polling

```typescript
async function pollJobStatus(jobId: string) {
  const pollInterval = 2000 // 2 seconds
  const maxWaitTime = 60000 // 1 minute

  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitTime) {
    const response = await fetch(`/api/jobs/${jobId}`)
    const job = await response.json()

    console.log('Job status:', job.status)

    if (job.status === 'completed') {
      return job.result
    }

    if (job.status === 'failed') {
      throw new Error(job.error_message)
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  throw new Error('Polling timeout')
}
```

## N8N Workflow Setup

Each N8N workflow should follow this pattern:

### Trigger
- **Type:** Webhook
- **Method:** POST
- **Path:** `/job-processor` (or your configured path)

### Workflow Logic
```
1. Receive webhook payload containing:
   - job_id (unique identifier)
   - webhook_url (where to send results)
   - payload (your input data)

2. Process the data:
   - Call AI APIs (Gemini)
   - Calculate distances
   - Query databases
   - Etc.

3. Prepare result object

4. Make HTTP POST request to webhook_url
```

### Sample N8N Webhook Response Node

**Node Type:** HTTP Request

**Method:** POST

**URL:** `{{ $json.webhook_url }}`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "job_id": "{{ $json.job_id }}",
  "patient_id": "{{ $json.patient_id }}",
  "status": "completed",
  "analysis_result": "{{ $json.ai_result }}",
  "error_message": null
}
```

## Error Handling

### What Happens When N8N Fails

1. N8N webhook returns error
2. `sendJobToN8N()` catches error
3. Job status updated to `failed` with error message
4. Client receives error on next poll

### Job Status Values

- `pending` - Job queued, not yet started
- `processing` - N8N workflow is running (implicit via missing completed_at)
- `completed` - Successfully finished
- `failed` - Error occurred, check error_message

## Migration Checklist

- [ ] Create async_jobs table in Supabase
- [ ] Set N8N_WEBHOOK_URL environment variable
- [ ] Test endpoint: `POST /api/symptoms/analyze`
- [ ] Test endpoint: `POST /api/facilities/nearby`
- [ ] Test endpoint: `POST /api/queues`
- [ ] Test job status: `GET /api/jobs/[job_id]`
- [ ] Configure N8N workflow(s)
- [ ] Test webhook receivers: `/api/webhooks/*`
- [ ] Update client code to use polling
- [ ] Monitor job completion times

## Troubleshooting

### Jobs stuck in "pending"

**Cause:** N8N not configured or webhook URL incorrect

**Solution:**
1. Check `N8N_WEBHOOK_URL` env var
2. Verify N8N webhook endpoint is running
3. Check N8N logs for errors

### Webhook not reaching N8N

**Cause:** Firewall/DNS issues or invalid webhook URL

**Solution:**
1. Test N8N webhook directly: `curl -X POST https://your-n8n.com/webhook/... -H "Content-Type: application/json" -d '{...}'`
2. Check N8N execution history
3. Verify webhook URL is reachable

### Results not saving to database

**Cause:** Webhook receiver failing or job_id mismatch

**Solution:**
1. Check webhook handler logs
2. Verify job_id in N8N response matches original job_id
3. Check async_jobs table for the job record
4. Check Supabase RLS policies

## Performance Considerations

### Polling Intervals

- **Fast response needed:** 500ms - 1000ms
- **Normal operations:** 2000ms - 5000ms
- **Long-running jobs:** 10000ms+

### Timeout Values

- **Symptom analysis:** 60-120 seconds
- **Facility finder:** 30-60 seconds
- **Queue creation:** 10-30 seconds

Adjust based on your N8N workflow complexity.

## Security Notes

1. **Job ID Validation** - webhook handlers validate job_id exists
2. **User Association** - results linked to patient_id/user_id from original request
3. **RLS Policies** - users can only see their own jobs
4. **Webhook Authentication** - Consider adding API key verification to webhooks if exposed to internet
