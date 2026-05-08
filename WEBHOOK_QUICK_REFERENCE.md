# Webhook Quick Reference

## One-Minute Summary

All routes now use **async webhook processing**:
1. Client POST → Route validates & queues job → Returns job_id (HTTP 202)
2. N8N processes → Calls webhook with results
3. Client polls `/api/jobs/[job_id]` → Gets results

## Routes Affected

```
POST /api/symptoms/analyze     → Returns { job_id, status: "processing" }
POST /api/facilities/nearby    → Returns { job_id, status: "processing" }
POST /api/queues              → Returns { job_id, status: "processing" }
GET  /api/jobs/[job_id]       → Returns { job_id, status, result }
```

## Client-Side Polling

### Simple Version
```typescript
const jobId = "..." // from POST response

// Poll for results
let completed = false
while (!completed) {
  const res = await fetch(`/api/jobs/${jobId}`)
  const job = await res.json()
  
  if (job.status === 'completed') {
    console.log(job.result)
    completed = true
  } else if (job.status === 'failed') {
    console.error(job.error_message)
    completed = true
  }
  
  await new Promise(r => setTimeout(r, 2000)) // Wait 2s
}
```

### With Hook (Recommended)
```typescript
import { useAsyncJob } from '@/lib/hooks/useAsyncJob'

const { job, isCompleted, error } = useAsyncJob(jobId, {
  pollInterval: 2000,
  autoStart: true
})

if (isCompleted) console.log(job?.result)
```

## Full Example: Symptom Analysis

```typescript
'use client'

import { useState } from 'react'
import { useAsyncJob } from '@/lib/hooks/useAsyncJob'

export default function SymptomChecker() {
  const [jobId, setJobId] = useState<string>('')
  const { job, isLoading } = useAsyncJob(jobId, { autoStart: !!jobId })

  const handleAnalyze = async () => {
    const res = await fetch('/api/symptoms/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms: ['fever', 'cough'] })
    })
    
    const { job_id } = await res.json()
    setJobId(job_id) // Starts polling automatically
  }

  return (
    <div>
      <button onClick={handleAnalyze}>Analyze</button>
      {isLoading && <p>Processing...</p>}
      {job?.status === 'completed' && (
        <div>{JSON.stringify(job.result)}</div>
      )}
      {job?.status === 'failed' && (
        <div>Error: {job.error_message}</div>
      )}
    </div>
  )
}
```

## Webhook Payload Format

### What N8N Receives
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "webhook_url": "https://yourapp.com/api/webhooks/symptom-analysis",
  "patient_id": "user-123",
  "symptoms": ["fever", "cough"],
  "duration": "3 days",
  "severity": "mild"
}
```

### What N8N Should Send Back
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "patient_id": "user-123",
  "analysis_result": {
    "urgency_level": "low",
    "possible_conditions": [...],
    "immediate_actions": [...]
  },
  "status": "completed",
  "error_message": null
}
```

## Job Status States

| Status | Meaning |
|--------|---------|
| pending | Queued, waiting for N8N |
| processing | N8N is working on it |
| completed | Done, check result |
| failed | Error occurred, check error_message |

## Environment Setup

```env
# Required
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/processor

# Optional (auto-detected from VERCEL_URL)
NEXT_PUBLIC_API_URL=https://your-app.com
```

## Database Setup

```sql
-- Run this in Supabase SQL Editor
CREATE TABLE async_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  webhook_url TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_async_jobs_status ON async_jobs(status);
CREATE INDEX idx_async_jobs_job_id ON async_jobs(job_id);
```

## Testing

```bash
# 1. Create job
curl -X POST http://localhost:3000/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever"]}'

# Returns: { "job_id": "xxx", "status": "processing" }

# 2. Check status (repeatedly)
curl http://localhost:3000/api/jobs/xxx

# 3. Simulate N8N callback
curl -X POST http://localhost:3000/api/webhooks/symptom-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "xxx",
    "patient_id": "user-123",
    "analysis_result": { "urgency_level": "low" },
    "status": "completed"
  }'

# 4. Check status again to see result
curl http://localhost:3000/api/jobs/xxx
```

## Files to Know

| File | Purpose |
|------|---------|
| `/lib/n8n/send-job.ts` | Queue job, get status |
| `/lib/hooks/useAsyncJob.ts` | React hook for polling |
| `/app/api/jobs/[job_id]/route.ts` | Check job status |
| `/app/api/webhooks/*/route.ts` | N8N callbacks |
| `/scripts/create-async-jobs-table.sql` | DB schema |

## Common Issues

### Job stuck in "pending"
→ N8N not running or webhook URL wrong → Check N8N_WEBHOOK_URL

### Results not saved
→ Webhook not called or job_id mismatch → Check N8N logs

### Polling timeout
→ Job takes too long → Increase maxWaitTime in useAsyncJob

## Performance Tuning

```typescript
// Fast-response workflows (UI feedback needed quickly)
useAsyncJob(jobId, {
  pollInterval: 500,    // Check every 500ms
  maxWaitTime: 60000    // Give up after 1 minute
})

// Long-running workflows (batch processing, etc.)
useAsyncJob(jobId, {
  pollInterval: 5000,   // Check every 5s
  maxWaitTime: 600000   // Give up after 10 minutes
})
```

## Next Steps

1. ✅ Code deployed
2. 📋 Run SQL migration to create async_jobs table
3. 🔧 Set N8N_WEBHOOK_URL environment variable
4. ⚙️ Configure N8N workflow(s)
5. 🧪 Test end-to-end
6. 🚀 Deploy!

---

For more details, see: `WEBHOOK_SETUP.md`, `WEBHOOK_MIGRATION_GUIDE.md`
