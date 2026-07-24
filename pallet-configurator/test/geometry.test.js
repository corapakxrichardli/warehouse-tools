import test from "node:test";
import assert from "node:assert/strict";

import { createPalletModel, updatePalletModel } from "../js/models/pallet-model.js";
import {
  cartonToRectangle,
  cartonsToRectangles,
  fitPalletToViewport,
  getPalletAspectRatio,
  inchesToSvg,
} from "../js/workspace/geometry.js";

test("inches convert to SVG coordinates using pixels per inch", () => {
  assert.equal(inchesToSvg(12, 7.5), 90);
});

test("fitted pallet preserves its physical aspect ratio", () => {
  const pallet = createPalletModel();
  const geometry = fitPalletToViewport(pallet, 800, 500);

  assert.equal(geometry.width / geometry.height, pallet.length / pallet.width);
  assert.equal(
    getPalletAspectRatio(pallet.length, pallet.width),
    geometry.width / geometry.height,
  );
});

test("pallet dimension updates produce matching fitted geometry", () => {
  const pallet = updatePalletModel(createPalletModel(), {
    length: 60,
    width: 30,
  });
  const geometry = fitPalletToViewport(pallet, 700, 450);

  assert.equal(geometry.width / geometry.height, 2);
});

test("carton placement converts to a non-rotated rectangle", () => {
  const rectangle = cartonToRectangle(
    { x: 2, y: 3, length: 12, width: 8, rotated: false },
    5,
    { x: 10, y: 20 },
  );

  assert.deepEqual(rectangle, {
    height: 40,
    rotated: false,
    width: 60,
    x: 20,
    y: 35,
  });
});

test("rotated carton swaps footprint length and width", () => {
  const rectangle = cartonToRectangle(
    { x: 0, y: 0, length: 12, width: 8, rotated: true },
    4,
  );

  assert.equal(rectangle.width, 32);
  assert.equal(rectangle.height, 48);
  assert.equal(rectangle.rotated, true);
});

test("an empty carton list converts to an empty rectangle list", () => {
  assert.deepEqual(cartonsToRectangles([], 5), []);
  assert.deepEqual(cartonsToRectangles(null, 5), []);
});

test("invalid pallet geometry and carton dimensions are rejected", () => {
  assert.throws(
    () => fitPalletToViewport({ length: 0, width: 40 }, 800, 500),
    RangeError,
  );
  assert.throws(
    () =>
      cartonToRectangle(
        { x: 0, y: 0, length: Number.NaN, width: 8, rotated: false },
        4,
      ),
    /finite number/,
  );
});
