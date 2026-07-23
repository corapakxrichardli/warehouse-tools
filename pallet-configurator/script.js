/**
 * Pallet Configurator application entry point.
 *
 * Future product modules (packing, SVG, 3D, and export) can be initialized here
 * without coupling their implementation to the document markup.
 */

import { initializeFormShell } from "./js/form-shell.js";
import { initializeTabs } from "./js/tabs.js";

function initializeApplication() {
  initializeTabs(document.querySelector("[data-tabs]"));
  initializeFormShell(document.querySelector("#configuration-form"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApplication, { once: true });
} else {
  initializeApplication();
}
