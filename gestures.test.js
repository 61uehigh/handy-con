import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GestureGate,classify} from './gestures.js';
function hand(extended=[],thumb=false){
 const p=Array.from({length:21},()=>({x:.5,y:.8}));p[0]={x:.5,y:.9};
 for(const [i,m,x] of [[0,5,.4],[1,9,.5],[2,13,.6],[3,17,.7]]){
  const open=extended.includes(i);
  p[m]={x,y:.65};p[m+1]={x,y:.5};p[m+2]={x,y:open?.37:.58};p[m+3]={x,y:open?.27:.69};
 }
 p[2]={x:.25,y:.75};p[3]=thumb?{x:.25,y:.57}:{x:.42,y:.7};p[4]=thumb?{x:.25,y:.39}:{x:.49,y:.73};
 return p;
}
function okay(){const p=hand([1,2,3]);p[8]={...p[4]};return p;}
const poses=[['thumbsUp',hand([],true),'playPause'],['index',hand([0]),'back'],['victory',hand([0,1]),'forward'],['horns',hand([0,3]),'fullscreenToggle'],['okay',okay(),'captions']];
for(const [shape,pose,command] of poses){
 test(`${shape} on either hand fires ${command} once after 250ms`,()=>{
  for(const p of [pose,pose.map(q=>({...q,x:1-q.x}))]){
   assert.equal(classify(p).shape,shape);
   const gate=new GestureGate();gate.update(p,0);
   assert.equal(gate.update(p,249).command,null);assert.equal(gate.update(p,250).command,command);
   assert.equal(gate.update(p,1000).command,undefined);
  }
 });
}
test('ring, pinky alone, open palm and three fingers have no commands',()=>{
 for(const p of [hand([2]),hand([3]),hand([0,1,2,3]),hand([0,1,2])]){
  const gate=new GestureGate();gate.update(p,0);assert.equal(gate.update(p,500).command,null);
 }
});
test('custom poses override conflicting canned classifications',()=>{
 for(const [shape,p,command] of poses.filter(([shape])=>['horns','okay'].includes(shape))){
  for(const categoryName of ['Pointing_Up','Thumb_Up','None','Closed_Fist']){
   const prediction={categoryName,score:.95},gate=new GestureGate();gate.update(p,0,null,prediction);
   const state=gate.update(p,250,null,prediction);assert.equal(state.shape,shape);assert.equal(state.command,command);
  }
 }
});
test('trained Victory seeks forward and never toggles captions',()=>{
 const gate=new GestureGate(),p=hand(),prediction={categoryName:'Victory',score:.95};
 gate.update(p,0,null,prediction);assert.equal(gate.update(p,250,null,prediction).command,'forward');
});
test('trained open palm no longer toggles fullscreen',()=>{
 const gate=new GestureGate(),p=hand(),prediction={categoryName:'Open_Palm',score:.95};
 gate.update(p,0,null,prediction);assert.equal(gate.update(p,250,null,prediction).command,null);
});
test('missing hand resets hold',()=>{
 const gate=new GestureGate(),p=okay();gate.update(p,0);gate.update(null,150);
 assert.equal(gate.update(p,250).command,null);assert.equal(gate.update(p,500).command,'captions');
});
test('fist rearms at 250ms and absent hand at 450ms',()=>{
 for(const [resetPose,delay] of [[hand(),250],[null,450]]){
  const gate=new GestureGate(),p=hand([0,3]);gate.update(p,0);gate.update(p,250);
  gate.update(resetPose,300);assert.equal(gate.update(resetPose,300+delay-1).locked,true);
  assert.equal(gate.update(resetPose,300+delay).locked,false);
  gate.update(p,1000);assert.equal(gate.update(p,1250).command,'fullscreenToggle');
 }
});
test('custom poses survive inconclusive world coordinates',()=>{
 for(const [,p,command] of poses.filter(([shape])=>['horns','okay'].includes(shape))){
  const gate=new GestureGate();gate.update(p,0,hand());assert.equal(gate.update(p,250,hand()).command,command);
 }
});
test('classification is independent of reflection and world coordinate scale',()=>{
 for(const [shape,p] of poses){
  const world=p.map(q=>({x:(q.x-.5)*-.2,y:(q.y-.7)*.2,z:0}));assert.equal(classify(world).shape,shape);
 }
});
test('closed fist and downward thumb never toggle playback',()=>{
 const down=hand([],true);down[3]={x:.25,y:.93};down[4]={x:.25,y:1.11};
 for(const p of [hand(),down]){const gate=new GestureGate();gate.update(p,0);assert.equal(gate.update(p,500).command,null);}
});
