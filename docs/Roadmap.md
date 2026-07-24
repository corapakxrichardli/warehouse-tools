# Development Roadmap

## Completed foundations

### Phase 1 — Project setup

- [x] Documentation
- [x] Repository structure
- [x] Frontend-only application boundary

### Milestone 1 — Application shell

- [x] Responsive three-panel interface
- [x] Pallet and carton inputs
- [x] Statistics placeholders
- [x] Tabbed lower workspace
- [x] Accessible, warehouse-friendly visual system

## Active milestone

### Milestone 1.5 — Interactive 2D workspace foundation

- [x] Canonical physical pallet model
- [x] Editable pallet height and empty weight
- [x] Inline pallet validation with last-valid-model behavior
- [x] Responsive proportional SVG pallet
- [x] Inch grid with adaptive detail
- [x] Edge rulers and dimension labels
- [x] Pallet specification summary
- [x] Bounded zoom, reset, and background panning
- [x] Public carton-rendering API
- [x] Optional `?demo=1` renderer preview
- [x] DOM-free model, geometry, grid, viewport, and state tests

Milestone 1.5 establishes the interface and renderer only. It does not generate
or pack cartons.

## Upcoming

### Phase 3 — Packing engine

- Automatic layout generation
- Rotation-aware placement
- Multiple layout options
- Boundary, height, and weight validation
- Deterministic results and layout deduplication

### Phase 4 — Generated 2D layouts

- Connect packing results to the SVG renderer
- Layer Viewer
- Layout comparison

### Phase 5 — 3D visualization

- Interactive camera
- Layer highlighting

### Phase 6 — Free-design mode

- Drag
- Rotate
- Duplicate
- Delete
- Snap to grid

### Phase 7 — Export

- PDF
- PNG
- Print

### Phase 8 — Persistence

- Save and load layouts
- Customer library

### Phase 9 — Integrations

- Odoo
- AI optimization
- SKU database
