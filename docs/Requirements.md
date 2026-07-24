# Pallet Configurator Requirements

## Pallet model

The default pallet is a physical 48 × 40 × 6 inch object weighing 50 pounds.

| Property | Default | Rule |
| --- | ---: | --- |
| Length | 48 in | Greater than zero |
| Width | 40 in | Greater than zero |
| Pallet height | 6 in | Greater than zero |
| Empty pallet weight | 50 lb | Greater than or equal to zero |
| Maximum loaded height | 85 in | Greater than pallet height |
| Maximum loaded weight | 1,000 lb | Greater than or equal to empty pallet weight |

Maximum loaded height includes the pallet and all cartons. The default usable
carton stack height is therefore:

```text
85 in - 6 in = 79 in
```

Maximum loaded weight includes the empty pallet and all cartons.

## Carton inputs

- Length
- Width
- Height
- Weight

Carton values are not packed or calculated during Milestone 1.5.

## Palletization options

- Allow Rotation
- Allow Overhang
- Alignment Method (future)

## 2D workspace foundation

The top-view workspace must:

- Use responsive SVG.
- Draw the pallet proportionally to its physical length and width.
- Keep the empty pallet centered at the reset view.
- Update from valid pallet length and width edits.
- Use pallet-space inches with a top-left origin.
- Offer an optional measurement grid.
- Show major grid lines every 12 inches.
- Show 1-inch minor lines when scale permits and simplify them when zoomed out.
- Display responsive edge rulers and dimension labels.
- Display the current footprint, pallet height, maximum loaded height, and
  maximum loaded weight.
- Support bounded pointer-centered wheel zoom, button zoom, reset, and
  background drag panning.
- Preserve real pallet and carton coordinates while the view changes.
- Render structured carton placement data through a public API.

The workspace has an empty state until layout data is supplied. A development
preview can supply mock cartons with `?demo=1`; it is not part of normal
application data.

## Workspace accessibility

- Toolbar controls use accessible native buttons.
- Grid state is exposed with `aria-pressed`.
- SVG provides an accessible title and description.
- Rotated demonstration cartons use a dashed outline and an `R` label in
  addition to color.
- Advanced pallet fields remain reachable through a native `details` control.
- Reduced-motion preferences are respected.

## Generated results (future)

- Boxes Per Layer
- Number of Layers
- Total Boxes
- Total Height
- Total Weight
- Pallet Utilization %
- Remaining Space

All result values remain placeholders in Milestone 1.5.

## Future visualization

- Generated top-view carton layouts
- Layer Viewer
- Interactive 3D View
- Manual carton editing

## Future features

- Automatic layout generation and comparison
- Saved layouts
- PDF and image export
- SKU Library
- Odoo integration
- AI layout optimization
