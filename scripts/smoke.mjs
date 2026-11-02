import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {migrate} from './migrate.mjs';
import {seed} from './seed.mjs';
import {execute,commands} from './evaluations.mjs';
import {score,canonical} from './lib/evaluate.mjs';
import {parseCsv} from './lib/csv.mjs';
import {page,table} from './lib/render.mjs';

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'evaluation-runs-test-'));
process.env.DATA_DIR=path.join(tmp,'db');process.env.OUTPUT_DIR=tmp;
// Never let npm test touch an ordinary configured business database.
process.env.DATABASE_URL=process.env.TEST_DATABASE_URL||'';
const db=await getDb();const seen=new Set();let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const run=async(cmd,opts={},pos=[])=>{seen.add(cmd);return execute(db,cmd,opts,pos);};
const bad=async(fn,re)=>{await assert.rejects(fn,re);checks++;};
const write=(name,data)=>{const file=path.join(tmp,name);fs.writeFileSync(file,typeof data==='string'?data:JSON.stringify(data));return file;};
const future='2099-12-31';
try{
 if(process.env.TEST_DATABASE_URL){const existing=await db.query("select tablename from pg_tables where schemaname='public'");if(existing.length)throw Error('TEST_DATABASE_URL must point at an empty disposable database');}
 await migrate(db);eq((await migrate(db)).ran,[]);await seed(db);await seed(db);
 eq((await run('projects')).length,1);eq((await run('suites')).length,1);
 eq((await run('cases',{suite:'SUPPORT ACCEPTANCE'})).length,4);
 eq((await run('runs')).length,2);eq((await run('observations',{run:'baseline'})).length,4);
 const preview=await run('score',{run:'Candidate'});eq(preview.filter(x=>x.passed).length,1);ok(preview.some(x=>x.reason==='missing answer'));
 eq((await run('run',{run:'Baseline'})).evaluation,null);
 const b=await run('evaluate',{run:'Baseline',actor:'Alex Chen'});eq([b.passed,b.failed],[4,0]);
 const c=await run('evaluate',{run:'Candidate',actor:'Alex Chen'});eq([c.passed,c.failed],[1,3]);
 eq((await run('results',{run:'Candidate'})).length,4);
 eq((await run('failures',{run:'Candidate'})).length,3);
 eq((await run('cohorts',{run:'Candidate'})).find(x=>x.cohort==='policy').failed,2);
 eq((await run('compare',{baseline:'Baseline',candidate:'Candidate'})).filter(x=>x.change==='regression').length,3);
 ok((await run('attention')).some(x=>x.attention.includes('review overdue')));
 ok((await run('compliance')).filter(x=>x.status==='overdue').length===2);
 eq((await run('actions')).length,1);
 await bad(()=>run('review',{run:'Candidate',actor:'Morgan Lee',decision:'approved',evidence:'checked'}),/failed/);
 await bad(()=>run('review',{run:'Baseline',actor:'  ALEX CHEN ',decision:'approved',evidence:'checked'}),/different actual reviewer/);
 await run('review',{run:'Candidate',actor:'Morgan Lee',decision:'rejected',evidence:'Return window regressed, latency high, fallback missing'});
 await run('review',{run:'Baseline',actor:'Morgan Lee',decision:'approved',evidence:'All four fictional checks independently reviewed'});
 eq((await run('reviews',{run:'Baseline'}))[0].decision,'approved');
 await run('log',{run:'Candidate',actor:'Morgan Lee',text:'Restore policy before another saved run'});
 eq((await run('history',{run:'Candidate'})).length,1);
 const action=await run('add-action',{run:'Candidate',title:'Fill fallback case',owner:'Alex Chen',due:future});
 await run('close-action',{action:action.id,actor:'Alex Chen',evidence:'Recorded for next version, do not approve the old run'});
 await bad(()=>run('close-action',{action:action.id,actor:'Alex Chen',evidence:'again'}),/already closed/);
 const p=await run('add-project',{name:'Review Lab',owner:'Taylor',purpose:'Synthetic acceptance tests','access-review-due':future,'retention-review-due':future});
 const s=await run('add-suite',{project:p.id,name:'Validation',version:'1','review-due':future});
 const caseFile=write('case.json',{case_key:'escaped',cohort:'<script>alert(1)</script>',input:{q:'literal'},expected:{a:1,b:2},assertion:'exact',max_latency_ms:50});
 const caseRow=await run('add-case',{suite:s.id,file:caseFile});
 const r=await run('add-run',{suite:s.id,name:'Local Run','model-version':'v1',actor:'Taylor','review-due':future});
 const observation=write('observation.json',{output:{b:2,a:1},latency_ms:50});
 await run('record',{run:r.id,case:caseRow.id,file:observation,actor:'Taylor'});
 eq((await run('score',{run:r.id}))[0].passed,true);
 await bad(()=>run('record',{run:r.id,case:caseRow.id,file:observation,actor:'Taylor'}),/unique/);
 await run('evaluate',{run:r.id,actor:'Taylor'});
 await bad(()=>run('record',{run:r.id,case:caseRow.id,file:observation,actor:'Taylor'}),/sealed/);
 await bad(()=>run('compare',{baseline:'Baseline',candidate:r.id}),/different case/);
 await bad(()=>db.query('update observations set latency_ms=0 where run_id=$1',[r.id]),/append-only/);
 await bad(()=>db.query('delete from reviews where evaluation_id=$1',[b.id]),/append-only/);
 await db.query("update cases set expected='{}'::jsonb where id=$1",[caseRow.id]);
 await bad(()=>run('results',{run:r.id}),/stale/);
 await bad(()=>run('review',{run:r.id,actor:'Someone else',decision:'approved',evidence:'old'}),/stale/);
 ok((await run('attention')).some(x=>x.run==='Local Run'&&x.attention.includes('stale')));
 eq((await run('runs')).find(x=>x.name==='Local Run').evidence_state,'stale');
 eq((await run('runs')).find(x=>x.name==='Baseline').evidence_state,'current');

 const imported=await run('add-run',{suite:'Support acceptance',name:'Imported','model-version':'v3',actor:'Alex','review-due':future});
 const options={run:imported.id,file:path.join(REPO_ROOT,'examples/weave-calls.jsonl'),actor:'Alex','source-ref':'Fictional export, four calls','expected-count':'4'};
 eq((await run('import',{...options,'dry-run':true},['weave'])).status,'dry run');
 eq((await db.query('select * from imports')).length,0);
 await bad(()=>run('import',{...options,'expected-count':'3'},['weave']),/count mismatch/);
 const vendorRows=fs.readFileSync(options.file,'utf8').trim().split('\n').map(JSON.parse);
 await bad(()=>run('import',{...options,file:write('invalid.json',[vendorRows[0],{...vendorRows[1],attributes:{case_key:'unknown'}}]),'expected-count':'2'},['weave']),/Unknown case/);
 eq((await run('observations',{run:imported.id})).length,0);
 await bad(()=>run('import',{...options,file:write('duplicate.json',[vendorRows[0],vendorRows[0]]),'expected-count':'2'},['weave']),/Duplicate/);
 eq((await run('import',options,['weave'])).count,4);
 eq((await run('import',options,['weave'])).status,'already imported');
 eq((await db.query('select source_record from observations where run_id=$1 order by source_id',[imported.id])).length,4);
 await run('evaluate',{run:imported.id,actor:'Alex'});
 eq((await run('results',{run:imported.id})).filter(x=>x.passed).length,4);
 const other=await run('add-run',{suite:'Support acceptance',name:'CSV import','model-version':'v4',actor:'Alex','review-due':future});
 const csvRows=vendorRows.map(x=>({...x,id:x.id+'-csv',attributes:{...x.attributes,latency_ms:undefined}}));
 const cell=v=>'"'+String(v).replaceAll('"','""')+'"';
 const csv='id,project_id,attributes,output,started_at,ended_at\r\n'+csvRows.map(x=>[x.id,x.project_id,JSON.stringify(x.attributes),JSON.stringify(x.output),x.started_at,x.ended_at].map(cell).join(',')).join('\r\n');
 await run('import',{...options,run:other.id,file:write('weave.csv',csv)},['weave']);
 eq((await run('observations',{run:other.id}))[0].latency_ms,1000);
 eq(parseCsv('\uFEFFa,b\r\n"line\nnext","a""b"')[0],{a:'line\nnext',b:'a"b'});
 assert.throws(()=>parseCsv('a,a\n1,2'),/unique/);checks++;
 const missing={cases:[{id:'x',case_key:'x',cohort:'x',assertion:'exact',expected:'ok',max_latency_ms:1}],observations:[{case_id:'x',output:'ok',latency_ms:null,exception:'failure'}]};
 ok(score(missing)[0].reason.includes('missing latency'));ok(score(missing)[0].reason.includes('exception'));
 eq(canonical({a:1,b:2}),canonical({b:2,a:1}));
 const out=await run('export',{file:path.join(tmp,'backup.json')});
 eq(Object.keys(JSON.parse(fs.readFileSync(out.file)).tables).length,10);
 await bad(()=>run('export',{file:out.file}),/EEXIST/);
 ok(fs.existsSync((await run('weekly-review')).file));
 ok(fs.existsSync((await run('draft-review',{run:'Candidate'})).file));
 eq((await run('help')).length,commands.length);
 eq([...seen].sort(),[...commands].sort());

 // Close before child processes open the same embedded database, including on Windows.
 await db.close();
 for(const script of ['scripts/view.mjs','scripts/docs.mjs']){
  const res=spawnSync(process.execPath,[script],{cwd:REPO_ROOT,env:process.env,encoding:'utf8'});eq(res.status,0);
 }
 const html=fs.readFileSync(path.join(tmp,'views/week.html'),'utf8');ok(html.includes('Evaluation review desk'));
 const escaped=page({title:'<script>',sections:[{title:'literal',html:table([{name:'<img src=x onerror=alert(1)>'}])}]});
 ok(escaped.includes('&lt;script&gt;'));ok(!escaped.includes('<img src=x'));
 for(const [args,status,match] of [
  [['help','--json'],0,/"command"/],
  [['unknown'],1,/Unknown command/],
  [['runs','--typo=1'],1,/Unknown flag/],
  [['run','--run=import'],1,/Ambiguous/],
  [['run','--run=BASELINE','--json'],0,/"Baseline"/]
 ]){const res=spawnSync(process.execPath,['scripts/evaluations.mjs',...args],{cwd:REPO_ROOT,env:process.env,encoding:'utf8'});eq(res.status,status);ok(match.test(res.stdout+res.stderr));}
 console.log(`PASS: ${checks} assertions; all ${commands.length} CLI commands; isolated ${process.env.TEST_DATABASE_URL?'PostgreSQL':'PGlite'}; import rollback, missing coverage, regression checks, stale evidence, independent review, HTML escaping and complete export.`);
}finally{
 try{await db.close();}catch{}
 fs.rmSync(tmp,{recursive:true,force:true});
}
