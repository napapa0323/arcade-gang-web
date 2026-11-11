export async function onRequest({request,env}){
 const url=new URL(request.url),origin=request.headers.get('Origin');
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
 if(origin&&origin!==url.origin)return reply({error:'같은 오갱 사이트에서 요청해주세요.'},403);
 if(!env.PAIR_ROOMS)return reply({error:'아직 연결 서버가 설정되지 않았습니다. Cloudflare Pages에 PAIR_ROOMS 바인딩을 추가한 뒤 재배포해주세요.'},503);
 if(url.pathname==='/api/link/status'&&request.method==='GET')return reply({configured:true});
 if(request.method!=='POST')return reply({error:'POST 요청만 사용할 수 있습니다.'},405);
 const headers=new Headers(request.headers);headers.set('X-Link-Client-IP',request.headers.get('CF-Connecting-IP')??'unknown');
 try{const target=env.PAIR_ROOMS.getByName?env.PAIR_ROOMS.getByName('arcade-short-codes-v1'):env.PAIR_ROOMS.get(env.PAIR_ROOMS.idFromName('arcade-short-codes-v1'));return await target.fetch(new Request(request,{headers}));}
 catch{return reply({error:'연결 서버에 접근하지 못했습니다. 바인딩을 확인하고 다시 시도해주세요.'},503);}
}
