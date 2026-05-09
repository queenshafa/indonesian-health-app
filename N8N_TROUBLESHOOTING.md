# N8N Webhook Troubleshooting Guide

## Error: "This webhook is not registered for GET requests"

This error means one of the following:

### Problem 1: Wrong HTTP Method
- N8N webhooks ONLY accept **POST** requests
- Our code uses POST ✅ (see `lib/n8n/send-job.ts` line 47)
- This error usually means the request is hitting N8N but not through the webhook

### Problem 2: Webhook URL is Incorrect
The `N8N_WEBHOOK_URL` environment variable may be pointing to wrong endpoint.

**Expected format:**
```
https://sapuwicak.app.n8n.cloud/webhook/symptom-analysis
https://sapuwicak.app.n8n.cloud/webhook/facility-finder
https://sapuwicak.app.n8n.cloud/webhook/queue-processing
```

**❌ Wrong format (causes error):**
```
https://sapuwicak.app.n8n.cloud/workflow/EXeH6XpVrCbvaoBU
https://sapuwicak.app.n8n.cloud/api/...
```

### Problem 3: Webhook Not Activated in N8N
In N8N workflow, the webhook trigger node must be:
1. Active (enabled)
2. Deployed/Published
3. Set to accept POST requests only

---

## How to Get Correct N8N Webhook URL

### Step 1: In N8N Dashboard
1. Open your workflow
2. Find the **Webhook Trigger** node (first node)
3. Click on it to expand settings
4. Look for "Webhook URL" field

### Step 2: Copy the URL
The URL should look like:
```
https://sapuwicak.app.n8n.cloud/webhook/[UNIQUE_ID]
```

### Step 3: Add to Your App
1. Go to Vercel Project Settings → Environment Variables
2. Add/Update `N8N_WEBHOOK_URL` with the correct URL
3. Redeploy the app

---

## Testing the Connection

### Test 1: Direct cURL Test
```bash
curl -X POST https://sapuwicak.app.n8n.cloud/webhook/symptom-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-123",
    "webhook_url": "http://localhost:3000/api/webhooks/symptom-analysis",
    "symptoms": ["fever"],
    "duration": "2 days"
  }'
```

**Expected response:** Either workflow processes it or returns job accepted message

### Test 2: Via Your App
1. Go to `/dashboard/symptom-checker`
2. Fill in symptoms
3. Submit
4. Check browser console and server logs

**Look for:**
- ✅ Response with `job_id` and `status: "processing"`
- ✅ HTTP 202 status code
- ❌ 404 or GET error = wrong webhook URL

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `GET 404` | Webhook not found | Verify webhook URL in N8N |
| `POST 404` | Wrong base URL | Check domain, port, path |
| `Connection refused` | N8N not running | Ensure N8N instance is running |
| `Timeout` | N8N processing too slow | Check N8N workflow nodes |
| `Empty job_id in response` | Callback not sending proper data | Check N8N callback node |

---

## Webhook Payload Structure

### What App Sends to N8N:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "webhook_url": "https://yourapp.com/api/webhooks/symptom-analysis",
  "symptoms": ["fever", "cough"],
  "duration": "3 days",
  "severity": "moderate",
  "age": 28
}
```

### What N8N Should Send Back:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "data": {
    "urgency_level": "high",
    "possible_conditions": [...],
    "immediate_actions": [...],
    "when_to_see_doctor": "..."
  }
}
```

---

## Debug Checklist

- [ ] N8N_WEBHOOK_URL is set in Vercel env vars
- [ ] URL format is correct (not workflow URL, webhook URL)
- [ ] Webhook trigger is ACTIVE in N8N
- [ ] Workflow is PUBLISHED in N8N
- [ ] HTTP method in N8N is POST only
- [ ] Callback URL in N8N points to `/api/webhooks/[type]`
- [ ] App is redeployed after env var changes
- [ ] Check server logs for actual error message

---

## Where to Find Logs

### App Logs:
```
Vercel Dashboard → Project → Deployments → Function Logs
```

### N8N Logs:
```
N8N Dashboard → Workflows → [Your Workflow] → Execution History
```

Look for failed executions to see exact error.

---

## Still Not Working?

Share these details:
1. **Exact error message** from browser or server logs
2. **N8N workflow execution history** (screenshot of failed execution)
3. **Current N8N webhook URL** (without exposing credentials)
4. **Is N8N_WEBHOOK_URL set in Vercel?** (Yes/No)
