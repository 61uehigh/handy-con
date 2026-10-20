import {physicalHandedness} from './camera-handedness.js';
import {CONTROL_ICONS,controlPresentation} from './control-icons.js';
import {HAND_CONNECTIONS} from './hand-topology.js';
import {GestureGate} from './gestures.js';
const $=s=>document.querySelector(s),gate=new GestureGate();
let detector,stream,timer,busy=false,running=false,lastFrame=-1,generation=0,lastDetectionAt=0;
const labels={none:'Show your hand',index:'Index · Back 5 seconds',victory:'V sign · Forward 5 seconds',okay:'Okay · Captions',horns:'Index + pinky · Fullscreen',open:'Open palm',fist:'Fist · Ready for the next gesture',thumbsUp:'Thumbs up · Play / pause',back:'−5s',forward:'+5s'};
const canvas=$('#landmarks'),ctx=canvas.getContext('2d');
const connections=HAND_CONNECTIONS;
// Feed mirrored pixels; convert model handedness to physical hand labels once below.
const recognitionInput=document.createElement('canvas');
const recognitionContext=recognitionInput.getContext('2d');
function drawLandmarks(hands){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 for(const hand of hands){
  ctx.strokeStyle='#1677ff';ctx.lineWidth=3;
  for(const [a,b] of connections){ctx.beginPath();ctx.moveTo(hand[a].x*canvas.width,hand[a].y*canvas.height);ctx.lineTo(hand[b].x*canvas.width,hand[b].y*canvas.height);ctx.stroke();}
  for(const point of hand){ctx.beginPath();ctx.arc(point.x*canvas.width,point.y*canvas.height,5,0,Math.PI*2);ctx.fillStyle='#1677ff';ctx.fill();ctx.strokeStyle='#1677ff';ctx.lineWidth=1.5;ctx.stroke();}
 }
}
const commands={playPause:'Play / pause',captions:'Toggle captions',back:'Back 5 seconds',forward:'Forward 5 seconds',fullscreenToggle:'Toggle fullscreen',fullscreenOn:'Enter fullscreen',fullscreenOff:'Exit fullscreen'};

async function executeCommand(command){
 if(busy)return;busy=true;
 $('#status').textContent='';
 try{
  const response=await chrome.runtime.sendMessage({type:'command',target:Number(new URLSearchParams(location.search).get('target')),command});
  if(response?.state)renderControls(response.state);
  refreshPlayerState();
  if(response?.targetTitle)$('#target-title').textContent=response.targetTitle;
  $('#status').textContent=response?.ok?(response.requiresUserGesture?response.detail:''):response?.error||'Connection failed';
 }catch(error){$('#status').textContent='Control failed: '+error.message;}
 finally{busy=false;}
}
for(const button of document.querySelectorAll('[data-command]'))button.onclick=()=>executeCommand(button.dataset.command);

function stop(){$('#camera-off').hidden=false;drawLandmarks([]);generation++;running=false;clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());stream=null;$('video').srcObject=null;detector?.close();detector=null;gate.reset();$('#camera-toggle').checked=false;setCameraRecognizing(false);$('#shape').textContent='Turn on the camera to start.';$('progress').value=0;$('#status').textContent='';}
async function tick(){
 if(!running)return;
 try{
 const video=$('video');
 if(!busy && video.readyState>=2 && video.currentTime!==lastFrame){
 lastFrame=video.currentTime;
 recognitionInput.width=video.videoWidth;recognitionInput.height=video.videoHeight;
 recognitionContext.setTransform(-1,0,0,1,recognitionInput.width,0);
 recognitionContext.drawImage(video,0,0);
 const result=detector.recognizeForVideo(recognitionInput,performance.now());
 result.handedness=result.handedness.map(categories=>categories.map(prediction=>physicalHandedness(prediction,true)));
 // Overlay is already CSS-mirrored; map image points back before drawing it.
 result.landmarks=result.landmarks.map(hand=>hand.map(point=>({...point,x:1-point.x})));
 if(video.videoWidth && (canvas.width!==video.videoWidth || canvas.height!==video.videoHeight)){canvas.width=video.videoWidth;canvas.height=video.videoHeight;$('.preview').style.aspectRatio=`${canvas.width}/${canvas.height}`;}
 drawLandmarks(result.landmarks);
 const now=performance.now();
 const gap=lastDetectionAt?now-lastDetectionAt:0;lastDetectionAt=now;
 const state=gate.update(result.landmarks[0],now,result.worldLandmarks?.[0],result.gestures?.[0]?.[0]||{categoryName:'None',score:0},result.handedness?.[0]?.[0]);
 $('#shape').textContent=state.locked?'Make a fist for 0.25s to reset':labels[state.shape];
 $('progress').value=state.progress;
 if(state.command){flashRecognizedControl(state.command);await executeCommand(state.command);}
 }
 }catch(e){stop();$('#status').textContent='Recognition error: '+e.message;return;}
 if(running)timer=setTimeout(tick,65);
}
async function startCamera(){
 const token=++generation;setCameraRecognizing(true);$('#status').textContent='';$('#shape').textContent='';
 try{
 const {FilesetResolver,GestureRecognizer}=await import('./vendor/vision_bundle.mjs');
 const files=await FilesetResolver.forVisionTasks(chrome.runtime.getURL('vendor/wasm'));
 const loaded=await GestureRecognizer.createFromOptions(files,{baseOptions:{modelAssetPath:chrome.runtime.getURL('vendor/gesture_recognizer.task')},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.65,minHandPresenceConfidence:.65,minTrackingConfidence:.65});
 if(token!==generation){loaded.close();return;}detector=loaded;
 const camera=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,frameRate:15},audio:false});
 if(token!==generation){camera.getTracks().forEach(t=>t.stop());return;}stream=camera;
 $('video').srcObject=stream;await $('video').play();
 if(token!==generation)return;
 gate.reset();lastFrame=-1;lastDetectionAt=0;running=true;$('#camera-off').hidden=true;setCameraRecognizing(false);$('#status').textContent='';tick();
 }catch(e){if(token===generation){stop();$('#status').textContent='Camera start failed: '+e.message;}}
};
$('#camera-toggle').onchange=()=>{if($('#camera-toggle').checked)startCamera();else stop();};
addEventListener('pagehide',stop);

