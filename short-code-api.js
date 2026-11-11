(() => {
 'use strict';
 window.ArcadeShortCode={async request(action,payload){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch('/api/link/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal,cache:'no-store'});
   if(!response.headers.get('content-type')?.includes('application/json'))throw Error('연결 API가 배포되지 않았습니다. 오갱 사이트의 최신 배포를 확인해주세요.');
   const data=await response.json();if(!response.ok)throw Error(data.error||'연결 요청을 처리하지 못했습니다.');
   if(action==='answers'&&(!/^\d{6}$/.test(data.code)||!Number.isFinite(data.expiresAt)))throw Error('연결 서버의 응답이 올바르지 않습니다.');
   if(action==='consume'&&typeof data.answer!=='string')throw Error('연결 응답을 받지 못했습니다.');return data;
  }catch(e){if(e.name==='AbortError')throw Error('연결 서버 응답이 늦습니다. 잠시 후 다시 시도해주세요.');if(e instanceof TypeError)throw Error('연결 서버에 접속하지 못했습니다. 인터넷 연결을 확인해주세요.');throw e;}finally{clearTimeout(timer);}
 }};
})();
