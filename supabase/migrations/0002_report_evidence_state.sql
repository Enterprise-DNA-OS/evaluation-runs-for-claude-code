create or replace view run_summary as
select r.id,r.name,s.name suite,s.version suite_version,r.model_version,r.producer,r.review_due,
 (select count(*)::int from cases c where c.suite_id=r.suite_id) expected_cases,
 (select count(*)::int from observations o where o.run_id=r.id) observed_cases,
 e.id evaluation_id,e.total,e.passed,e.failed,e.created_at evaluated_at,
 coalesce(v.decision,'unreviewed') decision,
 case when e.id is null then 'not evaluated'
 when e.snapshot->>'model_version'<>r.model_version
 or e.snapshot->'cases'<>coalesce((select jsonb_agg(to_jsonb(c) order by c.case_key) from
  (select id,case_key,cohort,input,expected,assertion,max_latency_ms from cases where suite_id=r.suite_id)c),'[]'::jsonb)
 or e.snapshot->'observations'<>coalesce((select jsonb_agg(to_jsonb(o) order by o.case_id) from
  (select case_id,output,latency_ms,exception from observations where run_id=r.id)o),'[]'::jsonb)
 then 'stale' else 'current' end evidence_state
from runs r join suites s on s.id=r.suite_id
left join lateral(select * from evaluations e where e.run_id=r.id order by created_at desc,id desc limit 1)e on true
left join lateral(select decision from reviews v where v.evaluation_id=e.id order by created_at desc,id desc limit 1)v on true;
