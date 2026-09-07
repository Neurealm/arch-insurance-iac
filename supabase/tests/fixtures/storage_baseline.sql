-- CI-only storage baseline.
--
-- The disposable Postgres image used by the BP1.1 SQL regression job does not
-- always ship the same storage schema shape as the hosted Supabase project:
-- storage.buckets can be missing entirely, or missing the `public` column.
-- Inherited migrations (e.g. the avatars bucket from the landing-zone import)
-- then fail on replay even though they are correct against the real project.
--
-- This file reconciles the image to the shape those migrations expect. It is a
-- test-harness fixture only: it is never applied to a real environment and it
-- never drops or rewrites existing storage objects.

create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  public boolean default false
);

alter table storage.buckets add column if not exists public boolean default false;
alter table storage.buckets add column if not exists file_size_limit bigint;
alter table storage.buckets add column if not exists allowed_mime_types text[];

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  metadata jsonb
);

alter table storage.objects enable row level security;

create or replace function storage.foldername(name text)
returns text[]
language plpgsql
immutable
as $$
declare
  parts text[];
begin
  parts := string_to_array(name, '/');
  return parts[1 : array_length(parts, 1) - 1];
end
$$;
