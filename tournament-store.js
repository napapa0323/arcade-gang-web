(function(root){
 'use strict';
 const KEY='arcade-gang-tournaments-v1';
 function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function cleanName(value){return String(value??'').normalize('NFC').trim().replace(/\s+/g,' ');}
 function storage(){if(!root.localStorage)throw Error('이 브라우저에서는 저장할 수 없습니다. 일반 브라우저 창으로 열어주세요.');return root.localStorage;}
 function read(){const raw=storage().getItem(KEY);if(!raw)return{activeId:null,events:[]};let data;try{data=JSON.parse(raw);}catch{throw Error('저장된 대회 정보를 읽지 못했습니다. 기존 데이터를 지우지 말고 관리자에게 문의해주세요.');}if(!data||!Array.isArray(data.events))throw Error('저장된 대회 정보의 형식이 올바르지 않습니다.');return data;}
 function write(data){try{storage().setItem(KEY,JSON.stringify(data));}catch{throw Error('기기에 저장하지 못했습니다. 저장 공간과 브라우저 설정을 확인해주세요.');}}
 function id(){return root.crypto?.randomUUID?.()??Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
 function list(){return read().events.slice().reverse();}
 function getEvent(eventId){return read().events.find(e=>e.id===eventId)??null;}
 function active(){const data=read();return data.events.find(e=>e.id===data.activeId)??null;}
 function activate(eventId){const data=read();if(!data.events.some(e=>e.id===eventId))throw Error('대회를 찾을 수 없습니다.');data.activeId=eventId;write(data);return getEvent(eventId);}
 function save(event){const data=read(),i=data.events.findIndex(e=>e.id===event.id);event.updatedAt=Date.now();if(i<0)data.events.push(event);else data.events[i]=event;data.activeId=event.id;write(data);return event;}
 function create({title,date,raceClass}){title=cleanName(title);if(!title||Array.from(title).length>40)throw Error('대회 이름은 1~40글자로 입력해주세요.');if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('대회 날짜를 선택해주세요.');return save({id:id(),title,date,raceClass:cleanName(raceClass)||'OPEN CLASS',players:[],rounds:null,bracketId:null,createdAt:Date.now()});}
 function raceKey(event){return event?.bracketId?`arcade-gang-race:${event.id}:${event.bracketId}`:'arcade-gang-live-v2';}
 function raceState(event){const raw=storage().getItem(raceKey(event));if(!raw)return null;try{return JSON.parse(raw);}catch{throw Error('저장된 경기 결과를 읽지 못했습니다.');}}
 function hasResults(event){return Object.keys(raceState(event)?.winners??{}).length>0;}
 function checkRosterEdit(event){if(hasResults(event))throw Error('경기 결과가 있는 대회의 명단은 바꿀 수 없습니다. 새 대회를 만들어주세요.');}
 function validateName(name,existing=[]){name=cleanName(name);if(!name||Array.from(name).length>20)throw Error('선수 이름은 1~20글자로 입력해주세요.');if(existing.some(p=>cleanName(p.name??p).toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error(`‘${name}’은 이미 등록되어 있습니다. 구분할 수 있는 별칭을 입력해주세요.`);return name;}
 function addPlayers(eventId,names){const event=getEvent(eventId);if(!event)throw Error('대회를 먼저 만들어주세요.');checkRosterEdit(event);if(event.players.length+names.length>64)throw Error('현재 대회는 최대 64명까지 접수할 수 있습니다.');const next=event.players.slice();for(const value of names){const name=validateName(value,next);next.push({id:id(),name,registeredAt:Date.now()});}event.players=next;event.rounds=null;event.bracketId=null;return save(event);}
 function removePlayer(eventId,playerId){const event=getEvent(eventId);if(!event)throw Error('대회를 찾을 수 없습니다.');checkRosterEdit(event);event.players=event.players.filter(p=>p.id!==playerId);event.rounds=null;event.bracketId=null;return save(event);}
 function random(){if(root.crypto?.getRandomValues){const a=new Uint32Array(1);root.crypto.getRandomValues(a);return a[0]/4294967296;}return Math.random();}
 function shuffle(values,rng=random){const a=values.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function buildRounds(names,rng=random){
  if(names.length<3||names.length>64)throw Error('대진표는 3~64명으로 생성할 수 있습니다.');
  const unique=[];for(const n of names)unique.push(validateName(n,unique));
  const base=shuffle(unique,rng),pairs=new Map(),rounds=[];
  for(let r=0;r<3;r++){
   let best=null,bestScore=Infinity;
   for(let attempt=0;attempt<50;attempt++){
    const buckets=[[],[],[]];base.forEach((name,i)=>buckets[(i+r)%3].push(name));buckets.forEach((b,i)=>buckets[i]=shuffle(b,rng));
    let heats=Array.from({length:Math.max(...buckets.map(b=>b.length))},(_,g)=>buckets.map(b=>b[g]??null));
    const single=heats.find(h=>h.filter(Boolean).length===1);
    if(single){const donor=heats.find(h=>h.filter(Boolean).length===3);if(donor){const lane=single.findIndex(n=>!n);single[lane]=donor[lane];donor[lane]=null;}}
    heats=shuffle(heats,rng);let score=0;
    for(const h of heats){const p=h.filter(Boolean);for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)score+=pairs.get(JSON.stringify([p[i],p[j]].sort()))??0;}
    if(score<bestScore){bestScore=score;best=heats;if(!score)break;}
   }
   rounds.push(best);for(const h of best){const p=h.filter(Boolean);for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){const key=JSON.stringify([p[i],p[j]].sort());pairs.set(key,(pairs.get(key)??0)+1);}}
  }
  return rounds;
 }
 function generate(eventId){const event=getEvent(eventId);if(!event)throw Error('대회를 찾을 수 없습니다.');checkRosterEdit(event);event.rounds=buildRounds(event.players.map(p=>p.name));event.bracketId=id();return save(event);}
 const api={KEY,escapeHTML,cleanName,list,getEvent,active,activate,save,create,raceKey,raceState,hasResults,addPlayers,removePlayer,validateName,buildRounds,generate};root.TournamentStore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
