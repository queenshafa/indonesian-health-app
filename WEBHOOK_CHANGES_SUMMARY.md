# Webhook Migration Summary

## Overview

All long-running routes have been converted to **async webhook-based processing**. Routes now:

1. ✅ Validate input
2. ✅ Create job record in database
3. ✅ Send to N8N for processing
4. ✅ Return immediately (HTTP 202) with job_id
5. ✅ N8N processes asynchronously
6. ✅ N8N calls webhook when done
7. ✅ Client polls for results

## Files Created

### New Endpoints
- `/app/api/webhooks/symptom-analysis/route.ts` - Webhook receiver for symptom analysis
- `/app/api/webhooks/facility-finder/route.ts` - Webhook receiver for facility search
- `/app/api/webhooks/queue-processing/route.ts` - Webhook receiver for queue creation
- `/app/api/jobs/[job_id]/route.ts` - Job status checker

### Utilities
- `/lib/n8n/send-job.ts` - Core function to send jobs to N8N
- `/lib/hooks/useAsyncJob.ts` - React hook for polling job status

### Database
- `/scripts/create-async-jobs-table.sql` - Schema migration for async_jobs table

### Documentation
- `WEBHOOK_SETUP.md` - Detailed webhook configuration guide
- `WEBHOOK_MIGRATION_GUIDE.md` - Implementation guide for developers
- `WEBHOOK_CHANGES_SUMMARY.md` - This file

## Routes Modified

### POST /api/symptoms/analyze
**Before:** Inline Gemini AI processing (blocking)  
**After:** Queue job, return job_id immediately  
**HTTP Status:** 202 (Accepted)  
**Processing:** N8N webhook → Saves to health_records

### POST /api/facilities/nearby
**Before:** Inline distance calculation (blocking)  
**After:** Queue job, return job_id immediately  
**HTTP Status:** 202 (Accepted)  
**Processing:** N8N webhook → Updates async_jobs table

### POST /api/queues
**Before:** Inline database insert (blocking)  
**After:** Queue job, return job_id immediately  
**HTTP Status:** 202 (Accepted)  
**Processing:** N8N webhook → Creates queue entry

### Unchanged Routes
- `GET /api/doctors` - Simple read-only query
- `GET /api/queues` - Simple read-only query  
- `GET /auth/callback` - OAuth callback

## New Response Format

### Before
```json
{
  "success": true,
  "analysis_result": { ... }
}
```

### After
```json
{
  "message": "Symptom analysis queued",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing"
}
```

## Client Code Changes Needed

### Before
```typescript
const response = await fetch('/api/symptoms/analyze', {
  method: 'POST',
  body: JSON.stringify({ symptoms })
})
const result = await response.json() // ❌ Had to wait
```

### After
```typescript
// Option 1: Using hook (Recommended)
const { job, isCompleted } = useAsyncJob(jobId, { autoStart: true })

// Option 2: Manual polling
const result = await pollJobStatus(jobId)
```

## Database Setup

### Required
1. Create `async_jobs` table (SQL in `/scripts/create-async-jobs-table.sql`)
2. Set `N8N_WEBHOOK_URL` environment variable
3. Configure N8N workflow(s)

### Optional
- Add indexes for better query performance (included in SQL)
- Enable RLS policies (included in SQL)

## Environment Variables

```env
# Required
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/job-processor

# Optional
NEXT_PUBLIC_API_URL=https://your-app.com
```

## Key Functions

### sendJobToN8N()
```typescript
import { sendJobToN8N } from '@/lib/n8n/send-job'

const { job_id } = await sendJobToN8N("/symptom-analysis", {
  patient_id: user.id,
  symptoms: ['fever', 'cough'],
  // ... additional payload
})
```

### useAsyncJob()
```typescript
import { useAsyncJob } from '@/lib/hooks/useAsyncJob'

const { job, isLoading, isCompleted, error } = useAsyncJob(jobId, {
  pollInterval: 2000,
  maxWaitTime: 300000,
  autoStart: true
})
```

### getJobStatus()
```typescript
const response = await fetch(`/api/jobs/${jobId}`)
const job = await response.json()
// { job_id, status, result, error_message, created_at, completed_at }
```

## Testing

### 1. Create Job
```bash
curl -X POST http://localhost:3000/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever"]}'

# Response: { "job_id": "...", "status": "processing" }
```

### 2. Check Status
```bash
curl http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000

# Response: { "job_id": "...", "status": "processing", "result": null }
```

### 3. Simulate N8N Response
```bash
curl -X POST http://localhost:3000/api/webhooks/symptom-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "patient_id": "user-123",
    "analysis_result": { "urgency_level": "low" },
    "status": "completed"
  }'
```

## Performance Impact

### Latency
- **Old:** 2-30s (blocking on AI/distance calculation)
- **New:** <100ms (queue job immediately)

### User Experience
- Show loading state while processing
- Display results when job completes
- Handle failures gracefully

## Next Steps

1. ✅ Code migration complete
2. ⏳ Create async_jobs table in Supabase
3. ⏳ Set environment variables
4. ⏳ Configure N8N workflows
5. ⏳ Update client components to use polling
6. ⏳ Test end-to-end
7. ⏳ Deploy to production

## Support Documents

For detailed information, see:
- **Setup & Configuration:** `WEBHOOK_SETUP.md`
- **Implementation Guide:** `WEBHOOK_MIGRATION_GUIDE.md`
- **This Summary:** `WEBHOOK_CHANGES_SUMMARY.md`
