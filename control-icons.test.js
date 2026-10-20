import {test} from 'node:test';
import assert from 'node:assert/strict';
import {controlPresentation,CONTROL_ICONS} from './control-icons.js';
test('control icon shapes represent the real playback, subtitle and fullscreen states',()=>{
 const off=controlPresentation({paused:true,captions:false,fullscreen:false});
 assert.equal(off.playPause.icon,'play');assert.equal(off.captions.icon,'captionsOff');assert.equal(off.fullscreenToggle.icon,'fullscreenEnter');
 const on=controlPresentation({paused:false,captions:true,fullscreen:true});
 assert.equal(on.playPause.icon,'pause');assert.equal(on.captions.icon,'captionsOn');assert.equal(on.fullscreenToggle.icon,'fullscreenExit');
 assert.equal(on.captions.pressed,true);assert.equal(off.captions.pressed,false);
 for(const state of [on,off])for(const item of Object.values(state))assert.ok(CONTROL_ICONS[item.icon].includes('currentColor'));
});
