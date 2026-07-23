# Coding Guidelines

## General Principles

- Favor clear, maintainable code over clever shortcuts.
- Keep features modular and independently testable.
- Avoid unnecessary dependencies.
- Do not introduce a backend unless the feature genuinely requires one.
- Preserve existing behavior unless a change is explicitly requested.
- Keep the application usable without internet access whenever practical.

## Project Structure

- Keep HTML, CSS, and JavaScript separated.
- Place reusable JavaScript modules inside `pallet-configurator/js/`.
- Keep packing logic separate from rendering logic.
- Keep automatic layout generation separate from manual editing.
- Do not place substantial business logic directly in event handlers.

## JavaScript

- Use ES modules.
- Use descriptive function and variable names.
- Validate all numeric inputs.
- Avoid global mutable state.
- Document exported functions and non-obvious algorithms.
- Prefer small, focused functions.
- Return structured data rather than modifying the DOM from calculation modules.

## Geometry and Units

- Store dimensions internally in inches.
- Use consistent coordinate conventions throughout the application.
- Treat carton length and width as footprint dimensions.
- Treat carton height separately from the 2D packing engine.
- Use a small tolerance when comparing floating-point dimensions.
- Never allow cartons to overlap unless explicitly supported by a future feature.

## Packing Engine

- The packing engine must not depend on the DOM.
- Layout results should be deterministic for identical inputs.
- Every generated layout must include enough data for visualization and validation.
- Reject layouts that violate configured pallet boundaries, height, or weight limits.
- Deduplicate geometrically equivalent layouts.
- Do not describe a result as optimal unless the algorithm proves or exhaustively verifies it.

## Rendering

- Rendering modules should consume layout data and not perform packing calculations.
- Keep the 2D renderer independent from the future 3D renderer.
- Visual dimensions must remain proportional to real dimensions.
- Clearly distinguish rotated cartons.
- Maintain keyboard accessibility and readable labels.

## Testing

- Add tests for calculation and geometry modules.
- Include boundary cases, invalid inputs, rotation cases, and exact-fit cases.
- Use real warehouse examples when they become available.
- Never rely only on visual testing for packing calculations.

## Git Workflow

- Commit after each stable milestone.
- Use descriptive commit messages.
- Keep `main` in a usable state.
- Use feature branches for experimental or high-risk features.