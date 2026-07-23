/**
 * Handles presentation-only form behavior.
 * Calculation and packing responsibilities belong to future domain modules.
 */
export function initializeFormShell(form) {
  if (!form) {
    return;
  }

  const status = form.querySelector("#form-status");

  form.addEventListener("input", () => {
    status.textContent = "Configuration updated. Ready to generate.";
    status.classList.remove("is-notice");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "Layout generation will be connected in the next phase.";
    status.classList.add("is-notice");
  });
}
