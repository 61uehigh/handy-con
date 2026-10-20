import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function setup(){
 let listener,captionClicks=0;
 const video={paused:true,currentTime:30,duration:100,clientWidth:640,seekable:{length:0},textTracks:[],getBoundingClientRect:()=>({width:640}),play:async()=>{video.paused=false;},pause:()=>{video.paused=true;}};
 const container={requestFullscreen:async()=>{document.fullscreenElement=container;}};video.parentElement=container;
 const appended=[];
 const document={fullscreenElement:null,querySelectorAll:()=>[video],querySelector:s=>s==='#movie_player'?container:s==='.ytp-subtitles-button'?{click:()=>captionClicks++,disabled:false,getAttribute:()=>null}:null,exitFullscreen:async()=>{document.fullscreenElement=null;},createElement:()=>({style:{},remove(){}}),body:{append:el=>appended.push(el)}};
 vm.runInNewContext(readFileSync(new URL('./player.js',import.meta.url),'utf8'),{chrome:{runtime:{onMessage:{addListener:fn=>listener=fn}}},document});
 return {video,container,document,appended,get clicks(){return captionClicks;},send:command=>new Promise(resolve=>listener({type:'gesture',command},{},resolve))};
}
test('direct video playback, seeking, and caption button work without keyboard events',async()=>{
 const p=setup();await p.send('playPause');assert.equal(p.video.paused,false);await p.send('playPause');assert.equal(p.video.paused,true);
 await p.send('forward');assert.equal(p.video.currentTime,35);await p.send('back');assert.equal(p.video.currentTime,30);
 await p.send('captions');assert.equal(p.clicks,1);
});
test('fullscreen targets player and toggles off',async()=>{
 const p=setup();assert.equal((await p.send('fullscreenToggle')).ok,true);assert.equal(p.document.fullscreenElement,p.container);
 await p.send('fullscreenToggle');assert.equal(p.document.fullscreenElement,null);
});
test('blocked fullscreen honestly requests a click and completes via that click',async()=>{
 const p=setup();p.container.requestFullscreen=async()=>{const e=Error('user gesture');e.name='NotAllowedError';throw e;};
 const response=await p.send('fullscreenToggle');assert.equal(response.requiresUserGesture,true);assert.equal(p.appended.length,1);
 p.container.requestFullscreen=async()=>{p.document.fullscreenElement=p.container;};await p.appended[0].onclick();assert.equal(p.document.fullscreenElement,p.container);
});
test('background chooses the active normal-window tab each time, ignoring old target id',async()=>{
 let listener;let activeId=2;const calls=[];
 const chrome={action:{onClicked:{addListener(){}}},runtime:{id:'test',getURL:path=>'chrome-extension://test/'+path,onMessage:{addListener:fn=>listener=fn}},windows:{getLastFocused:async options=>{assert.deepEqual([...options.windowTypes],['normal']);return {id:5};}},tabs:{query:async q=>{assert.equal(q.active,true);assert.equal(q.windowId,5);return [{id:activeId,url:'https://www.youtube.com/watch?v=x'}];},sendMessage:async(id,msg)=>{calls.push([id,msg.command]);return {ok:true};}}};
 vm.runInNewContext(readFileSync(new URL('./background.js',import.meta.url),'utf8').replace(/^import .*;\n/,''),{chrome});
 const send=()=>new Promise(resolve=>listener({type:'command',target:999,command:'playPause'},{id:'test',url:'chrome-extension://test/remote.html'},resolve));
 await send();activeId=7;await send();assert.deepEqual(calls,[[2,'playPause'],[7,'playPause']]);
 const manifest=JSON.parse(readFileSync(new URL('./manifest.json',import.meta.url),'utf8'));assert.ok(manifest.permissions.includes('debugger'));
});
test('a stale page receiver is injected and the command is retried only once',async()=>{
 let listener,attempts=0,injections=0;
 const chrome={action:{onClicked:{addListener(){}}},runtime:{id:'test',getURL:p=>'chrome-extension://test/'+p,onMessage:{addListener:f=>listener=f}},windows:{getLastFocused:async()=>({id:5})},tabs:{query:async()=>[{id:2,url:'https://www.youtube.com/watch?v=x',title:'현재 영상'}],sendMessage:async()=>{attempts++;if(attempts===1)throw Error('Could not establish connection. Receiving end does not exist.');return {ok:true};}},scripting:{executeScript:async options=>{assert.equal(options.target.tabId,2);assert.deepEqual([...options.files],['player.js']);injections++;}}};
 vm.runInNewContext(readFileSync(new URL('./background.js',import.meta.url),'utf8').replace(/^import .*;\n/,''),{chrome,URL});
 const result=await new Promise(resolve=>listener({type:'command',command:'playPause'},{id:'test',url:'chrome-extension://test/remote.html'},resolve));
 assert.equal(result.ok,true);assert.equal(result.targetTitle,'현재 영상');assert.equal(injections,1);assert.equal(attempts,2);
});
test('reading player state does not change playback and reports fullscreen',async()=>{
 const p=setup();
 // The same message listener serves read-only state requests.
 const chromeSource=readFileSync(new URL('./player.js',import.meta.url),'utf8');
 let receive;
 vm.runInNewContext(chromeSource,{chrome:{runtime:{onMessage:{addListener:f=>receive=f}}},document:p.document});
 const response=await new Promise(resolve=>receive({type:'getState'},{},resolve));
 assert.equal(response.ok,true);assert.equal(response.state.paused,true);assert.equal(response.state.fullscreen,false);assert.equal(p.video.currentTime,30);assert.equal(p.clicks,0);
});
