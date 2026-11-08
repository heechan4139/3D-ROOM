import assert from 'node:assert/strict';
import { CATALOG_ITEMS, roomDimensions, roomLayout, defaultAppliances, constrainItem, footprint, isValidPosition } from '../src/roomGeometry.js';
let cases = 0;
for (const type of ['A', 'B']) for (const size of [5, 7, 10]) {
  const room = roomDimensions(size, type);
  assert.ok(Math.abs((room.width * room.height - (type === 'B' ? 9900 : 0)) / 10000 - size * 3.3058) < .001);
  const { kitchen, bathroom, entry } = roomLayout(room);
  assert.deepEqual(kitchen.map(item => item.id), ['sink', 'induction']);
  if (type === 'B') { assert.ok(bathroom.x > room.width / 2 && bathroom.y === room.height - 160); assert.ok(entry.x > bathroom.x); }
  assert.equal(bathroom.width, type === 'B' ? 200 : 140);
  assert.equal(bathroom.height, 160);
  const appliances = defaultAppliances(room);
  assert.deepEqual(appliances.map(item => item.id), ['fridge', 'washer']);
  for (const appliance of appliances) {
    assert.ok(appliance.protected);
    assert.ok(isValidPosition(appliance, room, appliances), `Default ${appliance.id} ${type}${size}`);
    for (const rotation of [0,90,180,270]) {
      const rotated = constrainItem({...appliance, rotation}, room, appliances);
      assert.ok(rotated && isValidPosition(rotated, room, appliances));
    }
  }
  const fridge = appliances[0], washer = appliances[1], wb = footprint(washer);
  const front = { x: fridge.x - fridge.width/2, y: fridge.y + fridge.height/2, width: fridge.width, height: 60 };
  assert.ok(washer.x + wb.width/2 <= front.x || washer.x - wb.width/2 >= front.x + front.width || washer.y + wb.height/2 <= front.y || washer.y - wb.height/2 >= front.y + front.height, 'Fridge front must be clear by default');
  for (const furniture of CATALOG_ITEMS.filter(item => !item.isLocked)) for (const rotation of [0,90,180,270]) {
    for (const x of [-1000, 0, 100, room.width/2, room.width, 1000]) for (const y of [-1000, 0, 100, room.height/2, room.height, 1000]) {
      const result = constrainItem({...furniture, rotation, x, y}, room, appliances);
      assert.ok(result && isValidPosition(result, room, appliances), `${type}${size} ${furniture.id} rotation ${rotation}`);
      assert.deepEqual(constrainItem(result, room, appliances), result);
      cases++;
    }
  }
}
console.log(`Passed ${cases} placement cases, required appliance movement/rotation and fridge access checks.`);

const room = roomDimensions(10, 'A');
const desk = {...CATALOG_ITEMS.find(i => i.id === 'desk'), uid:'desk', rotation:0, x:240, y:350};
const other = {...desk, uid:'other'};
assert.equal(isValidPosition(other, room, [desk]), false, 'Furniture overlap blocked');
const moved = constrainItem(other, room, [desk]);
assert.ok(moved && isValidPosition(moved, room, [desk]));
const rug = {...CATALOG_ITEMS.find(i => i.id === 'rug'), uid:'rug', rotation:0, x:240,y:350};
assert.ok(isValidPosition(rug, room, [desk]), 'Rug may overlap furniture');
assert.ok(isValidPosition(desk, room, [rug]), 'Furniture may overlap rug');
const filled = [{...desk, uid:'huge',width:room.width,height:room.height,x:room.width/2,y:room.height/2}];
assert.equal(constrainItem(other,room,filled),null,'Full room rejects placement');
console.log('Passed fixed bathroom dimensions, furniture overlap and rug exceptions.');
