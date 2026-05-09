# Environment Variables Required

## Overview
Daftar lengkap semua environment variables yang diperlukan untuk menjalankan aplikasi Indonesian Health App dengan integrasi N8N webhook.

---

## 1. SUPABASE (Required - Sudah Ada)

### `NEXT_PUBLIC_SUPABASE_URL`
- **Location:** Supabase Dashboard → Project Settings → API
- **Format:** `https://[project-id].supabase.co`
- **Example:** `https://cetfgtufoxxldipgjgae.supabase.co`
- **Used in:** 
  - `lib/supabase/server.ts`
  - `lib/supabase/client.ts`
  - `lib/supabase/proxy.ts`
- **Status:** ✅ Already set

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Location:** Supabase Dashboard → Project Settings → API → anon public
- **Format:** Long token string
- **Example:** `eyJhbGc...` (very long)
- **Used in:**
  - `lib/supabase/server.ts`
  - `lib/supabase/client.ts`
  - `lib/supabase/proxy.ts`
- **Status:** ✅ Already set

---

## 2. N8N WEBHOOK (Required - HARUS DITAMBAH)

### `N8N_WEBHOOK_URL`
- **Location:** N8N Dashboard → Your Webhook Configuration
- **Format:** Complete webhook URL from N8N
- **Example:** `https://n8n.yourcompany.com/webhook/symptom-analysis` or `https://n8n-xxxxx.app.n8n.cloud/webhook/xxxxxxx`
- **Used in:**
  - `lib/n8n/send-job.ts` (line 47)
- **Status:** ❌ **MISSING - HARUS DITAMBAH**
- **Description:** 
  - URL tempat semua job dikirim ke N8N
  - Didapat setelah setup N8N workflow
  - Server-side only (tidak public)

---

## 3. API URL Configuration (Optional tapi Recommended)

### `NEXT_PUBLIC_API_URL`
- **Location:** URL aplikasi Anda
- **Format:** Complete domain/URL
- **Example (Development):** `http://localhost:3000`
- **Example (Production):** `https://health-app.com`
- **Used in:**
  - `lib/n8n/send-job.ts` (line 41)
- **Status:** ⚠️ Optional (fallback ke VERCEL_URL jika tidak ada)
- **Description:**
  - Digunakan untuk construct webhook callback URL
  - Dikirim ke N8N agar N8N bisa callback ke `/api/webhooks/*`
  - Jika kosong, akan pakai VERCEL_URL (Vercel auto-set)

### `VERCEL_URL` 
- **Auto-set by Vercel** (Jangan tambah manual)
- **Format:** `your-app.vercel.app`
- **Used in:**
  - `lib/n8n/send-job.ts` (line 43 - fallback)
- **Status:** ✅ Auto-set by Vercel

---

## 4. AUTHENTICATION (Optional)

### `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`
- **Location:** Define sendiri
- **Format:** Complete URL
- **Example:** `http://localhost:3000/auth/callback`
- **Used in:**
  - `app/auth/sign-up/page.tsx` (line 32)
- **Status:** ⚠️ Optional (fallback ke `window.location.origin/auth/callback`)
- **Description:**
  - Redirect URL setelah email verification
  - Useful untuk development dengan custom callback

---

## 5. SYSTEM VARIABLES (Auto-set)

### `NODE_ENV`
- **Values:** `development`, `production`
- **Used in:**
  - `app/layout.tsx` (for Analytics)
- **Status:** ✅ Auto-set by deployment platform
- **Description:**
  - Automatically set by Next.js/Vercel
  - Jangan diubah manual

---

## Summary Tabel

| Variable | Required | Status | Type | File |
|----------|----------|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ Set | Public | supabase/*.ts |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ Set | Public | supabase/*.ts |
| `N8N_WEBHOOK_URL` | ✅ | ❌ Missing | Secret | lib/n8n/send-job.ts |
| `NEXT_PUBLIC_API_URL` | ⚠️ | ⚠️ Optional | Public | lib/n8n/send-job.ts |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | ⚠️ | ⚠️ Optional | Public | auth/sign-up/page.tsx |
| `NODE_ENV` | ⚠️ | ✅ Auto | System | app/layout.tsx |
| `VERCEL_URL` | ⚠️ | ✅ Auto | System | lib/n8n/send-job.ts |

---

## Setup Checklist

### Phase 1: Supabase (✅ DONE)
- [x] Daftar Supabase
- [x] Create project
- [x] Copy URL & Anon Key
- [x] Set environment variables

### Phase 2: N8N Integration (⏳ TODO)
- [ ] Setup N8N account (cloud atau self-hosted)
- [ ] Create 3 workflows:
  - [ ] Symptom Analysis workflow
  - [ ] Facility Finder workflow
  - [ ] Queue Processing workflow
- [ ] Get webhook URLs dari setiap workflow
- [ ] Set `N8N_WEBHOOK_URL` environment variable
- [ ] Test webhook connection

### Phase 3: Deployment (⏳ TODO)
- [ ] Push code ke GitHub/Vercel
- [ ] Set `N8N_WEBHOOK_URL` di Vercel project settings
- [ ] Verify `NEXT_PUBLIC_API_URL` is correct (or rely on VERCEL_URL)
- [ ] Test webhook flow end-to-end

---

## How to Add Variables to Vercel

1. Go to your Vercel project
2. Click **Settings** in top navigation
3. Click **Environment Variables** in left sidebar
4. Click **Add New** button
5. Enter variable name and value
6. Select which environments (Production, Preview, Development)
7. Click **Save**
8. Redeploy for changes to take effect

---

## Testing Commands

### Test Supabase Connection
```bash
curl -X GET "https://[YOUR_SUPABASE_URL]/rest/v1/async_jobs?limit=1" \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]"
```

### Test N8N Webhook (jika sudah setup)
```bash
curl -X POST "https://[N8N_WEBHOOK_URL]" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-12345",
    "webhook_url": "http://localhost:3000/api/webhooks/test",
    "test": true
  }'
```

---

## Environment File Format (untuk local development)

Create `.env.local` file di root project:

```env
# Supabase (required - already set in Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://cetfgtufoxxldipgjgae.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# N8N Webhook (required - add this!)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

**⚠️ IMPORTANT:** 
- Jangan commit `.env.local` ke GitHub
- Add ke `.gitignore` jika belum ada
- Variables dengan prefix `NEXT_PUBLIC_` akan di-expose ke browser
- Variables tanpa prefix hanya available di server-side

---

## Troubleshooting

### Error: "N8N_WEBHOOK_URL is not set"
**Solution:** Add `N8N_WEBHOOK_URL` ke Vercel environment variables

### Error: "Invalid webhook URL"
**Solution:** 
- Verify N8N webhook URL format correct
- Check N8N instance is accessible from Vercel IPs
- Verify webhook is enabled in N8N

### Error: "Callback URL mismatch"
**Solution:**
- Verify `NEXT_PUBLIC_API_URL` matches your domain
- For Vercel, leave empty (uses VERCEL_URL automatically)
- For local dev, set to `http://localhost:3000`

---

## Next Steps

1. **Setup N8N workflows** (lihat WEBHOOK_SETUP.md)
2. **Get N8N webhook URLs** dari setiap workflow
3. **Add `N8N_WEBHOOK_URL`** ke Vercel environment variables
4. **Test webhook connection** (lihat WEBHOOK_QUICK_REFERENCE.md)
5. **Deploy dan verify** semua routes berfungsi

---

**Last Updated:** May 8, 2026
**For more details:** Baca WEBHOOK_DOCS_INDEX.md untuk semua dokumentasi
