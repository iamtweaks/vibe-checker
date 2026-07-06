-- Add contextual risk score + risk factors to scan_findings.
--
-- score: integer 0-100, computed by src/lib/scanners/risk-score.ts. The
--   score is recomputed every scan (not frozen), so re-scanning the same
--   URL with different code state can produce a different score for the
--   same (rule_id, file_path, line_number) tuple.
--
-- risk_factors: jsonb array of human-readable labels explaining WHY the
--   score is what it is (e.g. "Auth route", "Handles PII", "No ownership
--   filter"). Powers the right-side risk-factor panel in the UI.
--
-- Both columns are nullable so existing rows (pre-migration) keep working
-- without backfill.

alter table if exists public.scan_findings
  add column if not exists score integer
    check (score is null or (score >= 0 and score <= 100)),
  add column if not exists risk_factors jsonb
    check (risk_factors is null or jsonb_typeof(risk_factors) = 'array');

create index if not exists scan_findings_score_idx
  on public.scan_findings (score desc)
  where score is not null;

comment on column public.scan_findings.score is
  'Contextual risk score 0-100. Recomputed every scan; not frozen at first detection.';

comment on column public.scan_findings.risk_factors is
  'JSON array of human-readable labels explaining the score (auth route, PII, ownership missing, etc.).';