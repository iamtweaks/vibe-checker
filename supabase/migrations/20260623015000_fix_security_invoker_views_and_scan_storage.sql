-- Fix Supabase linter warnings:
-- - Security Definer View: public.recent_scans
-- - Security Definer View: public.top_vulnerabilities
--
-- SECURITY DEFINER views run with the view owner's privileges and can bypass
-- the querying user's RLS context. security_invoker=true makes Postgres enforce
-- permissions/RLS as the caller, which is what Supabase expects for public views.

do $$
begin
  if to_regclass('public.recent_scans') is not null then
    execute 'alter view public.recent_scans set (security_invoker = true)';
    comment on view public.recent_scans is
      'Recent scan summary. Uses security_invoker=true so caller permissions and RLS apply.';
  end if;

  if to_regclass('public.top_vulnerabilities') is not null then
    execute 'alter view public.top_vulnerabilities set (security_invoker = true)';
    comment on view public.top_vulnerabilities is
      'Aggregated vulnerability summary. Uses security_invoker=true so caller permissions and RLS apply.';
  end if;
end $$;

-- Storage model expected by the app:
-- scanned_targets stores each website/GitHub repo once.
-- scans stores every scan run for a target.
-- scan_findings stores each vulnerability/error found in a scan.

create extension if not exists pgcrypto;

create table if not exists public.scanned_targets (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('website', 'github')),
  normalized_url text not null,
  display_url text not null,
  first_scanned_at timestamptz not null default now(),
  last_scanned_at timestamptz not null default now(),
  scan_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (target_type, normalized_url)
);

create index if not exists scanned_targets_target_type_idx
  on public.scanned_targets (target_type);

create index if not exists scanned_targets_last_scanned_at_idx
  on public.scanned_targets (last_scanned_at desc);

alter table if exists public.scans
  add column if not exists target_id uuid references public.scanned_targets(id) on delete set null,
  add column if not exists scanned_files integer,
  add column if not exists scanned_urls integer,
  add column if not exists scan_duration_ms integer;

create index if not exists scans_target_id_idx
  on public.scans (target_id);

create table if not exists public.scan_findings (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  rule_id text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low', 'info')),
  title text not null,
  description text not null,
  file_path text,
  line_number integer,
  snippet text,
  remediation text not null,
  created_at timestamptz not null default now()
);

create index if not exists scan_findings_scan_id_idx
  on public.scan_findings (scan_id);

create index if not exists scan_findings_rule_id_idx
  on public.scan_findings (rule_id);

create index if not exists scan_findings_severity_idx
  on public.scan_findings (severity);

alter table public.scanned_targets enable row level security;
alter table public.scans enable row level security;
alter table public.scan_findings enable row level security;
