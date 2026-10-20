import {test} from 'node:test';
import assert from 'node:assert/strict';
import {physicalHandedness} from './camera-handedness.js';
import {GestureGate} from './gestures.js';
test('mirrored camera labels are corrected for both command and display',()=>{
 const left={categoryName:'Left',score:.95};assert.equal(physicalHandedness(left).categoryName,'Right');assert.equal(left.categoryName,'Left');
 assert.equal(physicalHandedness({categoryName:'Right',score:.9}).categoryName,'Left');
 assert.equal(physicalHandedness(left,false).categoryName,'Left');assert.equal(physicalHandedness(null),null);
});
