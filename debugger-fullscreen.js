// Use the site's own fullscreen control, never Chrome window fullscreen.
export async function togglePlayerFullscreen(api,tab,command){
 if(!/^https:\/\/www\.(youtube|netflix)\.com\//.test(tab.url||''))throw Error('Unsupported video tab.');
 const target={tabId:tab.id};let attached=false;
 const evaluate=async expression=>{
  const response=await api.debugger.sendCommand(target,'Runtime.evaluate',{expression,returnByValue:true});
  if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description||'Player fullscreen failed.');
  return response.result?.value;
 };
 try{
  await api.tabs.update(tab.id,{active:true});
  await api.windows.update(tab.windowId,{focused:true});
  await api.debugger.attach(target,'1.3');attached=true;
  const state=await evaluate(`(()=>{
   const youtube=location.hostname==='www.youtube.com';
   const player=youtube?document.querySelector('#movie_player'):document.querySelector('video')?.closest('.watch-video');
   if(!player)throw Error('Video player not found.');
   const fullscreen=youtube?player.classList.contains('ytp-fullscreen'):!!document.fullscreenElement;
   if(youtube){player.setAttribute('tabindex','-1');player.focus({preventScroll:true});}
   const button=youtube?null:document.querySelector('[data-uia="control-fullscreen-enter"], [data-uia="control-fullscreen-exit"]');
   const rect=button?.getBoundingClientRect();
   return {youtube,fullscreen,button:rect?{x:rect.x+rect.width/2,y:rect.y+rect.height/2}:null};
  })()`);
  const desired=command==='fullscreenToggle'?!state.fullscreen:command==='fullscreenOn';
  if(desired===state.fullscreen)return {ok:true};
  if(state.youtube){
   // A trusted plain F key invokes YouTube's native fullscreen toggle.
   try{await api.debugger.sendCommand(target,'Input.dispatchKeyEvent',{type:'keyDown',key:'f',code:'KeyF',text:'f',unmodifiedText:'f',windowsVirtualKeyCode:70,nativeVirtualKeyCode:70,modifiers:0});}
   finally{await api.debugger.sendCommand(target,'Input.dispatchKeyEvent',{type:'keyUp',key:'f',code:'KeyF',windowsVirtualKeyCode:70,nativeVirtualKeyCode:70,modifiers:0});}
  }else{
   if(!state.button)throw Error('Player fullscreen button not found.');
   await api.debugger.sendCommand(target,'Input.dispatchMouseEvent',{type:'mousePressed',...state.button,button:'left',clickCount:1});
   await api.debugger.sendCommand(target,'Input.dispatchMouseEvent',{type:'mouseReleased',...state.button,button:'left',clickCount:1});
  }
  return {ok:true};
 }finally{if(attached)await api.debugger.detach(target).catch(()=>{});}
}
