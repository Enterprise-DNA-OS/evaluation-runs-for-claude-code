import {createHash} from 'node:crypto';
export function canonical(v){
 if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
 if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
 return JSON.stringify(v);
}
export const hash=v=>createHash('sha256').update(typeof v==='string'?v:canonical(v)).digest('hex');
export async function snapshot(db,run){
 const cases=await db.query('select id,case_key,cohort,input,expected,assertion,max_latency_ms from cases where suite_id=$1 order by case_key',[run.suite_id]);
 const observations=await db.query('select case_id,output,latency_ms,exception from observations where run_id=$1 order by case_id',[run.id]);
 return {suite_id:run.suite_id,model_version:run.model_version,cases,observations};
}
export function score(snap){
 if(!snap.cases.length)throw Error('Cannot evaluate an empty suite');
 const observations=new Map(snap.observations.map(o=>[o.case_id,o]));
 return snap.cases.map(c=>{
  const o=observations.get(c.id);let reasons=[];
  if(!o)reasons.push('missing answer');
  else{
   if(o.exception)reasons.push('recorded exception');
   let matched=false;
   if(c.assertion==='exact')matched=canonical(o.output)===canonical(c.expected);
   if(c.assertion==='contains')matched=typeof o.output==='string'&&typeof c.expected==='string'&&o.output.includes(c.expected);
   if(c.assertion==='valid-json'){
    if(typeof o.output==='string'){try{JSON.parse(o.output);matched=true;}catch{}}
    else matched=o.output!==null&&typeof o.output==='object';
   }
   if(!matched)reasons.push(c.assertion+' failed');
   if(c.max_latency_ms!==null&&(o.latency_ms===null||o.latency_ms>c.max_latency_ms))reasons.push(o.latency_ms===null?'missing latency':'latency exceeded');
  }
  return {case_key:c.case_key,cohort:c.cohort,passed:reasons.length===0,reason:reasons.join('; ')||'passed',latency_ms:o?.latency_ms??null,limit_ms:c.max_latency_ms};
 });
}
export async function latest(db,run){return (await db.query('select * from evaluations where run_id=$1 order by created_at desc,id desc limit 1',[run.id]))[0]||null;}
export async function currentEvaluation(db,run){const e=await latest(db,run);if(!e)throw Error('Run has no saved evaluation: evaluate it first');if(e.fingerprint!==hash(await snapshot(db,run)))throw Error('Saved evaluation is stale: evaluate again');return e;}
export async function attention(db){
 const summaries=await db.query('select * from run_summary order by review_due,name');const rows=[];
 for(const s of summaries){
  const run=(await db.query('select * from runs where id=$1',[s.id]))[0];
  const e=await latest(db,run);const stale=e?e.fingerprint!==hash(await snapshot(db,run)):false;
  const reasons=[];
  if(!e)reasons.push('not evaluated');else if(stale)reasons.push('stale evaluation');
  if(s.observed_cases<s.expected_cases)reasons.push('missing answers');
  if(e?.failed)reasons.push('failed checks');
  if(s.decision!=='approved')reasons.push(s.decision);
  if(s.review_due<new Date().toISOString().slice(0,10)&&s.decision!=='approved')reasons.push('review overdue');
  if(reasons.length)rows.push({run:s.name,model:s.model_version,received:s.observed_cases,expected:s.expected_cases,passed:e?.passed??null,failed:e?.failed??null,attention:reasons.join('; ')});
 }
 return rows;
}
