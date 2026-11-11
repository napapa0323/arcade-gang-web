(() => {
 'use strict';
 if(document.body.classList.contains('audience')||window.ArcadePreview)return;
 const button=document.querySelector('#open-phone-link');if(!button)return;
 const panel=document.createElement('dialog');panel.className='phone-link-dialog';panel.setAttribute('aria-label','계측 휴대폰 연결');
 const head=document.createElement('div');head.className='phone-link-dialog-head';const title=document.createElement('strong');title.textContent='휴대폰 연결 · 패널을 닫아도 연결 유지';const close=document.createElement('button');close.type='button';close.textContent='경기로 돌아가기 ×';close.onclick=()=>panel.close();head.append(title,close);
 const iframe=document.createElement('iframe');iframe.title='계측 휴대폰 연결 설정';iframe.allow='camera';const url=new URL('phone-link.html',location.href);url.searchParams.set('embedded','1');const event=new URLSearchParams(location.search).get('event');if(event)url.searchParams.set('event',event);iframe.src=url.href;panel.append(head,iframe);document.body.append(panel);
 button.onclick=()=>{if(!panel.open)panel.showModal();};
 window.addEventListener('message',e=>{if(e.source!==iframe.contentWindow||e.origin!==location.origin||e.data?.type!=='arcade-phone-status')return;button.textContent=e.data.connected?'계측 휴대폰 연결됨 · 관리':'계측 휴대폰 연결 · '+String(e.data.text).slice(0,24);});
})();
