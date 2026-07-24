import { createPalletModel } from "../models/pallet-model.js";

export const DEFAULT_WORKSPACE_STATE = Object.freeze({
  gridVisible: true,
  zoom: 1,
});

/**
 * Creates the DOM-independent application state used by controllers and future
 * calculation modules.
 */
export function createApplicationState(initial = {}) {
  return Object.freeze({
    pallet: createPalletModel(initial.pallet),
    cartons: Object.freeze([...(initial.cartons ?? [])]),
    workspace: Object.freeze({
      ...DEFAULT_WORKSPACE_STATE,
      ...(initial.workspace ?? {}),
    }),
  });
}

/**
 * Small observable store. State transitions always replace the root object so
 * consumers never need to share mutable state.
 */
export function createApplicationStore(initial = {}) {
  let state = createApplicationState(initial);
  const listeners = new Set();

  function publish() {
    listeners.forEach((listener) => listener(state));
  }

  return {
    getState() {
      return state;
    },

    setPallet(pallet) {
      state = Object.freeze({
        ...state,
        pallet: createPalletModel(pallet),
      });
      publish();
      return state;
    },

    setCartons(cartons) {
      state = Object.freeze({
        ...state,
        cartons: Object.freeze([...(cartons ?? [])]),
      });
      publish();
      return state;
    },

    setWorkspace(updates) {
      state = Object.freeze({
        ...state,
        workspace: Object.freeze({ ...state.workspace, ...updates }),
      });
      publish();
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
