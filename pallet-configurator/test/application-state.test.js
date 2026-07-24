import test from "node:test";
import assert from "node:assert/strict";

import {
  createApplicationState,
  createApplicationStore,
} from "../js/state/application-state.js";

test("application state is independent of browser DOM rendering", () => {
  const state = createApplicationState();

  assert.equal(typeof document, "undefined");
  assert.equal(state.pallet.length, 48);
  assert.deepEqual(state.cartons, []);
  assert.deepEqual(state.workspace, { gridVisible: true, zoom: 1 });
});

test("store pallet updates do not mutate previous state", () => {
  const store = createApplicationStore();
  const previousState = store.getState();
  store.setPallet({ ...previousState.pallet, length: 54 });
  const nextState = store.getState();

  assert.equal(previousState.pallet.length, 48);
  assert.equal(nextState.pallet.length, 54);
  assert.notEqual(previousState, nextState);
});

test("workspace state remains separate from pallet state", () => {
  const store = createApplicationStore();
  const pallet = store.getState().pallet;
  store.setWorkspace({ gridVisible: false, zoom: 1.5 });

  assert.equal(store.getState().pallet, pallet);
  assert.deepEqual(store.getState().workspace, {
    gridVisible: false,
    zoom: 1.5,
  });
});
