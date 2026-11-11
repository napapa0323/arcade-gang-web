(function(root){
 'use strict';
 const names=['오갱','블랙잭','번아웃','터보킴','매드독','네온','고스트','제로백','스모키','와일드','크라운','오버런','드리프트','갱스터','레드존','미드나잇','스피드킹','스컬','풀스로틀','피니셔'];
 const printed=Array.from({length:3},(_,r)=>Array.from({length:7},(_,g)=>{const lanes=[null,null,null];for(let j=0;j<3;j++){let i=g*3+j;if(i<20)lanes[(j+r)%3]=names[(i*[1,7,9][r]+r*3)%20];}return lanes;}));
 function validBracket(rounds){if(!Array.isArray(rounds)||rounds.length!==3||rounds.some(r=>!Array.isArray(r)||r.length<1||r.length>32||r.some(h=>!Array.isArray(h)||h.length!==3||!h.some(Boolean)||h.some(n=>n!==null&&(typeof n!=='string'||!n.trim()||Array.from(n).length>20)))))return false;const names=rounds[0].flat().filter(Boolean);if(names.length<3||names.length>64||new Set(names).size!==names.length)return false;return rounds.every(r=>{const all=r.flat().filter(Boolean);return all.length===names.length&&new Set(all).size===names.length&&all.every(n=>names.includes(n));});}
 const initial=(event=null)=>{const s={index:0,winners:{},history:[],startedRounds:[1],openedRounds:[]};if(event){if(!validBracket(event.rounds))throw Error('대진표를 먼저 생성해주세요.');s.printed=JSON.parse(JSON.stringify(event.rounds));s.eventId=event.id;s.eventTitle=event.title;s.bracketId=event.bracketId;}return s;};
 function groupSizes(n){if(n<=3)return[n];let threes=Math.floor(n/3),twos=0;if(n%3===1){threes--;twos=2;}else if(n%3===2)twos=1;return [...Array(threes).fill(3),...Array(twos).fill(2)];}
 function getSchedule(s){const all=[],qualified=[];
  function winner(i){const lane=s.winners[i];return Number.isInteger(lane)?all[i]?.lanes[lane]??null:null;}
  for(let r=1;r<=3;r++){
   let wave=1,previous=[];
   (s.printed??printed)[r-1].forEach((slots,g)=>{const lanes=slots.map(n=>qualified.includes(n)?null:n);if(lanes.some(Boolean)){previous.push(all.length);all.push({round:r,wave,heat:g+1,lanes,sources:[null,null,null],labels:[null,null,null]});}});
   while(previous.length>1){wave++;let offset=0;const next=[];
    groupSizes(previous.length).forEach((n,g)=>{const refs=previous.slice(offset,offset+n);offset+=n;const sources=[...refs,...Array(3-n).fill(null)];next.push(all.length);all.push({round:r,wave,heat:g+1,lanes:sources.map(i=>i===null?null:winner(i)),sources,labels:sources.map(i=>i===null?null:`${wave-1}차 ${all[i].heat}조 승자`)});});previous=next;
   }
   const q=winner(previous[0]);if(!q)return all;qualified.push(q);
  }
  all.push({round:4,wave:1,heat:1,lanes:qualified,sources:[null,null,null],labels:['1R 진출자','2R 진출자','3R 진출자']});return all;
 }
 function ready(m){return !!m&&m.lanes.some(Boolean)&&m.sources.every((source,i)=>source===null||!!m.lanes[i]);}
 function historyOf(s){return s.history??Object.keys(s.winners).map(Number).sort((a,b)=>a-b);}
 function startedRoundsOf(s){return s.startedRounds??Array.from({length:getSchedule(s)[s.index]?.round??1},(_,i)=>i+1);}
 function isRoundStarted(s,round=getSchedule(s)[s.index]?.round){return startedRoundsOf(s).includes(round);}
 function startRound(s){const m=getSchedule(s)[s.index];if(!ready(m)||isRoundStarted(s,m.round))return false;s.startedRounds=[...startedRoundsOf(s),m.round];return true;}
 function awardType(s){const all=getSchedule(s),m=all[s.index];return m.round===4?'champion':all.filter(x=>x.round===m.round).at(-1)===m?'qualifier':'heat';}
 function valid(s){
  if(!s||!Number.isInteger(s.index)||s.index<0||s.index>512||!s.winners||typeof s.winners!=='object'||Array.isArray(s.winners))return false;
  if(s.printed!==undefined&&!validBracket(s.printed))return false;
  if(s.openedRounds!==undefined&&(!Array.isArray(s.openedRounds)||new Set(s.openedRounds).size!==s.openedRounds.length||s.openedRounds.some(r=>!Number.isInteger(r)||r<1||r>4)))return false;
  const keys=Object.keys(s.winners);if(keys.some(k=>String(Number(k))!==k||!Number.isInteger(Number(k))||Number(k)<0||Number(k)>512))return false;
  const history=historyOf(s);if(!Array.isArray(history)||history.length!==keys.length||new Set(history).size!==keys.length||history.some(i=>!Number.isInteger(i)||s.winners[i]===undefined))return false;
  const replay=initial();if(s.printed)replay.printed=s.printed;
  for(const i of history){const m=getSchedule(replay)[i],lane=s.winners[i];if(!ready(m)||!Number.isInteger(lane)||lane<0||lane>2||!m.lanes[lane])return false;replay.winners[i]=lane;}
  const all=getSchedule(replay),starts=startedRoundsOf(s);if(!Array.isArray(starts)||!starts.includes(1)||starts.length!==new Set(starts).size||starts.some((r,i)=>!Number.isInteger(r)||r!==i+1||r>all.at(-1).round))return false;
  if(history.some(i=>!starts.includes(all[i]?.round)))return false;
  return ready(all[s.index]);
 }
 function win(s,lane){const m=getSchedule(s)[s.index];if(!ready(m)||!isRoundStarted(s,m.round)||!Number.isInteger(lane)||lane<0||lane>2||!m.lanes[lane]||s.winners[s.index]!==undefined)return false;s.startedRounds=startedRoundsOf(s).slice();s.history=[...historyOf(s),s.index];s.winners[s.index]=lane;return true;}
 function nextIndex(s){const all=getSchedule(s),pending=all.map((m,i)=>({m,i})).filter(x=>s.winners[x.i]===undefined);if(!pending.length)return null;const first=pending[0].m,candidates=pending.filter(x=>x.m.round===first.round&&x.m.wave===first.wave&&ready(x.m));return(candidates.find(x=>x.i>s.index)??candidates[0])?.i??null;}
 function select(s,index){const m=getSchedule(s)[index];if(!Number.isInteger(index)||!ready(m)||!isRoundStarted(s,m.round)||s.winners[index]!==undefined)return false;s.startedRounds=startedRoundsOf(s).slice();s.index=index;return true;}
 function next(s){if(s.winners[s.index]===undefined)return false;const index=nextIndex(s);if(index===null)return false;s.startedRounds=startedRoundsOf(s).slice();s.index=index;return true;}
 function undo(s){const history=historyOf(s).slice(),last=history.pop();if(last===undefined)return false;const round=getSchedule(s)[last].round;s.startedRounds=startedRoundsOf(s).filter(r=>r<=round);if(s.openedRounds)s.openedRounds=s.openedRounds.filter(r=>r<=round);delete s.winners[last];s.history=history;s.index=last;return true;}
 function shortName(name){const chars=Array.from(String(name??""));return chars.length>5?chars.slice(0,5).join("")+"...":chars.join("");}
 const api={validBracket,startedRoundsOf,isRoundStarted,startRound,awardType,shortName,printed,initial,getSchedule,ready,valid,win,next,nextIndex,select,historyOf,undo};root.RaceModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
