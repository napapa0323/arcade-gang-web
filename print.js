// Output-only sample: three separately assigned rounds, 20 entrants per round.
const printNames=['오갱','블랙잭','번아웃','터보킴','매드독','네온','고스트','제로백','스모키','와일드','크라운','오버런','드리프트','갱스터','레드존','미드나잇','스피드킹','스컬','풀스로틀','피니셔'];
const printRounds=Array.from({length:3},(_,r)=>{
  const order=Array.from({length:20},(_,i)=>printNames[(i*([1,7,9][r])+r*3)%20]);
  return Array.from({length:7},(_,g)=>{
    const members=order.slice(g*3,Math.min(g*3+3,20));
    const lanes=[null,null,null];
    members.forEach((name,j)=>{lanes[(j+r)%3]=name;});
    return lanes;
  });
});
document.querySelector('#sheet').innerHTML=`<header class="sheet-head"><div class="logo-cell"><img src="assets/wordmark.png" alt="ARCADE GANG"></div><div class="title-cell"><span>MINI 4WD / RACE SHEET</span><h1>토너먼트 대진표</h1><p>오락실 갱스터 · 오갱</p></div><div class="spec-cell"><strong>20</strong><span>RACERS / 3 ROUNDS</span></div></header><div class="sheet-meta"><b>OPEN CLASS</b><span>대회일 ______ / ______ / ______</span><span>진행 __________________</span></div>`+printRounds.map((groups,r)=>`<section class="round-block"><div class="round-index"><span>ROUND</span><strong>0${r+1}</strong><b>토너먼트 ${r+1}R</b><small>20명 · 7개 조</small></div><table class="round-table" aria-label="토너먼트 ${r+1}R 20인"><colgroup><col class="group"><col><col><col></colgroup><thead><tr><th scope="col">조</th><th scope="col"><small>LANE 01</small>1레인</th><th scope="col"><small>LANE 02</small>2레인</th><th scope="col"><small>LANE 03</small>3레인</th></tr></thead><tbody>${groups.map((lanes,g)=>`<tr><th class="group-no" scope="row">${String(g+1).padStart(2,'0')}</th>${lanes.map((name,l)=>name?`<td><span contenteditable="true" spellcheck="false" aria-label="${r+1}R ${g+1}조 ${l+1}레인 선수명">${name}</span><i aria-hidden="true"></i></td>`:'<td class="empty">—</td>').join('')}</tr>`).join('')}</tbody></table></section>`).join('')+`<footer class="sheet-foot"><b>ARCADE GANG</b><span>□ 진출자 표시 / 빈 레인은 —</span><span>SAMPLE LINEUP · 01 / 01</span></footer>`;
