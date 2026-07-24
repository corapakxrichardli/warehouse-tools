# Architecture

The Pallet Configurator is a frontend-only ES module application. It has no
backend, authentication, database, build step, or runtime dependency.

## Current module flow

```text
HTML form
  ↓ validated pallet values
Application store
  ↓ canonical pallet model
Workspace controller
  ├── viewport state (zoom and pan)
  ├── grid intervals
  ├── pallet/carton geometry
  └── SVG renderer
```

Rendering modules consume structured data and do not perform pallet packing.
Future packing, 3D, statistics, and export modules should consume the same
pallet model rather than reading values directly from the DOM.

## Pallet model

The canonical pallet model is defined in
`pallet-configurator/js/models/pallet-model.js`:

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

Dimensions are stored in inches and weights in pounds.

`maximumLoadedHeight` includes the physical pallet. The space available for
cartons is:

```text
usable stack height = maximum loaded height - pallet height
                    = 85 in - 6 in
                    = 79 in
```

`maximumLoadedWeight` includes the empty pallet weight. Milestone 1.5 stores and
validates these limits but does not calculate carton layers or loaded weight.

## 2D coordinate system

The SVG workspace uses pallet-space coordinates measured in inches:

- Origin `(0, 0)` is the pallet's top-left corner.
- `x` increases from left to right.
- `y` increases from top to bottom.
- Carton `length` is the horizontal footprint before rotation.
- Carton `width` is the vertical footprint before rotation.
- A rotated carton swaps its rendered length and width.

A future carton placement can be rendered from:

```js
{
  x: 0,
  y: 0,
  length: 12,
  width: 10,
  rotated: false
}
```

Geometry functions convert inches to SVG coordinates only at render time.
Zooming and panning apply SVG view transforms and never modify pallet-space
data.

## SVG workspace modules

- `workspace-controller.js` owns interaction wiring and exposes the public API.
- `svg-renderer.js` renders the pallet, grid, rulers, dimensions, and cartons.
- `geometry.js` contains DOM-free coordinate and rectangle conversions.
- `grid.js` selects grid and ruler intervals from the effective visual scale.
- `viewport.js` contains DOM-free zoom, pan, clamping, and reset operations.
- `pallet-model.js` owns pallet defaults and validation.
- `application-state.js` owns immutable application state transitions.

The controller observes container resizing. At the default view, geometry is
re-fitted and centered while preserving physical aspect ratio. Wheel zoom is
centered around the pointer. Toolbar zoom is centered in the viewport. Panning
starts only when the empty SVG workspace background is dragged.

## Future flow

```text
Validated application state
  ↓
Packing engine
  ↓ structured layout data
2D SVG renderer / future 3D renderer
  ↓
Statistics and export tools
```

The packing engine must remain independent of the DOM and rendering modules.
Future backend functionality may be introduced for saved layouts or
integrations, but it is not required by the current architecture.
