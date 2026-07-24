# Pallet Configurator

Frontend application shell and interactive 2D pallet workspace for Corapak
Warehouse Tools. Milestone 1.5 contains no packing engine or backend.

## Run locally

Serve this directory with any static HTTP server, then open the local URL in a
browser:

```sh
python3 -m http.server 8000 --directory pallet-configurator
```

Open `http://localhost:8000/` for the normal application. Add `?demo=1` to
render development-only mock carton placements:

```text
http://localhost:8000/?demo=1
```

No development controls or mock cartons are exposed in the normal interface.

## Test

The test suite uses Node's built-in test runner and has no dependencies:

```sh
npm test
```

## Structure

```text
pallet-configurator/
├── index.html
├── styles.css
├── script.js
├── package.json
├── js/
│   ├── dev/
│   │   └── demo-layout.js
│   ├── models/
│   │   └── pallet-model.js
│   ├── state/
│   │   └── application-state.js
│   ├── workspace/
│   │   ├── geometry.js
│   │   ├── grid.js
│   │   ├── svg-renderer.js
│   │   ├── viewport.js
│   │   └── workspace-controller.js
│   ├── form-shell.js
│   └── tabs.js
└── test/
    ├── application-state.test.js
    ├── geometry.test.js
    ├── grid.test.js
    ├── pallet-model.test.js
    └── viewport.test.js
```

## Pallet model

`js/models/pallet-model.js` is the single source of pallet defaults:

```js
{
  length: 48,
  width: 40,
  height: 6,
  emptyWeight: 50,
  maximumLoadedHeight: 85,
  maximumLoadedWeight: 1000
}
```

Loaded height includes the physical pallet. The default carton stack allowance
is `85 - 6 = 79 inches`. Loaded weight includes the empty pallet. This
milestone stores and validates those values but does not calculate layers,
carton totals, or loaded weight.

## Coordinate system

All pallet and carton geometry is stored in inches. Pallet origin `(0, 0)` is
the top-left corner, `x` increases right, and `y` increases down. SVG
coordinates are derived only during rendering. Pan and zoom never modify
pallet-space values.

Future carton placements use:

```js
{
  x: 0,
  y: 0,
  length: 12,
  width: 10,
  rotated: false
}
```

When `rotated` is true, the rendered footprint swaps `length` and `width`.

## Public workspace API

Import `initializeWorkspace` from
`js/workspace/workspace-controller.js`. It returns:

```js
{
  setPalletModel(pallet),
  setPalletDimensions(length, width),
  setGridVisible(visible),
  setCartons(cartons),
  clearCartons(),
  setZoom(zoom),
  resetView(),
  getState(),
  destroy()
}
```

`setCartons()` validates and renders supplied placement data but does not
generate positions. Invalid pallet or carton data is rejected before replacing
the current workspace state.

## Zoom and pan

- Zoom range: 50% to 400%.
- Mouse-wheel and trackpad zoom are centered around the pointer.
- Toolbar zoom is centered in the SVG viewport.
- Reset returns to 100% zoom, zero pan, and a centered proportional pallet.
- Panning begins only by dragging the empty workspace background.
- Grid detail responds to the effective visual scale.

## Known limitations

- No packing calculations or automatic carton placement.
- No carton selection, dragging, editing, or overlap validation.
- No generated layers, statistics, 3D rendering, saving, or exports.
- Rulers provide lightweight visual measurement and are not editable.
- Touch uses the same background drag interaction; dedicated multi-touch
  gestures are not implemented.
- The `?demo=1` placements are renderer fixtures, not valid packing results.
