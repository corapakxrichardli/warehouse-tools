/**
 * Optional renderer smoke test, activated only with `?demo=1`.
 * These cartons are never part of normal application state or layout output.
 */
const DEMO_CARTONS = Object.freeze([
  Object.freeze({ x: 0, y: 0, length: 16, width: 10, rotated: false }),
  Object.freeze({ x: 16, y: 0, length: 16, width: 10, rotated: false }),
  Object.freeze({ x: 32, y: 0, length: 10, width: 16, rotated: true }),
  Object.freeze({ x: 0, y: 10, length: 12, width: 15, rotated: false }),
  Object.freeze({ x: 12, y: 10, length: 12, width: 15, rotated: false }),
  Object.freeze({ x: 24, y: 10, length: 15, width: 12, rotated: true }),
]);

export function getDevelopmentCartons() {
  return DEMO_CARTONS.map((carton) => ({ ...carton }));
}
