'use client'

import { useState, useCallback, useEffect } from 'react'

export interface AsyncJob {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error_message?: string
  created_at: string
  completed_at?: string
}

interface UseAsyncJobOptions {
  pollInterval?: number // ms between polls
  maxWaitTime?: number // ms before timeout
  autoStart?: boolean // automatically start polling
}

/**
 * Hook for polling async job status
 * Returns job status and helper functions
 */
export function useAsyncJob(
  initialJobId?: string,
  options: UseAsyncJobOptions = {}
) {
  const {
    pollInterval = 2000,
    maxWaitTime = 300000, // 5 minutes default
    autoStart = false,
  } = options

  const [job, setJob] = useState<AsyncJob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch job status: ${response.statusText}`)
      }

      const data = await response.json()
      setJob(data)
      setError(null)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Error fetching job status:', err)
      throw err
    }
  }, [])

  const startPolling = useCallback(
    async (jobId: string) => {
      setIsLoading(true)
      const startTime = Date.now()

      try {
        while (Date.now() - startTime < maxWaitTime) {
          const currentJob = await fetchJobStatus(jobId)

          if (currentJob.status === 'completed' || currentJob.status === 'failed') {
            setIsLoading(false)
            return currentJob
          }

          // Wait before next poll
          await new Promise((resolve) =>
            setTimeout(resolve, pollInterval)
          )
        }

        throw new Error('Job polling timeout')
      } catch (err) {
        setIsLoading(false)
        throw err
      }
    },
    [fetchJobStatus, pollInterval, maxWaitTime]
  )

  // Auto-start polling if initialJobId is provided and autoStart is true
  useEffect(() => {
    if (autoStart && initialJobId) {
      startPolling(initialJobId)
    }
  }, [autoStart, initialJobId, startPolling])

  return {
    job,
    isLoading,
    error,
    fetchJobStatus,
    startPolling,
    isCompleted: job?.status === 'completed',
    isFailed: job?.status === 'failed',
  }
}
