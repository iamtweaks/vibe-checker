-- READ-ONLY DIAGNOSTIC SCRIPT
-- This script makes no DDL or DML changes. It only validates expected catalog
-- objects and reads PostgreSQL/Supabase metadata plus aggregate counts.
-- It does not select scan finding contents, migration statements, or secrets.
--
-- Share back the result sets labeled 01 through 09, including empty result sets
-- and any error message. Do not share unrelated SQL Editor output.

-- Fail early with a clear message instead of producing partial or misleading data.
DO $$
BEGIN
  IF to_regnamespace('public') IS NULL THEN
    RAISE EXCEPTION
      'Expected schema public is absent; cannot inspect public.scan_findings.';
  END IF;

  IF to_regclass('public.scan_findings') IS NULL THEN
    RAISE EXCEPTION
      'Expected table public.scan_findings is absent; no rollback state can be inspected.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'public.scan_findings'::regclass
      AND attname = 'score'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    RAISE EXCEPTION
      'Expected column public.scan_findings.score is absent; cannot inspect the score rollback state.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'public.scan_findings'::regclass
      AND attname = 'risk_factors'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    RAISE EXCEPTION
      'Expected column public.scan_findings.risk_factors is absent; cannot inspect the risk-factor rollback state.';
  END IF;

  IF to_regnamespace('supabase_migrations') IS NULL
     OR to_regclass('supabase_migrations.schema_migrations') IS NULL THEN
    RAISE EXCEPTION
      'Expected Supabase migration history table supabase_migrations.schema_migrations is absent; cannot inspect migration prefixes.';
  END IF;
END;
$$;

-- 01. Matching Supabase migration history. Zero rows means no matching version is recorded.
SELECT
  version,
  name
FROM supabase_migrations.schema_migrations
WHERE version LIKE '20260623015000%'
   OR version LIKE '20260706%'
ORDER BY version;

-- 02. Current columns, types, defaults, nullability, and comments.
SELECT
  a.attnum AS ordinal_position,
  a.attname AS column_name,
  pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
  NOT a.attnotnull AS is_nullable,
  pg_get_expr(ad.adbin, ad.adrelid) AS column_default,
  a.attidentity AS identity_kind,
  a.attgenerated AS generated_kind,
  col_description(a.attrelid, a.attnum) AS column_comment
FROM pg_attribute AS a
LEFT JOIN pg_attrdef AS ad
  ON ad.adrelid = a.attrelid
 AND ad.adnum = a.attnum
WHERE a.attrelid = 'public.scan_findings'::regclass
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY a.attnum;

-- 03. Constraints defined on public.scan_findings.
SELECT
  con.conname AS constraint_name,
  CASE con.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'c' THEN 'CHECK'
    WHEN 'x' THEN 'EXCLUSION'
    ELSE con.contype::text
  END AS constraint_type,
  con.convalidated AS is_validated,
  con.condeferrable AS is_deferrable,
  con.condeferred AS is_initially_deferred,
  pg_get_constraintdef(con.oid, true) AS definition
FROM pg_constraint AS con
WHERE con.conrelid = 'public.scan_findings'::regclass
ORDER BY constraint_type, constraint_name;

-- 04. Indexes defined on public.scan_findings, including constraint-backed indexes.
SELECT
  idx.relname AS index_name,
  i.indisprimary AS is_primary,
  i.indisunique AS is_unique,
  i.indisvalid AS is_valid,
  i.indisready AS is_ready,
  con.conname AS backing_constraint_name,
  pg_get_indexdef(i.indexrelid) AS definition
FROM pg_index AS i
JOIN pg_class AS idx
  ON idx.oid = i.indexrelid
LEFT JOIN pg_constraint AS con
  ON con.conindid = i.indexrelid
WHERE i.indrelid = 'public.scan_findings'::regclass
ORDER BY idx.relname;

-- 05. User-defined and internal triggers on public.scan_findings.
SELECT
  trg.tgname AS trigger_name,
  trg.tgenabled AS enabled_state,
  trg.tgisinternal AS is_internal,
  pg_get_triggerdef(trg.oid, true) AS definition
FROM pg_trigger AS trg
WHERE trg.tgrelid = 'public.scan_findings'::regclass
ORDER BY trg.tgisinternal, trg.tgname;

-- 06. Row-level security state and policies.
SELECT
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class AS c
WHERE c.oid = 'public.scan_findings'::regclass;

SELECT
  policyname AS policy_name,
  permissive AS policy_mode,
  roles AS applicable_roles,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'scan_findings'
ORDER BY policyname;

-- 07. Effective table ACL entries, including defaults when no explicit ACL is set.
SELECT
  CASE acl.grantee
    WHEN 0 THEN 'PUBLIC'
    ELSE grantee_role.rolname
  END AS grantee,
  grantor_role.rolname AS grantor,
  acl.privilege_type,
  acl.is_grantable
FROM pg_class AS c
CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) AS acl
LEFT JOIN pg_roles AS grantee_role
  ON grantee_role.oid = acl.grantee
JOIN pg_roles AS grantor_role
  ON grantor_role.oid = acl.grantor
WHERE c.oid = 'public.scan_findings'::regclass
ORDER BY grantee, acl.privilege_type;

-- 08. Catalog dependencies in both directions. This returns object identities only.
WITH target AS (
  SELECT 'public.scan_findings'::regclass::oid AS relation_oid
)
SELECT
  'scan_findings_depends_on' AS direction,
  d.deptype AS dependency_type,
  pg_describe_object(d.classid, d.objid, d.objsubid) AS object_identity,
  pg_describe_object(d.refclassid, d.refobjid, d.refobjsubid) AS related_object_identity
FROM pg_depend AS d
JOIN target AS t
  ON d.objid = t.relation_oid
UNION ALL
SELECT
  'depends_on_scan_findings' AS direction,
  d.deptype AS dependency_type,
  pg_describe_object(d.classid, d.objid, d.objsubid) AS object_identity,
  pg_describe_object(d.refclassid, d.refobjid, d.refobjsubid) AS related_object_identity
FROM pg_depend AS d
JOIN target AS t
  ON d.refobjid = t.relation_oid
ORDER BY direction, dependency_type, object_identity;

-- 09. Aggregate state only; no scan finding rows or values are selected.
SELECT
  count(*) AS total_rows,
  count(score) AS rows_with_non_null_score,
  count(risk_factors) AS rows_with_non_null_risk_factors
FROM public.scan_findings;
