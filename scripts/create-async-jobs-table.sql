-- Create async_jobs table for tracking webhook-based async operations
CREATE TABLE IF NOT EXISTS async_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  webhook_url TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_async_jobs_status ON async_jobs(status);
CREATE INDEX IF NOT EXISTS idx_async_jobs_created_at ON async_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_async_jobs_job_id ON async_jobs(job_id);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE async_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own jobs
CREATE POLICY "Users can view their own async jobs"
  ON async_jobs
  FOR SELECT
  USING (
    payload->>'patient_id' = auth.uid()::text OR
    payload->>'user_id' = auth.uid()::text
  );

CREATE POLICY "Service role can manage async jobs"
  ON async_jobs
  FOR ALL
  USING (auth.role() = 'service_role');