function renderControls(state){
 for(const [command,presentation] of Object.entries(controlPresentation(state))){
  const button=document.querySelector(`[data-command="${command}"]`);
  const gradientId='gesture-gradient-'+command;
  const gradient=`<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1765e8"/><stop offset="0.42" stop-color="#2458d4"/><stop offset="1" stop-color="#102a79"/></linearGradient></defs>`;
  button.innerHTML=CONTROL_ICONS[presentation.icon].replace(/(<svg[^>]*>)/,'$1'+gradient);
  button.style.setProperty('--gesture-paint',`url(#${gradientId})`);
  button.classList.add('icon-control');
  button.setAttribute('aria-label',presentation.label);button.title=presentation.label;
  if(presentation.pressed===null)button.removeAttribute('aria-pressed');
  else button.setAttribute('aria-pressed',String(presentation.pressed));
 }
}
let statePollTimer;
async function refreshPlayerState(){
 clearTimeout(statePollTimer);
 try{
  const response=await chrome.runtime.sendMessage({type:'state'});
  if(response?.ok&&response.state){
   renderControls(response.state);
   if(response.targetTitle)$('#target-title').textContent=response.targetTitle;
  }
 }catch{}
 statePollTimer=setTimeout(refreshPlayerState,1000);
}
renderControls(null);refreshPlayerState();
addEventListener('pagehide',()=>clearTimeout(statePollTimer));

const recognitionFlashTimers=new Map();
function flashRecognizedControl(command){
 const button=document.querySelector(`[data-command="${command}"]`);
 if(!button)return;
 clearTimeout(recognitionFlashTimers.get(command));
 button.classList.add('gesture-active');
 recognitionFlashTimers.set(command,setTimeout(()=>{
  button.classList.remove('gesture-active');recognitionFlashTimers.delete(command);
 },600));
}
addEventListener('pagehide',()=>{for(const timer of recognitionFlashTimers.values())clearTimeout(timer);});

const helpButton=document.querySelector('.help-button');
const helpTooltip=document.querySelector('.help-tooltip');
function hideHelp(){helpTooltip.classList.remove('is-visible');}
function showHelp(){
 const margin=12,gap=8,rect=helpButton.getBoundingClientRect();
 const width=Math.min(290,window.innerWidth-margin*2);
 const above=rect.top-margin-gap,below=window.innerHeight-rect.bottom-margin-gap;
 const useAbove=above>=below;
 const available=Math.max(60,useAbove?above:below);
 helpTooltip.style.width=width+'px';
 helpTooltip.style.maxHeight='none';
 helpTooltip.style.left=Math.max(margin,Math.min(rect.left+rect.width/2-width/2,window.innerWidth-margin-width))+'px';
 helpTooltip.classList.add('is-visible');
 const height=helpTooltip.getBoundingClientRect().height;
 helpTooltip.style.top=(useAbove?Math.max(margin,rect.top-gap-height):rect.bottom+gap)+'px';
}
helpButton.addEventListener('mouseenter',showHelp);
helpButton.addEventListener('mouseleave',hideHelp);
helpButton.addEventListener('focus',()=>{if(helpButton.matches(':focus-visible'))showHelp();});
helpButton.addEventListener('blur',hideHelp);
document.addEventListener('keydown',event=>{if(event.key==='Escape')hideHelp();});
addEventListener('resize',hideHelp);
addEventListener('scroll',hideHelp,true);

function setCameraRecognizing(active){
 $('#shape').hidden=active;
 $('#camera-loading').hidden=!active;
 $('#camera-off').hidden=active||running;
 $('.preview').setAttribute('aria-busy',String(active));
}
