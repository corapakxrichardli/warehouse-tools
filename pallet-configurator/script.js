/**
 * Pallet Configurator application entry point.
 *
 * Future product modules (packing, SVG, 3D, and export) can be initialized here
 * without coupling their implementation to the document markup.
 */

import { initializeFormShell } from "./js/form-shell.js";
import { createApplicationStore } from "./js/state/application-state.js";
import { initializeTabs } from "./js/tabs.js";
import { initializeWorkspace } from "./js/workspace/workspace-controller.js";

function initializeApplication() {
  const applicationStore = createApplicationStore();
  const initialState = applicationStore.getState();

  initializeTabs(document.querySelector("[data-tabs]"));

  const workspace = initializeWorkspace(
    document.querySelector("[data-pallet-workspace]"),
    {
      cartons: initialState.cartons,
      gridVisible: initialState.workspace.gridVisible,
      pallet: initialState.pallet,
      zoom: initialState.workspace.zoom,
      onWorkspaceChange(workspaceState) {
        applicationStore.setWorkspace(workspaceState);
      },
    },
  );

  initializeFormShell(document.querySelector("#configuration-form"), {
    initialPallet: initialState.pallet,
    onPalletChange(pallet) {
      applicationStore.setPallet(pallet);
      workspace.setPalletModel(pallet);
    },
  });

  const developmentDemoRequested =
    new URLSearchParams(window.location.search).get("demo") === "1";

  if (developmentDemoRequested) {
    import("./js/dev/demo-layout.js").then(({ getDevelopmentCartons }) => {
      const cartons = getDevelopmentCartons();
      applicationStore.setCartons(cartons);
      workspace.setCartons(cartons);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApplication, { once: true });
} else {
  initializeApplication();
}
