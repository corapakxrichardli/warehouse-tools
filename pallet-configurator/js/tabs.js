/**
 * Creates an accessible tab interface with keyboard navigation.
 * This controller is deliberately view-only and owns no pallet data.
 */
export function initializeTabs(tabContainer) {
  if (!tabContainer) {
    return;
  }

  const tabs = [...tabContainer.querySelectorAll('[role="tab"]')];
  const panels = [...tabContainer.querySelectorAll('[role="tabpanel"]')];

  function activateTab(nextTab, { moveFocus = true } = {}) {
    tabs.forEach((tab) => {
      const isActive = tab === nextTab;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== nextTab.getAttribute("aria-controls");
    });

    if (moveFocus) {
      nextTab.focus();
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab, { moveFocus: false }));

    tab.addEventListener("keydown", (event) => {
      const navigationKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];

      if (!navigationKeys.includes(event.key)) {
        return;
      }

      event.preventDefault();

      let nextIndex = index;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      }

      if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      }

      if (event.key === "Home") {
        nextIndex = 0;
      }

      if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      activateTab(tabs[nextIndex]);
    });
  });
}
