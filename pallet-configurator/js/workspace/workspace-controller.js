import { createPalletModel, updatePalletModel } from "../models/pallet-model.js";
import { cartonToRectangle } from "./geometry.js";
import { createSvgRenderer } from "./svg-renderer.js";
import {
  createViewportState,
  panViewport,
  resetViewport,
  zoomViewportAtPoint,
} from "./viewport.js";

const ZOOM_STEP = 1.2;

function formatMeasurement(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeCartons(cartons) {
  if (!Array.isArray(cartons)) {
    throw new TypeError("Cartons must be supplied as an array.");
  }

  return cartons.map((carton, index) => {
    const normalized = Object.freeze({
      ...carton,
      length: Number(carton.length),
      rotated: Boolean(carton.rotated),
      width: Number(carton.width),
      x: Number(carton.x),
      y: Number(carton.y),
    });

    try {
      cartonToRectangle(normalized, 1);
    } catch (error) {
      throw new RangeError(`Invalid carton at index ${index}: ${error.message}`);
    }

    return normalized;
  });
}

function updatePalletSummary(root, pallet) {
  const values = {
    footprint: `${formatMeasurement(pallet.length)} × ${formatMeasurement(
      pallet.width,
    )} in`,
    height: `${formatMeasurement(pallet.height)} in`,
    maximumLoadedHeight: `${formatMeasurement(pallet.maximumLoadedHeight)} in`,
    maximumLoadedWeight: `${formatMeasurement(pallet.maximumLoadedWeight)} lb`,
  };

  Object.entries(values).forEach(([name, value]) => {
    const output = root.querySelector(`[data-pallet-spec="${name}"]`);

    if (output) {
      output.textContent = value;
    }
  });
}

/**
 * Initializes the reusable 2D workspace and returns its public API.
 *
 * Pan and zoom are view transforms only. Pallet and carton coordinates remain
 * in inches with origin (0, 0) at the pallet's top-left.
 */
export function initializeWorkspace(container, options = {}) {
  if (!container) {
    throw new TypeError("A workspace root element is required.");
  }

  const canvas = container.querySelector("[data-workspace-canvas]") ?? container;
  const renderer = createSvgRenderer(canvas);
  const svg = renderer.element;
  const gridButton = container.querySelector('[data-workspace-action="toggle-grid"]');
  const zoomOutput = container.querySelector("[data-workspace-zoom]");
  const cleanupTasks = [];
  let pallet = createPalletModel(options.pallet);
  let cartons = normalizeCartons(options.cartons ?? []);
  let gridVisible = options.gridVisible ?? true;
  let viewport = createViewportState({ zoom: options.zoom ?? 1 });
  let destroyed = false;
  let panSession = null;

  function getCanvasSize() {
    const bounds = canvas.getBoundingClientRect();
    return {
      height: Math.max(280, Math.round(bounds.height)),
      width: Math.max(280, Math.round(bounds.width)),
    };
  }

  function synchronizeControls() {
    if (gridButton) {
      gridButton.setAttribute("aria-pressed", String(gridVisible));
      gridButton.classList.toggle("is-active", gridVisible);
      const label = gridButton.querySelector("[data-grid-label]");

      if (label) {
        label.textContent = gridVisible ? "Grid on" : "Grid off";
      }
    }

    if (zoomOutput) {
      zoomOutput.textContent = `${Math.round(viewport.zoom * 100)}%`;
    }

    container.classList.toggle("has-cartons", cartons.length > 0);
  }

  function notifyWorkspaceState() {
    options.onWorkspaceChange?.({
      gridVisible,
      zoom: viewport.zoom,
    });
  }

  function render() {
    if (destroyed) {
      return;
    }

    renderer.render({
      cartons,
      gridVisible,
      pallet,
      size: getCanvasSize(),
      viewport,
    });
    updatePalletSummary(container, pallet);
    synchronizeControls();
  }

  function zoomAroundCenter(nextZoom) {
    const size = getCanvasSize();
    viewport = zoomViewportAtPoint(viewport, nextZoom, {
      x: size.width / 2,
      y: size.height / 2,
    });
    render();
    notifyWorkspaceState();
  }

  function addListener(target, eventName, handler, eventOptions) {
    target?.addEventListener(eventName, handler, eventOptions);
    cleanupTasks.push(() =>
      target?.removeEventListener(eventName, handler, eventOptions),
    );
  }

  container.querySelectorAll("[data-workspace-action]").forEach((button) => {
    addListener(button, "click", () => {
      const action = button.dataset.workspaceAction;

      if (action === "toggle-grid") {
        gridVisible = !gridVisible;
        render();
        notifyWorkspaceState();
      }

      if (action === "zoom-in") {
        zoomAroundCenter(viewport.zoom * ZOOM_STEP);
      }

      if (action === "zoom-out") {
        zoomAroundCenter(viewport.zoom / ZOOM_STEP);
      }

      if (action === "reset") {
        viewport = resetViewport();
        render();
        notifyWorkspaceState();
      }
    });
  });

  addListener(
    svg,
    "wheel",
    (event) => {
      event.preventDefault();
      const bounds = svg.getBoundingClientRect();
      const point = {
        x: ((event.clientX - bounds.left) / bounds.width) * getCanvasSize().width,
        y: ((event.clientY - bounds.top) / bounds.height) * getCanvasSize().height,
      };
      const factor = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      viewport = zoomViewportAtPoint(viewport, viewport.zoom * factor, point);
      render();
      notifyWorkspaceState();
    },
    { passive: false },
  );

  addListener(svg, "pointerdown", (event) => {
    if (event.button !== 0 || event.target.dataset.panSurface !== "true") {
      return;
    }

    panSession = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    svg.setPointerCapture(event.pointerId);
    svg.classList.add("is-panning");
  });

  addListener(svg, "pointermove", (event) => {
    if (!panSession || panSession.pointerId !== event.pointerId) {
      return;
    }

    const bounds = svg.getBoundingClientRect();
    const size = getCanvasSize();
    const deltaX = ((event.clientX - panSession.x) / bounds.width) * size.width;
    const deltaY = ((event.clientY - panSession.y) / bounds.height) * size.height;
    viewport = panViewport(viewport, deltaX, deltaY);
    panSession.x = event.clientX;
    panSession.y = event.clientY;
    render();
  });

  function endPan(event) {
    if (!panSession || panSession.pointerId !== event.pointerId) {
      return;
    }

    panSession = null;
    svg.classList.remove("is-panning");
    notifyWorkspaceState();
  }

  addListener(svg, "pointerup", endPan);
  addListener(svg, "pointercancel", endPan);

  const resizeObserver =
    typeof ResizeObserver === "function" ? new ResizeObserver(render) : null;

  if (resizeObserver) {
    resizeObserver.observe(canvas);
    cleanupTasks.push(() => resizeObserver.disconnect());
  } else {
    addListener(window, "resize", render);
  }

  render();

  return Object.freeze({
    setPalletModel(nextPallet) {
      pallet = createPalletModel(nextPallet);
      render();
      return pallet;
    },

    setPalletDimensions(length, width) {
      pallet = updatePalletModel(pallet, { length, width });
      render();
      return pallet;
    },

    setGridVisible(visible) {
      gridVisible = Boolean(visible);
      render();
      notifyWorkspaceState();
    },

    setCartons(nextCartons) {
      cartons = normalizeCartons(nextCartons);
      render();
      return [...cartons];
    },

    clearCartons() {
      cartons = [];
      render();
    },

    setZoom(zoom) {
      zoomAroundCenter(Number(zoom));
      return viewport.zoom;
    },

    resetView() {
      viewport = resetViewport();
      render();
      notifyWorkspaceState();
    },

    getState() {
      return Object.freeze({
        cartons: Object.freeze([...cartons]),
        gridVisible,
        pallet,
        viewport,
      });
    },

    destroy() {
      destroyed = true;
      cleanupTasks.forEach((cleanup) => cleanup());
      renderer.destroy();
    },
  });
}
