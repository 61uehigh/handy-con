const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0));
function angle(a,b,c){
 const u=[a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0)];
 const v=[c.x-b.x,c.y-b.y,(c.z??0)-(b.z??0)];
 const length=Math.hypot(...u)*Math.hypot(...v);
 if(length<1e-8)return 0;
 return Math.acos(Math.max(-1,Math.min(1,u.reduce((sum,x,i)=>sum+x*v[i],0)/length)))*180/Math.PI;
}
export function classify(p){
 if(!p||p.length!==21)return {shape:'none'};
 const scale=dist(p[0],p[9]);if(scale<.015)return {shape:'none'};
 const joints=[[5,6,7,8],[9,10,11,12],[13,14,15,16],[17,18,19,20]];
 const angles=joints.map(([mcp,pip,dip,tip])=>Math.min(angle(p[mcp],p[pip],p[dip]),angle(p[pip],p[dip],p[tip])));
 const radial=joints.map(([,pip,,tip])=>dist(p[tip],p[0])/Math.max(dist(p[pip],p[0]),.001));
 const fingers=joints.map(([mcp,pip,dip,tip],i)=>angle(p[mcp],p[pip],p[dip])>=140 && angle(p[pip],p[dip],p[tip])>=130 && radial[i]>1.02);
 const closed=angles.map((value,i)=>value<130 || radial[i]<.98);
 const info={fingers,angles,ratios:radial};
 const thumbStraight=angle(p[2],p[3],p[4])>=140;
 const thumbAway=dist(p[4],p[5])>.55*scale;
 const pinched=dist(p[4],p[8])<.35*scale;
 if(pinched&&fingers.slice(1).every(Boolean)&&!fingers[0])return {shape:'okay',...info};
 if(fingers.every(Boolean))return {shape:'open',...info};
 if(fingers[0]&&fingers[3]&&closed[1]&&closed[2])return {shape:'horns',...info};
 if(fingers[0]&&fingers[1]&&closed[2]&&closed[3])return {shape:'victory',...info};
 if(fingers[0]&&closed.slice(1).every(Boolean))return {shape:'index',...info};
 const thumbUp=p[2].y-p[4].y;
 const thumbSide=Math.abs(p[4].x-p[2].x);
 if(closed.every(Boolean)&&thumbStraight&&thumbUp>.35*scale&&thumbUp>thumbSide*1.2&&thumbAway)return {shape:'thumbsUp',...info};
 // Keep fist as a diagnostic shape, without assigning it a command.
 if(closed.every(Boolean))return {shape:'fist',...info};
 return {shape:'none',...info};
}
export class GestureGate{
 constructor(){this.reset();}
 reset(){this.candidate='';this.since=0;this.locked=false;this.releaseSince=null;}
 update(p,now,worldLandmarks=null,prediction=null,handedness=null){
 let g=p?classify(worldLandmarks||p):{shape:'none'};
 if(p&&worldLandmarks&&['none','fist'].includes(g.shape)){
  const imagePose=classify(p);
  if(['okay','horns'].includes(imagePose.shape))g=imagePose;
 }
 if(p && prediction){
  const shapes={Open_Palm:'open',Thumb_Up:'thumbsUp',Victory:'victory',Pointing_Up:'index',Closed_Fist:'fist'};
  const learned=prediction.score>=.6?shapes[prediction.categoryName]:null;
  // Canned categories omit these two poses, so geometry must take priority.
  if(!['okay','horns'].includes(g.shape))g={...g,shape:learned||g.shape};
 }
 if(this.locked){
 if(g.shape==='none'||g.shape==='fist'){this.releaseSince??=now;const releaseMs=g.shape==='fist'?250:450;if(now-this.releaseSince>=releaseMs){this.locked=false;this.candidate='';}}
 else this.releaseSince=null;
 return {shape:g.shape,locked:this.locked,progress:0};
 }
 let command=null;
 let candidate=({thumbsUp:'playPause',index:'back',victory:'forward',horns:'fullscreenToggle',okay:'captions'})[g.shape]||'';
 const side=handedness?.score>=.75?handedness.categoryName:null;
 if(candidate!==this.candidate){this.candidate=candidate;this.since=now;}
 const progress=candidate?Math.min(1,(now-this.since)/250):0;
 if(!command && progress===1)command=candidate;
 if(command){this.locked=true;this.releaseSince=null;}
 return {shape:g.shape,progress,command,locked:this.locked,handDetected:!!p,fingers:g.fingers,ratios:g.ratios,angles:g.angles,handedness:side};
 }
}
