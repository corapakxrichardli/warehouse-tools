# Pallet Configurator

Frontend application shell for the first Corapak Warehouse Tools utility.

## Run locally

Serve this directory with any static HTTP server, then open the local URL in a
browser. For example:

```sh
python3 -m http.server 8000 --directory pallet-configurator
```

## Structure

```text
pallet-configurator/
├── index.html          Semantic application markup
├── styles.css          Design tokens, components, and responsive layout
├── script.js           Application entry point
└── js/
    ├── form-shell.js   Presentation-only form behavior
    └── tabs.js         Accessible tab controller
```

The application currently contains no pallet calculations. Future packing,
SVG, 3D, and export modules can be initialized from `script.js` while keeping
their domain logic separate from the UI controllers.
