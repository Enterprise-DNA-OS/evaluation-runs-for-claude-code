import {getDb} from './lib/db.mjs';
import {migrate} from './migrate.mjs';
import {seed} from './seed.mjs';
import {execute} from './evaluations.mjs';
import {table} from './lib/format.mjs';
const db=await getDb();
try{
 await migrate(db);await seed(db);
 for(const name of ['Baseline','Candidate']){
  const detail=await execute(db,'run',{run:name});
  if(!detail.evaluation)await execute(db,'evaluate',{run:name,actor:'Alex Chen'});
 }
 console.log('Fictional support answers. No model calls or external messages.');
 for(const [command,opts] of [['compare',{baseline:'Baseline',candidate:'Candidate'}],['attention',{}]]){
  const rows=await execute(db,command,opts);console.log('\n'+command);
  console.log(table(rows,Object.keys(rows[0]).map(key=>({key,label:key}))));
 }
}finally{await db.close();}
