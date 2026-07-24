/**
 * Canonical pallet defaults in warehouse units (inches and pounds).
 * Every application module receives pallet data from this model.
 */
export const DEFAULT_PALLET = Object.freeze({
  length: 48,
  width: 40,
  height: 6,
  emptyWeight: 50,
  maximumLoadedHeight: 85,
  maximumLoadedWeight: 1000,
});

const POSITIVE_FIELDS = [
  "length",
  "width",
  "height",
  "maximumLoadedHeight",
  "maximumLoadedWeight",
];

const PALLET_FIELDS = [...POSITIVE_FIELDS, "emptyWeight"];

function toNumber(value) {
  if (typeof value === "string" && value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}

/**
 * Validates and normalizes pallet-like data without touching the DOM.
 */
export function validatePalletModel(candidate) {
  const value = Object.fromEntries(
    PALLET_FIELDS.map((field) => [field, toNumber(candidate?.[field])]),
  );
  const errors = {};

  POSITIVE_FIELDS.forEach((field) => {
    if (!Number.isFinite(value[field]) || value[field] <= 0) {
      errors[field] = "Enter a finite number greater than zero.";
    }
  });

  if (!Number.isFinite(value.emptyWeight) || value.emptyWeight < 0) {
    errors.emptyWeight = "Enter a finite number greater than or equal to zero.";
  }

  if (
    !errors.height
    && !errors.maximumLoadedHeight
    && value.maximumLoadedHeight <= value.height
  ) {
    errors.maximumLoadedHeight = "Must be greater than the pallet height.";
  }

  if (
    !errors.emptyWeight
    && !errors.maximumLoadedWeight
    && value.maximumLoadedWeight < value.emptyWeight
  ) {
    errors.maximumLoadedWeight = "Must be at least the empty pallet weight.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    value,
  };
}

/**
 * Creates an immutable, validated pallet model.
 */
export function createPalletModel(overrides = {}) {
  const result = validatePalletModel({ ...DEFAULT_PALLET, ...overrides });

  if (!result.isValid) {
    const message = Object.entries(result.errors)
      .map(([field, error]) => `${field}: ${error}`)
      .join(" ");

    throw new RangeError(`Invalid pallet model. ${message}`);
  }

  return Object.freeze(result.value);
}

/**
 * Returns a new pallet model while preserving fields not included in the patch.
 */
export function updatePalletModel(currentPallet, updates) {
  return createPalletModel({ ...currentPallet, ...updates });
}

/**
 * Height available for cartons. Loaded height includes the physical pallet.
 */
export function usableStackHeight(pallet) {
  const model = createPalletModel(pallet);
  return model.maximumLoadedHeight - model.height;
}
