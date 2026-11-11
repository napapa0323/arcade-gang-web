(function(root){
 'use strict';
 const KEY='arcade-laptop-timing-v1',CONTEXTS='arcade-laptop-contexts-v1';
 function read(key,fallback){const raw=root.localStorage.getItem(key);if(!raw)return fallback;try{return JSON.parse(raw);}catch{throw Error('저장된 계측 정보를 읽지 못했습니다. 원본을 지우지 말고 백업을 확인해주세요.');}}
 function list(){const records=read(KEY,[]);if(!Array.isArray(records))throw Error('계측 기록 형식이 올바르지 않습니다.');return records;}
 function remember(context){const contexts=read(CONTEXTS,{});contexts[context.id]=context;root.localStorage.setItem(CONTEXTS,JSON.stringify(contexts));return context;}
 function context(id){return read(CONTEXTS,{})[id]??null;}
 function validate(record,ctx){if(ctx.eventId&&ctx.raceReady===false&&record?.source!=='simulation')throw Error('시작 전 또는 종료된 경기의 계측 정보입니다.');
  if(!record||typeof record.id!=='string'||!record.id||record.id.length>100||!['camera','simulation'].includes(record.source)||!['armed','running','complete','review','stopped'].includes(record.status)||!record.settings||!Number.isInteger(record.settings.laps)||record.settings.laps<1||record.settings.laps>30||!Array.isArray(record.cars)||!record.cars.length||record.cars.length>3||new Set(record.cars.map(c=>c.lane)).size!==record.cars.length)throw Error('측정 기록의 형식이 올바르지 않습니다.');
  for(const car of record.cars){if(!Number.isInteger(car.lane)||car.lane<0||car.lane>2||typeof car.name!=='string'||car.name.length>80||!Array.isArray(car.laps)||car.laps.length>record.settings.laps||car.laps.some(t=>!Number.isFinite(t)||t<0||t>86400000))throw Error('선수 또는 랩타임 정보가 올바르지 않습니다.');if(ctx.eventId&&record.source!=='simulation'&&ctx.lanes[car.lane]!==car.name)throw Error('측정 선수와 노트북의 경기 명단이 다릅니다. 기록은 휴대폰에서 보관합니다.');if(car.totalMs!==null&&(!Number.isFinite(car.totalMs)||car.totalMs<0||Math.abs(car.laps.reduce((a,b)=>a+b,0)-car.totalMs)>2||car.laps.length!==record.settings.laps))throw Error('완주 시간과 랩 기록이 일치하지 않습니다.');}
  return true;
 }
 function accept(packet,deviceId){if(packet.type!=='record'||packet.deviceId!==deviceId||!Number.isInteger(packet.rev)||packet.rev<1||packet.rev>1000000)throw Error('등록된 휴대폰의 기록이 아닙니다.');if(packet.record?.contextId!==undefined&&packet.record.contextId!==packet.contextId)throw Error('측정 기록의 경기 연결 정보가 일치하지 않습니다.');const ctx=context(packet.contextId);if(!ctx)throw Error('이 노트북에 해당 경기의 연결 정보가 없습니다. 휴대폰 기록을 내보내 보관해주세요.');validate(packet.record,ctx);const records=list(),index=records.findIndex(x=>x.deviceId===deviceId&&x.record.id===packet.record.id);if(index>=0&&records[index].rev>=packet.rev)return records[index];const item={deviceId,rev:packet.rev,context:ctx,record:packet.record,receivedAt:new Date().toISOString()};if(index<0)records.unshift(item);else records[index]=item;root.localStorage.setItem(KEY,JSON.stringify(records));return item;}
 const api={KEY,CONTEXTS,list,remember,context,validate,accept};root.ArcadeTimingRecords=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
