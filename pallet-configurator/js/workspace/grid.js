export const MAJOR_GRID_INTERVAL = 12;

/**
 * Minor grid detail adapts to effective pixels per inch after zoom.
 */
export function calculateGridIntervals(pixelsPerInch, zoom = 1) {
  const effectiveScale = pixelsPerInch * zoom;

  if (!Number.isFinite(effectiveScale) || effectiveScale <= 0) {
    throw new RangeError("Effective grid scale must be greater than zero.");
  }

  let minorInterval = null;

  if (effectiveScale >= 8) {
    minorInterval = 1;
  } else if (effectiveScale >= 4) {
    minorInterval = 6;
  }

  return Object.freeze({
    majorInterval: MAJOR_GRID_INTERVAL,
    minorInterval,
  });
}

export function createGridPositions(dimension, interval) {
  if (!Number.isFinite(dimension) || dimension <= 0) {
    throw new RangeError("Grid dimension must be greater than zero.");
  }

  if (!Number.isFinite(interval) || interval <= 0) {
    throw new RangeError("Grid interval must be greater than zero.");
  }

  const positions = [];

  for (let position = 0; position <= dimension + Number.EPSILON; position += interval) {
    positions.push(Math.min(position, dimension));
  }

  return positions;
}

export function calculateRulerInterval(pixelsPerInch, zoom = 1) {
  const effectiveScale = pixelsPerInch * zoom;

  if (effectiveScale >= 8) {
    return 1;
  }

  if (effectiveScale >= 4) {
    return 2;
  }

  return 6;
}
