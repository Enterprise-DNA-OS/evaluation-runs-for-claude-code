create function touch_updated() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table projects (
 id uuid primary key default gen_random_uuid(), name text not null check (btrim(name)<>''),
 owner text not null check (btrim(owner)<>''), purpose text not null check (btrim(purpose)<>''),
 access_review_due date not null, retention_review_due date not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index projects_name on projects(lower(name));
create table suites (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects,
 name text not null check(btrim(name)<>''), version text not null check(btrim(version)<>''), review_due date not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(project_id,name,version)
);
create table cases (
 id uuid primary key default gen_random_uuid(), suite_id uuid not null references suites,
 case_key text not null check(btrim(case_key)<>''), cohort text not null default 'general',
 input jsonb not null, expected jsonb not null, assertion text not null check(assertion in ('exact','contains','valid-json')),
 max_latency_ms integer check(max_latency_ms>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(suite_id,case_key), unique(id,suite_id)
);
create table runs (
 id uuid primary key default gen_random_uuid(), suite_id uuid not null references suites,
 name text not null check(btrim(name)<>''), model_version text not null check(btrim(model_version)<>''),
 producer text not null check(btrim(producer)<>''), review_due date not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(suite_id,name), unique(id,suite_id)
);
create table imports (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references runs,
 file_hash text not null, mapping jsonb not null, source_ref text not null,
 actor text not null, expected_count integer not null check(expected_count>0), actual_count integer not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(run_id,file_hash), check(expected_count=actual_count)
);
create table observations (
 id uuid primary key default gen_random_uuid(), suite_id uuid not null, run_id uuid not null,
 case_id uuid not null, output jsonb not null, latency_ms integer check(latency_ms>=0),
 exception text, source_project text, source_id text, source_record jsonb,
 import_id uuid references imports, actor text not null check(btrim(actor)<>''),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(run_id,suite_id) references runs(id,suite_id),
 foreign key(case_id,suite_id) references cases(id,suite_id),
 unique(run_id,case_id), unique(source_project,source_id)
);
create table evaluations (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references runs,
 actor text not null check(btrim(actor)<>''), fingerprint text not null,
 snapshot jsonb not null, results jsonb not null, total integer not null check(total>0),
 passed integer not null check(passed>=0), failed integer not null check(failed>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(total=passed+failed)
);
create table reviews (
 id uuid primary key default gen_random_uuid(), evaluation_id uuid not null references evaluations,
 actor text not null check(btrim(actor)<>''), decision text not null check(decision in ('approved','rejected')),
 evidence text not null check(btrim(evidence)<>''),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table actions (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references runs,
 title text not null check(btrim(title)<>''), owner text not null check(btrim(owner)<>''), due date not null,
 status text not null default 'open' check(status in ('open','closed')), resolution text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status<>'closed' or length(btrim(resolution))>0)
);
create table notes (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references runs,
 actor text not null check(btrim(actor)<>''), body text not null check(btrim(body)<>''),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function immutable_record() returns trigger language plpgsql as $$
begin raise exception 'Evidence is append-only. Record a new run or review.'; end $$;
do $$ declare t text; begin
 foreach t in array array['projects','suites','cases','runs','imports','observations','evaluations','reviews','actions','notes'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
 foreach t in array array['imports','observations','evaluations','reviews','notes'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function immutable_record()',t);
 end loop;
end $$;

create view run_summary as
select r.id,r.name,s.name suite,s.version suite_version,r.model_version,r.producer,r.review_due,
 (select count(*)::int from cases c where c.suite_id=r.suite_id) expected_cases,
 (select count(*)::int from observations o where o.run_id=r.id) observed_cases,
 e.id evaluation_id,e.total,e.passed,e.failed,e.created_at evaluated_at,
 coalesce(v.decision,'unreviewed') decision
from runs r join suites s on s.id=r.suite_id
left join lateral(select * from evaluations e where e.run_id=r.id order by created_at desc,id desc limit 1)e on true
left join lateral(select decision from reviews v where v.evaluation_id=e.id order by created_at desc,id desc limit 1)v on true;

create view action_queue as
select a.id,r.name run,a.title,a.owner,a.due,(current_date-a.due) days_overdue,a.status,a.resolution
from actions a join runs r on r.id=a.run_id;

create view control_checks as
select p.name record,'access-review' rule,p.access_review_due due,
 case when p.access_review_due<current_date then 'overdue' else 'current' end status,
 'https://www.privacy.org.nz/privacy-principles/5/' source from projects p
union all select p.name,'retention-review',p.retention_review_due,
 case when p.retention_review_due<current_date then 'overdue' else 'current' end,
 'https://www.privacy.org.nz/privacy-principles/9/' from projects p
union all select s.name||' '||s.version,'suite-review',s.review_due,
 case when s.review_due<current_date then 'overdue' else 'current' end,
 'Local policy: docs/compliance.md' from suites s;
revoke all on run_summary,action_queue,control_checks from public;
