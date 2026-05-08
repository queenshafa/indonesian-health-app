# Webhook Deployment Checklist

## Pre-Deployment (Development)

- [ ] All webhook route files created
  - [ ] `/app/api/webhooks/symptom-analysis/route.ts`
  - [ ] `/app/api/webhooks/facility-finder/route.ts`
  - [ ] `/app/api/webhooks/queue-processing/route.ts`
  - [ ] `/app/api/jobs/[job_id]/route.ts`

- [ ] Utilities created
  - [ ] `/lib/n8n/send-job.ts`
  - [ ] `/lib/hooks/useAsyncJob.ts`

- [ ] Routes converted to async
  - [ ] `POST /api/symptoms/analyze`
  - [ ] `POST /api/facilities/nearby`
  - [ ] `POST /api/queues` (POST only, GET unchanged)

- [ ] Testing with local N8N
  - [ ] Webhook endpoints respond to POST requests
  - [ ] Job status endpoint returns correct data
  - [ ] Can create jobs and check status
  - [ ] Job status transitions work (pending → processing → completed)

## Database Setup

- [ ] Create async_jobs table
  - [ ] Run SQL from `/scripts/create-async-jobs-table.sql`
  - [ ] Verify table created in Supabase
  - [ ] Verify indexes created
  - [ ] Enable RLS if needed

- [ ] Verify schema
  ```sql
  SELECT * FROM async_jobs LIMIT 1; -- Should work
  ```

## Configuration

- [ ] Environment Variables Set
  - [ ] `N8N_WEBHOOK_URL` configured
  - [ ] `NEXT_PUBLIC_API_URL` configured (optional)
  - [ ] No typos in env var names
  - [ ] URLs are accessible (test with curl)

- [ ] N8N Workflows Created
  - [ ] Symptom analysis workflow
  - [ ] Facility finder workflow
  - [ ] Queue processing workflow
  - [ ] All workflows have correct webhook triggers

- [ ] N8N Configuration
  - [ ] Each workflow receives `job_id` and `webhook_url`
  - [ ] Each workflow POSTs to `webhook_url` on completion
  - [ ] Response includes: `job_id`, `status`, `result`/`error_message`

## Testing Checklist

### Unit Tests

- [ ] Send job to N8N
  ```bash
  curl -X POST http://localhost:3000/api/symptoms/analyze \
    -H "Content-Type: application/json" \
    -d '{"symptoms": ["fever"]}'
  # Expected: { "job_id": "...", "status": "processing" }
  ```

- [ ] Check job status
  ```bash
  curl http://localhost:3000/api/jobs/[job_id]
  # Expected: { "job_id": "...", "status": "processing", ... }
  ```

- [ ] Simulate webhook callback
  ```bash
  curl -X POST http://localhost:3000/api/webhooks/symptom-analysis \
    -H "Content-Type: application/json" \
    -d '{
      "job_id": "[job_id]",
      "patient_id": "user-123",
      "analysis_result": { "urgency_level": "low" },
      "status": "completed"
    }'
  # Expected: { "success": true }
  ```

- [ ] Check updated job status
  ```bash
  curl http://localhost:3000/api/jobs/[job_id]
  # Expected: status should be "completed" with result
  ```

### Integration Tests

- [ ] Facility finder workflow
  - [ ] POST to `/api/facilities/nearby` returns job_id
  - [ ] N8N receives correct payload
  - [ ] N8N posts results to webhook
  - [ ] Results saved in async_jobs table
  - [ ] Client polling gets results

- [ ] Symptom analysis workflow
  - [ ] POST to `/api/symptoms/analyze` returns job_id
  - [ ] N8N receives correct payload
  - [ ] N8N posts results to webhook
  - [ ] Results saved in health_records AND async_jobs
  - [ ] Client polling gets results

- [ ] Queue creation workflow
  - [ ] POST to `/api/queues` returns job_id
  - [ ] N8N receives correct payload
  - [ ] N8N calculates queue number
  - [ ] N8N posts results to webhook
  - [ ] Queue entry created in database
  - [ ] Client polling gets results

### Client Testing

- [ ] useAsyncJob hook works
  - [ ] Hook mounts without errors
  - [ ] Hook starts polling when jobId provided
  - [ ] Hook returns correct job status
  - [ ] Hook detects completion

