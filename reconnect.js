(() => {
 'use strict';
 const prefix='arcade-remembered-link-v1-';
 window.ArcadeReconnect={setup(role,handlers){
  let saved=null,busy=false,halted=false,pendingOffer=null,offerAt=0,lastPhoneOffer=null,lastPhoneAt=0,epoch=0;
  const key=prefix+role;
  function valid(v){return v&&typeof v.sessionId==='string'&&/^[-\w]{32,100}$/.test(v.sessionId)&&typeof v.token==='string'&&/^[-\w]{60,160}$/.test(v.token)&&typeof v.deviceId==='string'&&v.expiresAt>Date.now();}
  try{const v=JSON.parse(localStorage.getItem(key));if(valid(v))saved=v;}catch{}
  function remember(v){if(!valid(v))return false;epoch++;saved=v;pendingOffer=null;lastPhoneOffer=null;try{localStorage.setItem(key,JSON.stringify(v));}catch{handlers.status('기기 기억 저장 실패 · 창을 닫으면 QR로 다시 연결해주세요.');}return true;}
  async function request(data,credential=saved){return ArcadeShortCode.request('reconnect',{sessionId:credential.sessionId,token:credential.token,...data});}
  function forget(){const old=saved;epoch++;saved=null;pendingOffer=null;lastPhoneOffer=null;try{localStorage.removeItem(key);}catch{}if(old)request({op:'revoke'},old).catch(()=>{});}
  async function tick(){if(halted||busy||!saved||handlers.connected()||document.hidden)return;if(!valid(saved)){forget();handlers.status('기기 등록 유효시간이 지났습니다. QR로 다시 연결해주세요.');return;}
   busy=true;const mine=epoch;try{
    handlers.status('기억한 기기로 재연결 중 · 노트북 연결 창을 열어두세요.');
    if(role==='laptop'){
     if(!pendingOffer||Date.now()-offerAt>60000){const offer=await handlers.offer();if(mine!==epoch||halted)return;pendingOffer=offer;offerAt=Date.now();await request({op:'publish',offer});}
     const data=await request({op:'take'});if(mine!==epoch||halted)return;if(data.answer)await handlers.accept(data.answer);
    }else{
     const data=await request({op:'read'});if(mine!==epoch||halted)return;
     if(data.offer&&(data.offer!==lastPhoneOffer||Date.now()-lastPhoneAt>45000)){
      const answer=await handlers.answer(data.offer);if(mine!==epoch||halted)return;await request({op:'answer',offer:data.offer,answer});lastPhoneOffer=data.offer;lastPhoneAt=Date.now();
     }
    }
   }catch(e){if(mine===epoch&&!halted)handlers.status('재연결 대기 · '+e.message);}finally{busy=false;}
  }
  const timer=setInterval(tick,4000);window.addEventListener('online',tick);window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();else tick();});window.addEventListener('pagehide',()=>{halted=true;clearInterval(timer);});
  return {get credential(){return saved;},remember,forget,tick,paired(){pendingOffer=null;lastPhoneOffer=null;},retry(){pendingOffer=null;lastPhoneOffer=null;tick();}};
 }};
})();
