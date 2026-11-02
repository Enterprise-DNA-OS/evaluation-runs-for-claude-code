#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
import {canonical,hash,snapshot,score,latest,currentEvaluation,attention} from './lib/evaluate.mjs';

export const commands=['help','projects','suites','cases','runs','run','observations','score','evaluate','results','compare','cohorts','failures','attention','compliance','reviews','actions','add-project','add-suite','add-case','add-run','record','review','add-action','close-action','log','history','import','export','weekly-review','draft-review'];
const writes=new Set(['evaluate','add-project','add-suite','add-case','add-run','record','review','add-action','close-action','log','import']);
const tables=['projects','suites','cases','runs','imports','observations','evaluations','reviews','actions','notes'];
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error('Required --'+k);return o[k].trim();};
const day=(v)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error('Expected a valid YYYY-MM-DD date');return v;};
const integer=(v,min=0)=>{if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v))||Number(v)<min||Number(v)>2147483647)throw Error('Expected an integer >= '+min);return Number(v);};
const json=(s)=>{try{return JSON.parse(s);}catch{throw Error('Invalid JSON value');}};
const actor=o=>required(o,'actor');
const fileJson=o=>json(fs.readFileSync(path.resolve(required(o,'file')),'utf8'));
const cleanName=s=>s.trim().toLowerCase();
const isObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export async function resolve(db,tableName,value,where='',params=[]){
 if(!tables.includes(tableName))throw Error('Unknown record type');
 const rows=await db.query(`select * from ${tableName}${where?' where '+where:''} order by id`,params);
 const v=String(value||'').trim().toLowerCase();if(!v)throw Error('A record name or ID is required');
 const name=r=>String(r.name??r.case_key??r.title??'').toLowerCase();
 let hit=rows.filter(r=>r.id.toLowerCase()===v||name(r)===v);
 if(!hit.length)hit=rows.filter(r=>r.id.toLowerCase().startsWith(v)||name(r).includes(v));
 if(hit.length!==1)throw Error(`${hit.length?'Ambiguous':'No matching'} ${tableName}: ${value}\n`+(hit.length?hit:rows).map(r=>`${r.id}  ${r.name??r.case_key??r.title??''}${r.version?' / '+r.version:''}`).join('\n'));
 return hit[0];
}
const runFor=(db,o,key='run')=>resolve(db,'runs',required(o,key));
const suiteFor=(db,o)=>resolve(db,'suites',required(o,'suite'));
async function insert(db,t,record){const keys=Object.keys(record);const vals=keys.map(k=>record[k]);return (await db.query(`insert into ${t} (${keys.join(',')}) values (${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,vals))[0];}
const j=v=>JSON.stringify(v);
function writeNew(file,body){fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,body,{flag:'wx',mode:0o600});return {file};}
function display(rows){if(!Array.isArray(rows))return JSON.stringify(rows,null,2);if(!rows.length)return '(none)';return table(rows,Object.keys(rows[0]).map(key=>({key,label:key,format:v=>v!==null&&typeof v==='object'?JSON.stringify(v):v,width:100})));}

export async function execute(db,command,o={},positionals=[]){
 if(!commands.includes(command))throw Error('Unknown command: '+command);
 await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ');
 try{
  if(writes.has(command))await db.exec('LOCK TABLE '+tables.join(',')+' IN SHARE ROW EXCLUSIVE MODE');
  const result=await dispatch(db,command,o,positionals);await db.exec('COMMIT');return result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}

async function dispatch(db,cmd,o,pos){
 if(cmd==='help')return commands.map(command=>({command,usage:usages[command]||''}));
 if(cmd==='projects')return db.query('select id,name,owner,purpose,access_review_due,retention_review_due from projects order by name');
 if(cmd==='suites')return db.query('select s.id,s.name,s.version,p.name project,s.review_due from suites s join projects p on p.id=s.project_id order by s.name,s.version');
 if(cmd==='cases'){const s=await suiteFor(db,o);return db.query('select id,case_key,cohort,input,expected,assertion,max_latency_ms from cases where suite_id=$1 order by case_key',[s.id]);}
 if(cmd==='runs')return db.query('select * from run_summary order by name');
 if(cmd==='run'){const r=await runFor(db,o);return {run:r,evaluation:await latest(db,r),notes:await db.query('select actor,body,created_at from notes where run_id=$1 order by created_at,id',[r.id])};}
 if(cmd==='observations'){const r=await runFor(db,o);return db.query('select c.case_key,o.output,o.latency_ms,o.exception,o.source_id,o.actor from observations o join cases c on c.id=o.case_id where run_id=$1 order by c.case_key',[r.id]);}
 if(cmd==='score'||cmd==='evaluate'){
  const r=await runFor(db,o);const snap=await snapshot(db,r);const results=score(snap);
  if(cmd==='score')return results;
  const a=actor(o);const passed=results.filter(x=>x.passed).length;
  return insert(db,'evaluations',{run_id:r.id,actor:a,fingerprint:hash(snap),snapshot:j(snap),results:j(results),total:results.length,passed,failed:results.length-passed});
 }
 if(['results','failures','cohorts'].includes(cmd)){
  const e=await currentEvaluation(db,await runFor(db,o));
  if(cmd==='results')return e.results;
  if(cmd==='failures')return e.results.filter(r=>!r.passed);
  const groups=new Map();for(const r of e.results){const g=groups.get(r.cohort)||{cohort:r.cohort,total:0,passed:0,failed:0};g.total++;g[r.passed?'passed':'failed']++;groups.set(r.cohort,g);}return [...groups.values()].sort((a,b)=>a.cohort.localeCompare(b.cohort));
 }
 if(cmd==='compare'){
  const b=await currentEvaluation(db,await runFor(db,o,'baseline'));const c=await currentEvaluation(db,await runFor(db,o,'candidate'));
  if(canonical(b.snapshot.cases)!==canonical(c.snapshot.cases))throw Error('Cannot compare different case definitions or suites');
  return c.results.map(r=>{const old=b.results.find(x=>x.case_key===r.case_key);return {case_key:r.case_key,cohort:r.cohort,baseline:old.passed?'pass':'fail',candidate:r.passed?'pass':'fail',change:old.passed&&!r.passed?'regression':!old.passed&&r.passed?'improved':'unchanged',reason:r.reason};});
 }
 if(cmd==='attention')return attention(db);
 if(cmd==='compliance')return db.query('select * from control_checks order by status desc,record,rule');
 if(cmd==='reviews'){const r=await runFor(db,o);return db.query('select v.id,v.evaluation_id,v.actor,v.decision,v.evidence,v.created_at from reviews v join evaluations e on e.id=v.evaluation_id where e.run_id=$1 order by v.created_at,v.id',[r.id]);}
 if(cmd==='actions')return db.query('select * from action_queue order by due,id');
 if(cmd==='add-project')return insert(db,'projects',{name:required(o,'name'),owner:required(o,'owner'),purpose:required(o,'purpose'),access_review_due:day(required(o,'access-review-due')),retention_review_due:day(required(o,'retention-review-due'))});
 if(cmd==='add-suite'){const p=await resolve(db,'projects',required(o,'project'));return insert(db,'suites',{project_id:p.id,name:required(o,'name'),version:required(o,'version'),review_due:day(required(o,'review-due'))});}
 if(cmd==='add-case'){
  const s=await suiteFor(db,o);const data=fileJson(o);
  if(!isObject(data)||!Object.hasOwn(data,'input')||!Object.hasOwn(data,'expected'))throw Error('Case file needs input and expected');
  const assertion=required(data,'assertion');if(!['exact','contains','valid-json'].includes(assertion))throw Error('Unknown assertion');
  if(assertion==='contains'&&(typeof data.expected!=='string'||!data.expected.length))throw Error('contains requires a nonempty string expected value');
  return insert(db,'cases',{suite_id:s.id,case_key:required(data,'case_key'),cohort:required(data,'cohort'),input:j(data.input),expected:j(data.expected),assertion,max_latency_ms:data.max_latency_ms==null?null:integer(data.max_latency_ms,1)});
 }
 if(cmd==='add-run'){const s=await suiteFor(db,o);return insert(db,'runs',{suite_id:s.id,name:required(o,'name'),model_version:required(o,'model-version'),producer:actor(o),review_due:day(required(o,'review-due'))});}
 if(cmd==='record'){
  const r=await runFor(db,o);const c=await resolve(db,'cases',required(o,'case'),'suite_id=$1',[r.suite_id]);
  if(await latest(db,r))throw Error('Evaluated runs are sealed: create a new run');
  const d=fileJson(o);if(!isObject(d)||!Object.hasOwn(d,'output'))throw Error('Observation file needs output');
  return insert(db,'observations',{suite_id:r.suite_id,run_id:r.id,case_id:c.id,output:j(d.output),latency_ms:d.latency_ms==null?null:integer(d.latency_ms),exception:d.exception==null?null:String(d.exception),actor:actor(o)});
 }
 if(cmd==='review'){
  const r=await runFor(db,o);const e=await currentEvaluation(db,r);const a=actor(o);const decision=required(o,'decision');
  if(!['approved','rejected'].includes(decision))throw Error('Decision must be approved or rejected');
  if(decision==='approved'){
   if(e.failed)throw Error('Cannot approve failed or incomplete checks');
   const authors=[e.actor,r.producer,...(await db.query('select actor from observations where run_id=$1',[r.id])).map(x=>x.actor)].map(cleanName);
   if(authors.includes(cleanName(a)))throw Error('Approval requires a different actual reviewer');
   if((await db.query("select id from actions where run_id=$1 and status='open'",[r.id])).length)throw Error('Open actions must be resolved before approval');
  }
  return insert(db,'reviews',{evaluation_id:e.id,actor:a,decision,evidence:required(o,'evidence')});
 }
 if(cmd==='add-action'){const r=await runFor(db,o);return insert(db,'actions',{run_id:r.id,title:required(o,'title'),owner:required(o,'owner'),due:day(required(o,'due'))});}
 if(cmd==='close-action'){const a=await resolve(db,'actions',required(o,'action'));if(a.status==='closed')throw Error('Action is already closed');return (await db.query("update actions set status='closed',resolution=$1 where id=$2 returning *",[actor(o)+': '+required(o,'evidence'),a.id]))[0];}
 if(cmd==='log'){const r=await runFor(db,o);return insert(db,'notes',{run_id:r.id,actor:actor(o),body:required(o,'text')});}
 if(cmd==='history'){const r=await runFor(db,o);return db.query('select actor,body,created_at from notes where run_id=$1 order by created_at,id',[r.id]);}
 if(cmd==='import'){if(pos[0]!=='weave')throw Error('Use import weave');return importWeave(db,o);}
 if(cmd==='export'){
  const data={format:'evaluation-runs-v1',exported_at:new Date().toISOString(),tables:{}};
  for(const t of tables)data.tables[t]=await db.query('select * from '+t+' order by id');
  return writeNew(path.resolve(required(o,'file')),j(data)+'\n');
 }
 if(cmd==='weekly-review'||cmd==='draft-review'){
  let sections;
  if(cmd==='weekly-review')sections=[['Run attention',await attention(db)],['Open actions',await db.query("select * from action_queue where status='open' order by due,id")],['Control checks',await db.query('select * from control_checks order by record,rule')]];
  else {const r=await runFor(db,o);const e=await currentEvaluation(db,r);sections=[['Evaluation',{run:r.name,model:r.model_version,evaluation:e.id,passed:e.passed,failed:e.failed}],['Case outcomes',e.results],['Review history',await db.query('select actor,decision,evidence from reviews where evaluation_id=$1 order by created_at,id',[e.id])]];}
  const body='# '+(cmd==='weekly-review'?'Weekly evaluation review':'Evaluation decision packet')+'\n\nDraft for human review. No release or message has been sent.\n'+sections.map(([title,rows])=>'\n## '+title+'\n\n```text\n'+display(rows)+'\n```\n').join('');
  return writeNew(path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',cmd+'-'+randomUUID()+'.md'),body);
 }
 throw Error('Command not implemented');
}

const defaultMap={case_key:'attributes.case_key',output:'output',id:'id',project:'project_id',latency_ms:'attributes.latency_ms',exception:'exception'};
function getField(row,key){if(Object.hasOwn(row,key))return row[key];return key.split('.').reduce((v,k)=>v&&Object.hasOwn(v,k)?v[k]:undefined,row);}
async function importWeave(db,o){
 const r=await runFor(db,o);const a=actor(o);const source=required(o,'source-ref');const count=integer(required(o,'expected-count'),1);
 const bytes=fs.readFileSync(path.resolve(required(o,'file')));const fileHash=hash(bytes.toString('utf8'));
 const map=o.map?json(fs.readFileSync(path.resolve(o.map),'utf8')):defaultMap;
 if(!isObject(map)||['case_key','output','id','project'].some(k=>typeof map[k]!=='string'||!map[k]))throw Error('Mapping needs case_key, output, id and project paths');
 for(const [k,v] of Object.entries(map))if(!Object.hasOwn(defaultMap,k)||typeof v!=='string'||!v)throw Error('Unsupported mapping field: '+k);
 const existing=(await db.query('select * from imports where run_id=$1 and file_hash=$2',[r.id,fileHash]))[0];
 if(existing){if(existing.expected_count!==count||canonical(existing.mapping)!==canonical(map))throw Error('Existing import has different count or mapping');return {status:'already imported',count:existing.actual_count,file_hash:fileHash};}
 if(await latest(db,r))throw Error('Evaluated runs are sealed: create a new run');
 const text=bytes.toString('utf8').replace(/^\uFEFF/,'').trim();
 let rows;
 if(o.file.toLowerCase().endsWith('.csv')){
  rows=parseCsv(text).map(row=>{
   for(const field of ['inputs','output','attributes','summary'])if(Object.hasOwn(row,field)&&row[field]!=='')row[field]=json(row[field]);
   if(map.output!=='output'&&Object.hasOwn(row,map.output))row[map.output]=json(row[map.output]);
   return row;
  });
 }else rows=text.startsWith('[')?json(text):text.split(/\r?\n/).filter(x=>x.trim()).map(json);
 if(!Array.isArray(rows)||rows.length!==count)throw Error('Source count mismatch: expected '+count+', found '+(rows?.length??0));
 const cases=await db.query('select * from cases where suite_id=$1',[r.suite_id]);const mapped=[];const keys=new Set();const ids=new Set();let sourceProject;
 for(const row of rows){
  if(!isObject(row))throw Error('Each call must be an object');
  const key=getField(row,map.case_key),id=getField(row,map.id),project=getField(row,map.project),output=getField(row,map.output);
  if(typeof key!=='string'||typeof id!=='string'||!id.trim()||typeof project!=='string'||!project.trim()||output===undefined)throw Error('Missing case key, source ID, source project or output');
  const c=cases.find(c=>c.case_key===key);if(!c)throw Error('Unknown case key: '+key);
  if(keys.has(key)||ids.has(id))throw Error('Duplicate case key or source ID in import');keys.add(key);ids.add(id);
  if(sourceProject&&sourceProject!==project)throw Error('Mixed source projects');sourceProject=project;
  if((await db.query('select id from observations where (run_id=$1 and case_id=$2) or (source_project=$3 and source_id=$4)',[r.id,c.id,project,id])).length)throw Error('Observation or source call already exists');
  let latency=map.latency_ms?getField(row,map.latency_ms):undefined;
  if(latency===undefined||latency===null||latency===''){
   if(row.started_at&&row.ended_at){const start=Date.parse(row.started_at),end=Date.parse(row.ended_at);if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)throw Error('Invalid call timestamps');latency=integer(end-start);}else latency=null;
  }else latency=integer(latency);
  const exception=map.exception?getField(row,map.exception):null;
  mapped.push({suite_id:r.suite_id,run_id:r.id,case_id:c.id,output:j(output),latency_ms:latency,exception:exception==null||exception===''?null:String(exception),source_project:project,source_id:id,source_record:j(row),actor:a});
 }
 if(o['dry-run'])return {status:'dry run',count:mapped.length,file_hash:fileHash,source_project:sourceProject};
 const batch=await insert(db,'imports',{run_id:r.id,file_hash:fileHash,mapping:j(map),source_ref:source,actor:a,expected_count:count,actual_count:rows.length});
 for(const record of mapped)await insert(db,'observations',{...record,import_id:batch.id});
 return {status:'imported',count:mapped.length,file_hash:fileHash,source_project:sourceProject};
}

export const usages={cases:'--suite=<name-or-id>',run:'--run=<name-or-id>',observations:'--run=<run>',score:'--run=<run>',evaluate:'--run=<run> --actor=<actual-name>',results:'--run=<run>',compare:'--baseline=<run> --candidate=<run>',cohorts:'--run=<run>',failures:'--run=<run>',reviews:'--run=<run>',history:'--run=<run>',
 'add-project':'--name= --owner= --purpose= --access-review-due=YYYY-MM-DD --retention-review-due=YYYY-MM-DD',
 'add-suite':'--project= --name= --version= --review-due=YYYY-MM-DD',
 'add-case':'--suite= --file=<case.json>',
 'add-run':'--suite= --name= --model-version= --actor= --review-due=YYYY-MM-DD',
 record:'--run= --case= --file=<observation.json> --actor=',
 review:'--run= --decision=approved|rejected --actor= --evidence=',
 'add-action':'--run= --title= --owner= --due=YYYY-MM-DD',
 'close-action':'--action= --actor= --evidence=',log:'--run= --actor= --text=',
 import:'weave --run= --file=<calls.jsonl|json|csv> --expected-count=N --source-ref= --actor= [--map=mapping.json] [--dry-run]',
 export:'--file=<new-file.json>', 'draft-review':'--run=<run>'};
function parse(args){const opts={},pos=[];for(let i=0;i<args.length;i++){const a=args[i];if(!a.startsWith('--')){pos.push(a);continue;}const eq=a.indexOf('=');const key=a.slice(2,eq<0?undefined:eq);if(Object.hasOwn(opts,key))throw Error('Duplicate flag: '+key);if(eq>=0)opts[key]=a.slice(eq+1);else if(['json','dry-run'].includes(key))opts[key]=true;else{if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing value for --'+key);opts[key]=args[++i];}}
 const cmd=pos.shift()||'help';const allowed=new Set(['json',...(usages[cmd]||'').matchAll(/--([a-z-]+)/g)].map(v=>Array.isArray(v)?v[1]:v));
 for(const key of Object.keys(opts))if(!allowed.has(key))throw Error('Unknown flag: --'+key);
 if(pos.length>(cmd==='import'?1:0))throw Error('Unexpected positional arguments');return {cmd,opts,pos};}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const {cmd,opts,pos}=parse(process.argv.slice(2));db=await getDb();const out=await execute(db,cmd,opts,pos);console.log(opts.json?JSON.stringify(out,null,2):display(out));}catch(e){console.error('evaluations: '+e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
