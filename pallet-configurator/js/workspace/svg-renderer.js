import {
  cartonToRectangle,
  fitPalletToViewport,
  inchesToSvg,
} from "./geometry.js";
import {
  calculateGridIntervals,
  calculateRulerInterval,
  createGridPositions,
  MAJOR_GRID_INTERVAL,
} from "./grid.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
let rendererSequence = 0;

function createSvgElement(tagName, attributes = {}, textContent = "") {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function appendLine(parent, attributes, className) {
  const line = createSvgElement("line", attributes);
  line.setAttribute("class", className);
  parent.append(line);
}

function isMajorPosition(position) {
  const nearestMajor = Math.round(position / MAJOR_GRID_INTERVAL) * MAJOR_GRID_INTERVAL;
  return Math.abs(position - nearestMajor) < 0.0001;
}

function renderGrid(parent, pallet, geometry, zoom) {
  const intervals = calculateGridIntervals(geometry.scale, zoom);
  const gridGroup = createSvgElement("g", {
    class: "svg-grid",
    "clip-path": `url(#${geometry.clipPathId})`,
    "pointer-events": "none",
  });

  if (intervals.minorInterval) {
    createGridPositions(pallet.length, intervals.minorInterval)
      .filter((position) => !isMajorPosition(position))
      .forEach((position) => {
        const x = geometry.x + inchesToSvg(position, geometry.scale);
        appendLine(
          gridGroup,
          { x1: x, x2: x, y1: geometry.y, y2: geometry.y + geometry.height },
          "svg-grid__line svg-grid__line--minor",
        );
      });

    createGridPositions(pallet.width, intervals.minorInterval)
      .filter((position) => !isMajorPosition(position))
      .forEach((position) => {
        const y = geometry.y + inchesToSvg(position, geometry.scale);
        appendLine(
          gridGroup,
          { x1: geometry.x, x2: geometry.x + geometry.width, y1: y, y2: y },
          "svg-grid__line svg-grid__line--minor",
        );
      });
  }

  createGridPositions(pallet.length, intervals.majorInterval).forEach((position) => {
    const x = geometry.x + inchesToSvg(position, geometry.scale);
    appendLine(
      gridGroup,
      { x1: x, x2: x, y1: geometry.y, y2: geometry.y + geometry.height },
      "svg-grid__line svg-grid__line--major",
    );
  });

  createGridPositions(pallet.width, intervals.majorInterval).forEach((position) => {
    const y = geometry.y + inchesToSvg(position, geometry.scale);
    appendLine(
      gridGroup,
      { x1: geometry.x, x2: geometry.x + geometry.width, y1: y, y2: y },
      "svg-grid__line svg-grid__line--major",
    );
  });

  parent.append(gridGroup);
}

function renderPalletSurface(parent, pallet, geometry) {
  const surface = createSvgElement("rect", {
    class: "svg-pallet__surface",
    height: geometry.height,
    rx: 2,
    width: geometry.width,
    x: geometry.x,
    y: geometry.y,
  });
  parent.append(surface);

  const slats = createSvgElement("g", {
    class: "svg-pallet__slats",
    "clip-path": `url(#${geometry.clipPathId})`,
    "pointer-events": "none",
  });
  const slatInterval = pallet.length >= 24 ? 8 : Math.max(1, pallet.length / 6);

  createGridPositions(pallet.length, slatInterval)
    .slice(1, -1)
    .forEach((position) => {
      const x = geometry.x + inchesToSvg(position, geometry.scale);
      appendLine(
        slats,
        { x1: x, x2: x, y1: geometry.y, y2: geometry.y + geometry.height },
        "svg-pallet__slat",
      );
    });

  parent.append(slats);
}

function renderRulers(parent, pallet, geometry, zoom) {
  const rulerGroup = createSvgElement("g", {
    class: "svg-rulers",
    "pointer-events": "none",
  });
  const interval = calculateRulerInterval(geometry.scale, zoom);

  createGridPositions(pallet.length, interval).forEach((position) => {
    const x = geometry.x + inchesToSvg(position, geometry.scale);
    const isMajor = isMajorPosition(position);
    appendLine(
      rulerGroup,
      {
        x1: x,
        x2: x,
        y1: geometry.y,
        y2: geometry.y - (isMajor ? 9 : 5),
      },
      isMajor ? "svg-ruler__tick svg-ruler__tick--major" : "svg-ruler__tick",
    );

    if (isMajor && position > 0 && position < pallet.length) {
      rulerGroup.append(
        createSvgElement(
          "text",
          {
            class: "svg-ruler__label",
            "text-anchor": "middle",
            x,
            y: geometry.y - 13,
          },
          String(position),
        ),
      );
    }
  });

  createGridPositions(pallet.width, interval).forEach((position) => {
    const y = geometry.y + inchesToSvg(position, geometry.scale);
    const isMajor = isMajorPosition(position);
    appendLine(
      rulerGroup,
      {
        x1: geometry.x,
        x2: geometry.x - (isMajor ? 9 : 5),
        y1: y,
        y2: y,
      },
      isMajor ? "svg-ruler__tick svg-ruler__tick--major" : "svg-ruler__tick",
    );

    if (isMajor && position > 0 && position < pallet.width) {
      rulerGroup.append(
        createSvgElement(
          "text",
          {
            class: "svg-ruler__label",
            "dominant-baseline": "middle",
            "text-anchor": "end",
            x: geometry.x - 13,
            y,
          },
          String(position),
        ),
      );
    }
  });

  parent.append(rulerGroup);
}

function formatDimension(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function renderDimensions(parent, pallet, geometry) {
  const dimensionGroup = createSvgElement("g", {
    class: "svg-dimensions",
    "pointer-events": "none",
  });
  const horizontalY = geometry.y + geometry.height + 27;
  const verticalX = geometry.x - 31;

  appendLine(
    dimensionGroup,
    {
      "marker-end": `url(#${geometry.arrowMarkerId})`,
      "marker-start": `url(#${geometry.arrowMarkerId})`,
      x1: geometry.x + 3,
      x2: geometry.x + geometry.width - 3,
      y1: horizontalY,
      y2: horizontalY,
    },
    "svg-dimension__line",
  );
  dimensionGroup.append(
    createSvgElement(
      "text",
      {
        class: "svg-dimension__label",
        "text-anchor": "middle",
        x: geometry.x + geometry.width / 2,
        y: horizontalY - 7,
      },
      `${formatDimension(pallet.length)} in`,
    ),
  );

  appendLine(
    dimensionGroup,
    {
      "marker-end": `url(#${geometry.arrowMarkerId})`,
      "marker-start": `url(#${geometry.arrowMarkerId})`,
      x1: verticalX,
      x2: verticalX,
      y1: geometry.y + 3,
      y2: geometry.y + geometry.height - 3,
    },
    "svg-dimension__line",
  );

  const verticalLabel = createSvgElement(
    "text",
    {
      class: "svg-dimension__label",
      "text-anchor": "middle",
      transform: `rotate(-90 ${verticalX + 8} ${geometry.y + geometry.height / 2})`,
      x: verticalX + 8,
      y: geometry.y + geometry.height / 2 - 7,
    },
    `${formatDimension(pallet.width)} in`,
  );
  dimensionGroup.append(verticalLabel);
  parent.append(dimensionGroup);
}

function renderCartons(parent, cartons, geometry) {
  const cartonGroup = createSvgElement("g", {
    class: "svg-cartons",
    "clip-path": `url(#${geometry.clipPathId})`,
  });

  cartons.forEach((carton, index) => {
    const rectangle = cartonToRectangle(carton, geometry.scale, geometry);
    const cartonElement = createSvgElement("g", { class: "svg-carton" });
    const rect = createSvgElement("rect", {
      class: rectangle.rotated
        ? "svg-carton__shape svg-carton__shape--rotated"
        : "svg-carton__shape",
      height: rectangle.height,
      width: rectangle.width,
      x: rectangle.x,
      y: rectangle.y,
    });
    const title = createSvgElement(
      "title",
      {},
      `${carton.label ?? `Carton ${index + 1}`}: ${carton.length} × ${carton.width} inches${
        rectangle.rotated ? ", rotated" : ""
      }`,
    );
    rect.append(title);
    cartonElement.append(rect);

    if (rectangle.width >= 30 && rectangle.height >= 20) {
      cartonElement.append(
        createSvgElement(
          "text",
          {
            class: "svg-carton__label",
            "dominant-baseline": "middle",
            "text-anchor": "middle",
            x: rectangle.x + rectangle.width / 2,
            y: rectangle.y + rectangle.height / 2,
          },
          rectangle.rotated ? "R" : String(index + 1),
        ),
      );
    }

    cartonGroup.append(cartonElement);
  });

  parent.append(cartonGroup);
}

/**
 * DOM-specific SVG renderer. It consumes scene data and performs no placement
 * or pallet calculations.
 */
export function createSvgRenderer(container) {
  if (!container) {
    throw new TypeError("An SVG workspace container is required.");
  }

  const instanceId = ++rendererSequence;
  const titleId = `pallet-workspace-title-${instanceId}`;
  const descriptionId = `pallet-workspace-description-${instanceId}`;
  const clipPathId = `pallet-workspace-clip-${instanceId}`;
  const arrowMarkerId = `pallet-workspace-arrow-${instanceId}`;
  const svg = createSvgElement("svg", {
    "aria-labelledby": `${titleId} ${descriptionId}`,
    class: "workspace-svg",
    focusable: "false",
    preserveAspectRatio: "xMidYMid meet",
    role: "img",
  });
  container.replaceChildren(svg);

  function render({ cartons, gridVisible, pallet, size, viewport }) {
    const geometry = {
      ...fitPalletToViewport(pallet, size.width, size.height),
      arrowMarkerId,
      clipPathId,
    };
    const title = createSvgElement(
      "title",
      { id: titleId },
      `Top view of a ${formatDimension(pallet.length)} by ${formatDimension(
        pallet.width,
      )} inch pallet`,
    );
    const description = createSvgElement(
      "desc",
      { id: descriptionId },
      cartons.length
        ? `${cartons.length} demonstration carton placements shown. Pallet-space origin is the top-left corner.`
        : "Empty pallet workspace. Pallet-space origin is the top-left corner; x increases right and y increases down.",
    );
    const definitions = createSvgElement("defs");
    const clipPath = createSvgElement("clipPath", { id: clipPathId });
    clipPath.append(
      createSvgElement("rect", {
        height: geometry.height,
        width: geometry.width,
        x: geometry.x,
        y: geometry.y,
      }),
    );
    const arrowMarker = createSvgElement("marker", {
      id: arrowMarkerId,
      markerHeight: 6,
      markerWidth: 6,
      orient: "auto-start-reverse",
      refX: 3,
      refY: 3,
      viewBox: "0 0 6 6",
    });
    arrowMarker.append(createSvgElement("path", { d: "M6 0 0 3l6 3Z" }));
    definitions.append(clipPath, arrowMarker);

    const background = createSvgElement("rect", {
      class: "workspace-svg__background",
      "data-pan-surface": "true",
      height: size.height,
      width: size.width,
      x: 0,
      y: 0,
    });
    const scene = createSvgElement("g", {
      class: "workspace-svg__scene",
      transform: `translate(${viewport.panX} ${viewport.panY}) scale(${viewport.zoom})`,
    });
    const palletShadow = createSvgElement("rect", {
      class: "svg-pallet__shadow",
      height: geometry.height,
      rx: 3,
      width: geometry.width,
      x: geometry.x,
      y: geometry.y + 3,
    });

    scene.append(palletShadow);
    renderPalletSurface(scene, pallet, geometry);

    if (gridVisible) {
      renderGrid(scene, pallet, geometry, viewport.zoom);
    }

    renderCartons(scene, cartons, geometry);
    scene.append(
      createSvgElement("rect", {
        class: "svg-pallet__boundary",
        height: geometry.height,
        rx: 2,
        width: geometry.width,
        x: geometry.x,
        y: geometry.y,
      }),
    );
    renderRulers(scene, pallet, geometry, viewport.zoom);
    renderDimensions(scene, pallet, geometry);

    svg.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
    svg.replaceChildren(title, description, definitions, background, scene);
  }

  return Object.freeze({
    element: svg,
    render,
    destroy() {
      svg.remove();
    },
  });
}
