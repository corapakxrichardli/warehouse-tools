import test from "node:test";
import assert from "node:assert/strict";

import {
  clampZoom,
  createViewportState,
  MAX_ZOOM,
  MIN_ZOOM,
  panViewport,
  resetViewport,
  zoomViewportAtPoint,
} from "../js/workspace/viewport.js";

test("viewport zoom respects minimum and maximum limits", () => {
  assert.equal(clampZoom(0.01), MIN_ZOOM);
  assert.equal(clampZoom(100), MAX_ZOOM);
  assert.equal(clampZoom(1.5), 1.5);
});

test("reset view returns default zoom and zero pan", () => {
  assert.deepEqual(resetViewport(), {
    panX: 0,
    panY: 0,
    zoom: 1,
  });
});

test("panning changes view state without changing zoom", () => {
  const viewport = panViewport(createViewportState(), 24, -10);

  assert.deepEqual(viewport, {
    panX: 24,
    panY: -10,
    zoom: 1,
  });
});

test("pointer-centered zoom keeps the pointed scene coordinate stationary", () => {
  const point = { x: 200, y: 100 };
  const viewport = zoomViewportAtPoint(createViewportState(), 2, point);
  const sceneXBefore = point.x;
  const sceneXAfter = viewport.panX + sceneXBefore * viewport.zoom;

  assert.equal(sceneXAfter, point.x);
  assert.equal(viewport.zoom, 2);
});
