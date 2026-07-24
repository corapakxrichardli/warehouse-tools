import test from "node:test";
import assert from "node:assert/strict";

import {
  createPalletModel,
  DEFAULT_PALLET,
  updatePalletModel,
  usableStackHeight,
  validatePalletModel,
} from "../js/models/pallet-model.js";

test("pallet model uses the standard defaults", () => {
  assert.deepEqual(createPalletModel(), DEFAULT_PALLET);
});

test("default pallet height is 6 inches", () => {
  assert.equal(createPalletModel().height, 6);
});

test("pallet model updates preserve unrelated values", () => {
  const updated = updatePalletModel(createPalletModel(), {
    emptyWeight: 62,
    length: 60,
  });

  assert.equal(updated.length, 60);
  assert.equal(updated.emptyWeight, 62);
  assert.equal(updated.width, 40);
  assert.equal(updated.maximumLoadedHeight, 85);
});

test("usable stack height is loaded height minus pallet height", () => {
  assert.equal(usableStackHeight(createPalletModel()), 79);
});

test("loaded height must be greater than pallet height", () => {
  const equalHeight = validatePalletModel({
    ...DEFAULT_PALLET,
    maximumLoadedHeight: 6,
  });
  const lowerHeight = validatePalletModel({
    ...DEFAULT_PALLET,
    maximumLoadedHeight: 5,
  });

  assert.equal(equalHeight.isValid, false);
  assert.match(equalHeight.errors.maximumLoadedHeight, /greater than/);
  assert.equal(lowerHeight.isValid, false);
});

test("loaded weight cannot be below empty pallet weight", () => {
  const result = validatePalletModel({
    ...DEFAULT_PALLET,
    maximumLoadedWeight: 49,
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.maximumLoadedWeight, /at least/);
});

test("invalid and non-finite pallet dimensions are rejected", () => {
  assert.equal(
    validatePalletModel({ ...DEFAULT_PALLET, length: 0 }).isValid,
    false,
  );
  assert.equal(
    validatePalletModel({ ...DEFAULT_PALLET, width: Number.NaN }).isValid,
    false,
  );
  assert.throws(() => createPalletModel({ height: -1 }), RangeError);
});

test("empty pallet weight may be zero but not negative", () => {
  assert.equal(
    validatePalletModel({ ...DEFAULT_PALLET, emptyWeight: 0 }).isValid,
    true,
  );
  assert.equal(
    validatePalletModel({ ...DEFAULT_PALLET, emptyWeight: -0.01 }).isValid,
    false,
  );
});
