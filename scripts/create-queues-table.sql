-- Create queues table for booking appointments

-- Ensure pgcrypto extension is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.queues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NULL,
  patient_email text NULL,
  doctor_id uuid NULL,
  clinic_id uuid NULL,
  appointment_date date NULL,
  appointment_time text NULL,
  queue_number integer NULL,
  reason_for_visit text NULL,
  consultation_type text NULL,
  status text NULL,
  estimated_wait_time_minutes integer NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT queues_pkey PRIMARY KEY (id),
  CONSTRAINT queues_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics (id),
  CONSTRAINT queues_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES doctors (id)
) TABLESPACE pg_default;
