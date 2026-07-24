import { createPalletModel, validatePalletModel } from "./models/pallet-model.js";

const PALLET_INPUTS = Object.freeze({
  emptyWeight: "emptyPalletWeight",
  height: "palletHeight",
  length: "palletLength",
  maximumLoadedHeight: "maximumLoadedHeight",
  maximumLoadedWeight: "maximumLoadedWeight",
  width: "palletWidth",
});

const PALLET_ERROR_IDS = Object.freeze({
  emptyWeight: "empty-pallet-weight-error",
  height: "pallet-height-error",
  length: "pallet-length-error",
  maximumLoadedHeight: "maximum-loaded-height-error",
  maximumLoadedWeight: "maximum-loaded-weight-error",
  width: "pallet-width-error",
});

/**
 * Connects validated form input to application state. Invalid edits stay in
 * the form while the last valid pallet model remains active in the workspace.
 */
export function initializeFormShell(form, options = {}) {
  if (!form) {
    return Object.freeze({ destroy() {} });
  }

  const status = form.querySelector("#form-status");
  let lastValidPallet = createPalletModel(options.initialPallet);

  function readPalletCandidate() {
    return Object.fromEntries(
      Object.entries(PALLET_INPUTS).map(([property, inputName]) => [
        property,
        form.elements.namedItem(inputName)?.value,
      ]),
    );
  }

  function displayValidation(errors) {
    Object.entries(PALLET_INPUTS).forEach(([property, inputName]) => {
      const input = form.elements.namedItem(inputName);
      const message = form.querySelector(`#${PALLET_ERROR_IDS[property]}`);
      const error = errors[property] ?? "";

      input?.setAttribute("aria-invalid", String(Boolean(error)));

      if (message) {
        message.textContent = error;
      }
    });
  }

  function handleInput(event) {
    status.textContent = "Configuration updated. Ready to generate.";
    status.classList.remove("is-notice", "is-error");

    if (!event.target.matches("[data-pallet-field]")) {
      return;
    }

    const result = validatePalletModel(readPalletCandidate());
    displayValidation(result.errors);

    if (!result.isValid) {
      status.textContent = "Correct the highlighted pallet values.";
      status.classList.add("is-error");
      return;
    }

    lastValidPallet = createPalletModel(result.value);
    options.onPalletChange?.(lastValidPallet);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validatePalletModel(readPalletCandidate());
    displayValidation(result.errors);

    if (!result.isValid) {
      status.textContent = "Correct the highlighted pallet values.";
      status.classList.remove("is-notice");
      status.classList.add("is-error");
      return;
    }

    status.textContent = "Layout generation will be connected in the next phase.";
    status.classList.remove("is-error");
    status.classList.add("is-notice");
  }

  form.addEventListener("input", handleInput);
  form.addEventListener("submit", handleSubmit);
  displayValidation({});

  return Object.freeze({
    getLastValidPallet() {
      return lastValidPallet;
    },
    destroy() {
      form.removeEventListener("input", handleInput);
      form.removeEventListener("submit", handleSubmit);
    },
  });
}
