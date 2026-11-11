// Isolated design previews. Synthetic outcomes never enter the saved live tournament.
(function(){
 const scene=new URLSearchParams(location.search).get('preview');
 if(!['opening','round-opening','final-opening','overview','compact','qualifier','qualifier-award','final','champion-award','champion'].includes(scene))return;
 const M=RaceModel,s=M.initial();
 const target=m=>scene==='opening'||scene==='overview'?m.round===1&&m.wave===1:scene==='compact'?m.round===1&&m.wave===2:scene==='round-opening'?m.round===2&&m.wave===1:scene.startsWith('qualifier')?m.round===1&&m.wave===3:m.round===4;
 for(let n=0;n<40;n++){
  const m=M.getSchedule(s)[s.index];
  if(target(m))break;
  if(!M.isRoundStarted(s))M.startRound(s);
  M.win(s,m.lanes.findIndex(Boolean));
  if(!M.next(s))break;
 }
 let award=null;
 if(scene==='qualifier-award'||scene.startsWith('champion')){
  if(!M.isRoundStarted(s))M.startRound(s);
  const lane=M.getSchedule(s)[s.index].lanes.findIndex(Boolean);M.win(s,lane);
  if(scene.endsWith('-award'))award=lane;
 }
 if(scene.includes('opening')&&!M.isRoundStarted(s))M.startRound(s);window.ArcadePreview={state:s,award,scene,opening:scene.includes('opening')};
})();
