/*
 * survey/range module tests
 *
 * Behavior-level tests for the pure sensor-coverage module. Tests describe
 * what the module does — given a set of developed cells, a sensor range, and
 * a neighbor function, which cells should be promoted to `sighted` vs
 * `surveyed` — not how it does it. The neighbor function is injected so the
 * module has zero coupling to hex math, planet boundaries, or wrap logic.
 *
 * Test fixtures (line graph, hex ring builders) live at the bottom of the
 * file to keep the cases readable.
 */
import { describe, it, expect } from "vitest"
import { computeSensorCoverage } from "./range"

describe("computeSensorCoverage", () => {
  it("returns empty coverage when there are no developed cells", () => {
    const coverage = computeSensorCoverage(new Set(), 1, () => [])

    expect(coverage.autoSurveyed.size).toBe(0)
    expect(coverage.sighted.size).toBe(0)
  })

  it("auto-surveys all immediate neighbors of a developed cell at range 1", () => {
    const neighborsOf = graphNeighbors({
      D: ["A", "B", "C"],
    })

    const coverage = computeSensorCoverage(new Set(["D"]), 1, neighborsOf)

    expect(coverage.autoSurveyed.has("A")).toBe(true)
    expect(coverage.autoSurveyed.has("B")).toBe(true)
    expect(coverage.autoSurveyed.has("C")).toBe(true)
    expect(coverage.autoSurveyed.size).toBe(3)
    expect(coverage.sighted.size).toBe(0)
  })

  it("unions coverage across overlapping developed cells without including them", () => {
    // A --- D1 --- D2 --- C
    //       |       |
    //       B       D
    const neighborsOf = graphNeighbors({
      D1: ["A", "B", "D2"],
      D2: ["C", "D", "D1"],
      A: ["D1"],
      B: ["D1"],
      C: ["D2"],
      D: ["D2"],
    })

    const coverage = computeSensorCoverage(
      new Set(["D1", "D2"]),
      1,
      neighborsOf,
    )

    expect(coverage.autoSurveyed.has("A")).toBe(true)
    expect(coverage.autoSurveyed.has("B")).toBe(true)
    expect(coverage.autoSurveyed.has("C")).toBe(true)
    expect(coverage.autoSurveyed.has("D")).toBe(true)
    expect(coverage.autoSurveyed.has("D1")).toBe(false)
    expect(coverage.autoSurveyed.has("D2")).toBe(false)
    expect(coverage.autoSurveyed.size).toBe(4)
    expect(coverage.sighted.size).toBe(0)
  })

  it("handles cyclic adjacency (hex-grid wrap) without revisiting or miscounting distance", () => {
    // Ring of 6: A - B - C - D - E - F - A
    // From A at sensorRange = 2 we expect:
    //   autoSurveyed = {B, F}   (distance 1 via wrap on both sides)
    //   sighted      = {C, E}   (distance 2)
    //   uncovered    = {D}      (distance 3, beyond range)
    const neighborsOf = graphNeighbors({
      A: ["B", "F"],
      B: ["A", "C"],
      C: ["B", "D"],
      D: ["C", "E"],
      E: ["D", "F"],
      F: ["E", "A"],
    })

    const coverage = computeSensorCoverage(new Set(["A"]), 2, neighborsOf)

    expect(coverage.autoSurveyed.has("B")).toBe(true)
    expect(coverage.autoSurveyed.has("F")).toBe(true)
    expect(coverage.autoSurveyed.size).toBe(2)

    expect(coverage.sighted.has("C")).toBe(true)
    expect(coverage.sighted.has("E")).toBe(true)
    expect(coverage.sighted.size).toBe(2)

    expect(coverage.autoSurveyed.has("D")).toBe(false)
    expect(coverage.sighted.has("D")).toBe(false)
  })

  it("returns empty coverage at sensorRange = 0 even with developed cells present", () => {
    const neighborsOf = graphNeighbors({
      D: ["A", "B", "C"],
    })

    const coverage = computeSensorCoverage(new Set(["D"]), 0, neighborsOf)

    expect(coverage.autoSurveyed.size).toBe(0)
    expect(coverage.sighted.size).toBe(0)
  })

  it("classifies ring-1 as auto-surveyed and ring-2 as sighted at range 2", () => {
    // D --- A --- X
    //  \
    //   B --- Y
    const neighborsOf = graphNeighbors({
      D: ["A", "B"],
      A: ["D", "X"],
      B: ["D", "Y"],
      X: ["A"],
      Y: ["B"],
    })

    const coverage = computeSensorCoverage(new Set(["D"]), 2, neighborsOf)

    expect(coverage.autoSurveyed.has("A")).toBe(true)
    expect(coverage.autoSurveyed.has("B")).toBe(true)
    expect(coverage.autoSurveyed.size).toBe(2)

    expect(coverage.sighted.has("X")).toBe(true)
    expect(coverage.sighted.has("Y")).toBe(true)
    expect(coverage.sighted.size).toBe(2)
  })
})

/** Builds a static neighbor function from an adjacency map. */
function graphNeighbors(
  adjacency: Record<string, readonly string[]>,
): (cellId: string) => readonly string[] {
  return cellId => adjacency[cellId] ?? []
}