- [ ] UI components work
  - [ ] Loading state displays while processing
  - [ ] Results display when complete
  - [ ] Error messages display on failure
  - [ ] User can retry failed operations

- [ ] Error scenarios
  - [ ] Invalid job_id returns 404
  - [ ] N8N error updates job as failed
  - [ ] Error message persists to database
  - [ ] Client shows error to user

## Performance Validation

- [ ] Response times
  - [ ] POST returns in <100ms
  - [ ] GET /api/jobs returns in <50ms
  - [ ] Webhook receives/processes in <1s

- [ ] Polling strategy
  - [ ] Default 2000ms interval works for workflows
  - [ ] No excessive database queries
  - [ ] Client not creating memory leaks from intervals

- [ ] Database performance
  - [ ] async_jobs queries use indexes
  - [ ] No slow queries
  - [ ] Can handle concurrent requests

## Production Deployment

- [ ] Code Review
  - [ ] All webhook handlers reviewed
  - [ ] Error handling is comprehensive
  - [ ] Security checks in place (job_id validation)
  - [ ] Logging added for debugging

- [ ] Staging Deployment
  - [ ] Deploy to staging environment first
  - [ ] Configure N8N for staging
  - [ ] Run full integration tests
  - [ ] Monitor logs for errors
  - [ ] Load test with expected volume

- [ ] Production Preparation
  - [ ] N8N instances scaled if needed
  - [ ] Database indexes created
  - [ ] Backup strategy confirmed
  - [ ] Rollback plan documented
  - [ ] Monitoring/alerting configured

- [ ] Production Deployment
  - [ ] Deploy code
  - [ ] Verify environment variables
  - [ ] Run smoke tests
  - [ ] Monitor for errors
  - [ ] Check async_jobs table for successful jobs

## Post-Deployment

- [ ] Monitoring
  - [ ] Monitor async_jobs table size (cleanup old records if needed)
  - [ ] Monitor job success/failure rates
  - [ ] Monitor response times
  - [ ] Alert on high error rates

- [ ] Maintenance
  - [ ] Clean up old completed jobs periodically
  - [ ] Archive old records if needed
  - [ ] Update documentation if workflows change
  - [ ] Train team on new webhook system

- [ ] Rollback Plan (If Issues)
  - [ ] Keep old synchronous routes available as fallback
  - [ ] Monitor error rate closely first 24 hours
  - [ ] Document all issues for post-mortem
  - [ ] Plan improvements for next iteration

## Documentation

- [ ] Documentation Complete
  - [ ] `/WEBHOOK_SETUP.md` - Configuration guide
  - [ ] `/WEBHOOK_MIGRATION_GUIDE.md` - Implementation details
  - [ ] `/WEBHOOK_QUICK_REFERENCE.md` - Quick look-up
  - [ ] `/WEBHOOK_CODE_EXAMPLES.md` - Before/after examples
  - [ ] `/WEBHOOK_CHANGES_SUMMARY.md` - What changed
  - [ ] This checklist updated

- [ ] Team Knowledge
  - [ ] Team trained on webhook system
  - [ ] N8N workflows documented
  - [ ] Troubleshooting guide updated
  - [ ] On-call team briefed

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| DevOps | | | |
| Product | | | |

---

## Rollback Steps (If Needed)

If critical issues arise:

1. Revert code deployment
2. Routes will use old synchronous behavior (if kept as fallback)
3. Stop N8N workflows
4. Clear async_jobs table if corrupted
5. Notify users of service disruption
6. Document root cause
7. Plan fix for next deployment

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Jobs stuck in pending | N8N not running | Check N8N status, restart if needed |
| Webhook not called | Wrong webhook URL | Verify N8N_WEBHOOK_URL env var |
| Results not saved | Webhook handler error | Check application logs |
| High error rate | N8N overloaded | Scale N8N instances |
| Polling timeout | Workflow too slow | Increase maxWaitTime in hook |
| Database errors | async_jobs table missing | Run SQL migration again |

## Support Contacts

- **N8N Issues:** [N8N Support]
- **Supabase Issues:** [Supabase Support]
- **Application Issues:** [Internal Support Channel]

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Environment:** ☐ Staging  ☐ Production

**Notes:** 
```
_________________________________________________
_________________________________________________
_________________________________________________
```
