(()=>{
if(globalThis.__gestureRemotePlayerVersion==='1.0.0')return;
globalThis.__gestureRemotePlayerVersion='1.0.0';
let savedTrackLanguage='';
let fullscreenPrompt=null;
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg.type!=='gesture'&&msg.type!=='getState')return;
 const video=[...document.querySelectorAll('video')].filter(v=>v.getBoundingClientRect().width>0).sort((a,b)=>b.clientWidth-a.clientWidth)[0];
 if(!video){reply({ok:false,error:'No visible video found.'});return;}
 const readState=()=>{
  const captionButton=document.querySelector('.ytp-subtitles-button');
  return {paused:video.paused,currentTime:video.currentTime,fullscreen:!!document.fullscreenElement,captions:captionButton?captionButton.getAttribute('aria-pressed')==='true':[...video.textTracks].some(track=>['subtitles','captions'].includes(track.kind)&&track.mode==='showing')};
 };
 if(msg.type==='getState'){reply({ok:true,state:readState()});return;}
 (async()=>{
 switch(msg.command){
 case 'fullscreenToggle': case 'fullscreenOn': case 'fullscreenOff': {
 const enter=msg.command==='fullscreenOn'||(msg.command==='fullscreenToggle'&&!document.fullscreenElement);
 fullscreenPrompt?.remove();fullscreenPrompt=null;
 if(!enter){if(document.fullscreenElement)await document.exitFullscreen();break;}
 if(document.fullscreenElement)break;
 const container=document.querySelector('#movie_player')||video.parentElement;
 if(!container?.requestFullscreen)throw Error('Fullscreen is unavailable for this player.');
 try{await container.requestFullscreen();}
 catch(error){
  if(error.name!=='NotAllowedError'&&error.name!=='TypeError')throw error;
  const button=document.createElement('button');fullscreenPrompt=button;
  button.textContent='Click to enter fullscreen';
  Object.assign(button.style,{position:'fixed',bottom:'90px',left:'50%',transform:'translateX(-50%)',zIndex:'2147483647',padding:'16px 24px',background:'#fff',color:'#111',border:'2px solid #333',borderRadius:'12px',font:'bold 16px system-ui',cursor:'pointer'});
  button.onclick=async()=>{try{await container.requestFullscreen();button.remove();fullscreenPrompt=null;}catch{button.textContent='Use the player’s fullscreen button';}};
  document.body.append(button);
  return {ok:true,detail:'Your browser requires a click. Click “Enter fullscreen” on the video.',requiresUserGesture:true};
 }
 break;
 }
 case 'playPause': {
 const pausedBefore=video.paused;
 if(pausedBefore)await video.play();else video.pause();
 if(video.paused===pausedBefore)throw Error('The player did not change playback state.');
 break;
 }
 case 'back': case 'forward': {
 const delta=msg.command==='back'?-5:5;
 let end=Number.isFinite(video.duration)?video.duration:Infinity;
 if(video.seekable.length)end=video.seekable.end(video.seekable.length-1);
 video.currentTime=Math.max(video.seekable.length?video.seekable.start(0):0,Math.min(end,video.currentTime+delta));break;
 }
 case 'captions':{
 const yt=document.querySelector('.ytp-subtitles-button');
 if(yt){if(yt.disabled||yt.getAttribute('aria-disabled')==='true')throw Error('Captions are unavailable for this video.');yt.click();break;}
 const tracks=[...video.textTracks].filter(t=>['subtitles','captions'].includes(t.kind));
 if(tracks.length){const on=tracks.find(t=>t.mode==='showing');if(on){savedTrackLanguage=on.language;on.mode='disabled';}else (tracks.find(t=>t.language===savedTrackLanguage)||tracks[0]).mode='showing';break;}
 throw Error('Caption control is unavailable for this player.');
 }
 default:throw Error('Unknown command');
 }
 return {ok:true,playback:{paused:video.paused,currentTime:video.currentTime},state:readState()};
 })().then(reply,e=>reply({ok:false,error:e.message}));return true;
});
})();
