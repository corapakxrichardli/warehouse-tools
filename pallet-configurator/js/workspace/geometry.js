const DEFAULT_MARGINS = Object.freeze({
  top: 48,
  right: 42,
  bottom: 52,
  left: 58,
});

function requireFinite(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function requirePositive(value, name) {
  requireFinite(value, name);

  if (value <= 0) {
    throw new RangeError(`${name} must be greater than zero.`);
  }
}

export function inchesToSvg(inches, pixelsPerInch) {
  requireFinite(inches, "Inches");
  requirePositive(pixelsPerInch, "Pixels per inch");
  return inches * pixelsPerInch;
}

export function getPalletAspectRatio(length, width) {
  requirePositive(length, "Pallet length");
  requirePositive(width, "Pallet width");
  return length / width;
}

/**
 * Fits the pallet proportionally inside an SVG viewport. Returned x/y are SVG
 * coordinates; pallet-space remains measured in inches.
 */
export function fitPalletToViewport(
  pallet,
  viewportWidth,
  viewportHeight,
  margins = DEFAULT_MARGINS,
) {
  requirePositive(pallet?.length, "Pallet length");
  requirePositive(pallet?.width, "Pallet width");
  requirePositive(viewportWidth, "Viewport width");
  requirePositive(viewportHeight, "Viewport height");

  const resolvedMargins = { ...DEFAULT_MARGINS, ...margins };
  const availableWidth = viewportWidth - resolvedMargins.left - resolvedMargins.right;
  const availableHeight = viewportHeight - resolvedMargins.top - resolvedMargins.bottom;

  requirePositive(availableWidth, "Available viewport width");
  requirePositive(availableHeight, "Available viewport height");

  const scale = Math.min(
    availableWidth / pallet.length,
    availableHeight / pallet.width,
  );
  const width = inchesToSvg(pallet.length, scale);
  const height = inchesToSvg(pallet.width, scale);

  return Object.freeze({
    height,
    scale,
    width,
    x: resolvedMargins.left + (availableWidth - width) / 2,
    y: resolvedMargins.top + (availableHeight - height) / 2,
  });
}

export function getCartonFootprint(carton) {
  requirePositive(carton?.length, "Carton length");
  requirePositive(carton?.width, "Carton width");

  return carton.rotated
    ? { length: carton.width, width: carton.length }
    : { length: carton.length, width: carton.width };
}

/**
 * Converts a future placement record into an SVG rectangle. Pallet origin is
 * top-left: x grows right and y grows down.
 */
export function cartonToRectangle(carton, pixelsPerInch, origin = { x: 0, y: 0 }) {
  requireFinite(carton?.x, "Carton x");
  requireFinite(carton?.y, "Carton y");
  requirePositive(pixelsPerInch, "Pixels per inch");
  requireFinite(origin.x, "Origin x");
  requireFinite(origin.y, "Origin y");

  const footprint = getCartonFootprint(carton);

  return Object.freeze({
    height: inchesToSvg(footprint.width, pixelsPerInch),
    rotated: Boolean(carton.rotated),
    width: inchesToSvg(footprint.length, pixelsPerInch),
    x: origin.x + inchesToSvg(carton.x, pixelsPerInch),
    y: origin.y + inchesToSvg(carton.y, pixelsPerInch),
  });
}

export function cartonsToRectangles(cartons, pixelsPerInch, origin) {
  return (cartons ?? []).map((carton) =>
    cartonToRectangle(carton, pixelsPerInch, origin),
  );
}
