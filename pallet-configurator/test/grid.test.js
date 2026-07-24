import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateGridIntervals,
  calculateRulerInterval,
  createGridPositions,
} from "../js/workspace/grid.js";

test("grid shows one-inch intervals when visually practical", () => {
  assert.deepEqual(calculateGridIntervals(8, 1), {
    majorInterval: 12,
    minorInterval: 1,
  });
});

test("grid simplifies minor lines when zoomed out", () => {
  assert.equal(calculateGridIntervals(5, 1).minorInterval, 6);
  assert.equal(calculateGridIntervals(5, 0.5).minorInterval, null);
});

test("major grid positions are calculated in pallet inches", () => {
  assert.deepEqual(createGridPositions(48, 12), [0, 12, 24, 36, 48]);
});

test("ruler interval adapts to effective scale", () => {
  assert.equal(calculateRulerInterval(9, 1), 1);
  assert.equal(calculateRulerInterval(5, 1), 2);
  assert.equal(calculateRulerInterval(5, 0.5), 6);
});
