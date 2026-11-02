insert into projects(id,name,owner,purpose,access_review_due,retention_review_due) values
('10000000-0000-4000-8000-000000000001','Harbour Support','Alex Chen','Evaluate fictional support answers before a release',current_date-3,current_date+60)
on conflict do nothing;
insert into suites(id,project_id,name,version,review_due) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Support acceptance','2026-11',current_date-1)
on conflict do nothing;
insert into cases(id,suite_id,case_key,cohort,input,expected,assertion,max_latency_ms) values
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','returns-window','policy','"How long is the return window?"','"30 days"','contains',2000),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','refund-route','policy','"How do I request a refund?"','"Contact support"','exact',2000),
('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','order-status','structured','"Give the order status as JSON"','null','valid-json',1000),
('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000001','unknown-order','fallback','"My order is not found"','"Ask for the order number"','exact',1500)
on conflict do nothing;
insert into runs(id,suite_id,name,model_version,producer,review_due) values
('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Baseline','support-v1','Alex Chen',current_date+7),
('40000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','Candidate','support-v2','Alex Chen',current_date-2)
on conflict do nothing;
insert into observations(id,suite_id,run_id,case_id,output,latency_ms,actor) values
('50000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','"Return within 30 days"',600,'Alex Chen'),
('50000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','"Contact support"',700,'Alex Chen'),
('50000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003','"{\"status\":\"shipped\"}"',500,'Alex Chen'),
('50000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000004','"Ask for the order number"',400,'Alex Chen'),
('50000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','"Return within 14 days"',600,'Alex Chen'),
('50000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','"Contact support"',2500,'Alex Chen'),
('50000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003','"{\"status\":\"shipped\"}"',450,'Alex Chen')
on conflict do nothing;
insert into actions(id,run_id,title,owner,due) values
('60000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002','Restore approved return window','Morgan Lee',current_date-2)
on conflict do nothing;
