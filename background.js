import {togglePlayerFullscreen} from './debugger-fullscreen.js';
chrome.action.onClicked.addListener(async tab => {
  if (!/^https:\/\/www\.(youtube|netflix)\.com\//.test(tab.url || '')) return;
  await chrome.windows.create({url:chrome.runtime.getURL(`remote.html?target=${tab.id}`),type:'popup',width:440,height:520});
});
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
  if(sender.id!==chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL('remote.html')) || !['command','state'].includes(msg.type)) return;
  (async()=>{
    const window=await chrome.windows.getLastFocused({windowTypes:['normal']});
    const [tab]=await chrome.tabs.query({active:true,windowId:window.id});
    if(!tab)throw Error('No active tab found.');
    if(!/^https:\/\/www\.(youtube|netflix)\.com\//.test(tab.url||'')) throw Error('Open a YouTube or Netflix video in the active tab.');
    if(msg.type==='command' && ['fullscreenToggle','fullscreenOn','fullscreenOff'].includes(msg.command))return await togglePlayerFullscreen(chrome,tab,msg.command);
    if(msg.type==='command' && msg.command==='captions' && tab.url.startsWith('https://www.netflix.com/')){
      const results=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:()=>{
        try{
          const api=window.netflix?.appContext?.state?.playerApp?.getAPI()?.videoPlayer;
          const id=api?.getAllPlayerSessionIds()?.find(id=>id.startsWith('watch')) || api?.getAllPlayerSessionIds()?.[0];
          const player=id&&api.getVideoPlayerBySessionId(id);
          if(!player)throw Error('Netflix player not found.');
          const tracks=player.getTimedTextTrackList();
          const current=player.getTimedTextTrack();
          const off=tracks.find(t=>t.isNoneTrack || t.bcp47==='none');
          const isOff=!current || current.isNoneTrack || current.bcp47==='none';
          const saved=window.__gestureRemoteCaption;
          const next=isOff?(tracks.find(t=>!t.isNoneTrack&&t.bcp47!=='none'&&t.bcp47===saved)||tracks.find(t=>!t.isNoneTrack&&t.bcp47!=='none')):off;
          if(!next)throw Error('No caption track is available.');
          if(!isOff)window.__gestureRemoteCaption=current.bcp47;
          player.setTimedTextTrack(next);return {ok:true};
        }catch(e){return {ok:false,error:'Netflix caption control failed: '+e.message};}
      }});
      return results[0]?.result || {ok:false,error:'The caption control did not respond.'};
    }
    const message=msg.type==='state'?{type:'getState'}:{type:'gesture',command:msg.command};
    let response;
    try{response=await chrome.tabs.sendMessage(tab.id,message);}
    catch(error){
      if(!/Receiving end does not exist|Could not establish connection|message port closed/i.test(error.message))throw error;
      // A page left open across extension reload may have no working content-script receiver.
      await chrome.scripting.executeScript({target:{tabId:tab.id},files:['player.js']});
      response=await chrome.tabs.sendMessage(tab.id,message);
    }
    if(!response)throw Error('The video tab did not respond. Reload the page.');
    return {...response,targetTitle:tab.title||new URL(tab.url).hostname,targetId:tab.id};
  })().then(reply,e=>reply({ok:false,error:e.message}));
  return true;
});
