import {test} from 'node:test';
import assert from 'node:assert/strict';
import {togglePlayerFullscreen} from './debugger-fullscreen.js';
function fixture(fullscreen=false,fail=false){
 const calls=[];
 const api={tabs:{update:async()=>{}},windows:{update:async()=>{}},debugger:{attach:async()=>calls.push('attach'),detach:async()=>calls.push('detach'),sendCommand:async(_,method,args)=>{
 calls.push({method,args});
 if(method==='Runtime.evaluate')return {result:{value:{youtube:true,fullscreen}}};
 if(fail&&args.type==='keyDown')throw Error('Dispatch failed');
 }}};
 return {api,calls};
}
const tab={id:1,windowId:2,url:'https://www.youtube.com/watch?v=test'};
test('YouTube fullscreen uses plain F down/up and releases debugger',async()=>{
 const {api,calls}=fixture();await togglePlayerFullscreen(api,tab,'fullscreenToggle');
 const keys=calls.filter(x=>x.method==='Input.dispatchKeyEvent');
 assert.deepEqual(keys.map(x=>[x.args.type,x.args.key,x.args.modifiers]),[['keyDown','f',0],['keyUp','f',0]]);
 assert.equal(calls.at(-1),'detach');
 assert.ok(!calls.some(x=>x.args?.expression?.includes('requestFullscreen')));
});
test('explicit fullscreen on does not toggle an already fullscreen player',async()=>{
 const {api,calls}=fixture(true);await togglePlayerFullscreen(api,tab,'fullscreenOn');
 assert.ok(!calls.some(x=>x.method==='Input.dispatchKeyEvent'));assert.equal(calls.at(-1),'detach');
});
test('failed key dispatch still releases key and debugger',async()=>{
 const {api,calls}=fixture(false,true);await assert.rejects(togglePlayerFullscreen(api,tab,'fullscreenToggle'));
 assert.equal(calls.at(-2).args.type,'keyUp');assert.equal(calls.at(-1),'detach');
});
