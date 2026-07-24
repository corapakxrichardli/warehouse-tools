export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 4;

export function clampZoom(zoom, minimum = MIN_ZOOM, maximum = MAX_ZOOM) {
  if (!Number.isFinite(zoom)) {
    throw new TypeError("Zoom must be a finite number.");
  }

  return Math.min(maximum, Math.max(minimum, zoom));
}

export function createViewportState(initial = {}) {
  return Object.freeze({
    panX: Number.isFinite(initial.panX) ? initial.panX : 0,
    panY: Number.isFinite(initial.panY) ? initial.panY : 0,
    zoom: clampZoom(Number.isFinite(initial.zoom) ? initial.zoom : 1),
  });
}

export function setViewportZoom(viewport, zoom) {
  return createViewportState({ ...viewport, zoom: clampZoom(zoom) });
}

/**
 * Zooms around an SVG-space point so the content beneath the pointer remains
 * stationary.
 */
export function zoomViewportAtPoint(viewport, requestedZoom, point) {
  const nextZoom = clampZoom(requestedZoom);
  const currentZoom = viewport.zoom;
  const panX = point.x - ((point.x - viewport.panX) / currentZoom) * nextZoom;
  const panY = point.y - ((point.y - viewport.panY) / currentZoom) * nextZoom;

  return createViewportState({ panX, panY, zoom: nextZoom });
}

export function panViewport(viewport, deltaX, deltaY) {
  return createViewportState({
    ...viewport,
    panX: viewport.panX + deltaX,
    panY: viewport.panY + deltaY,
  });
}

export function resetViewport() {
  return createViewportState();
}
