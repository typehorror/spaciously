# Buffered production with derived halt

## Context

Production today is modeled as a generic continuous `Task` whose completion action calls `addToWarehouse`, which silently clips overflow. This means a production with a full warehouse keeps cycling and burning energy while producing nothing visible to the player, and storage-saturation has no in-game consequence.

## Decision

We introduce a buffered model with a dedicated production slice:

1. **Storage units become first-class typed entities.** `warehouse.units` changes from a `number` to an `Array<StorageUnitState>` discriminated union with variants `empty`, `stored`, and `buffer`. `content` becomes a derived view summed across `stored` and `buffer` units of a resource.
2. **A production claims one storage unit as a buffer** when started, and releases it when stopped (accumulated content converts to a `stored` unit). The buffer is sealed: manual transfers and other productions of the same resource cannot deposit into it.
3. **Rollover, not hard cap.** A buffer holds up to `WAREHOUSE_UNIT_CAPACITY` of its resource. When a deposit fills the buffer, the full unit is atomically released (converted to `stored`) and the production claims the next empty unit as its new buffer. Production only halts when its buffer is full _and_ no empty unit remains. _(Original decision in this ADR was hard-cap; superseded — see Revision below.)_
4. **Halted is derived, never stored.** A selector (`selectRunningProductionOrders`) joins production orders with warehouse state and is the single source of truth consumed by the ticker, the energy selector, and the UI. Halted productions consume no energy and run no cycles.
5. **Productions live in a new `productionSlice`,** not as generic `Task`s. The generic `Task` system stays domain-agnostic for terraform, research, and one-shot work. A small `ProductionTicker` component drives running orders the same way `TaskManager` drives tasks.

## Considered alternatives

- **Side-list of buffers alongside `content`** instead of reifying units. Rejected: creates two sources of truth for resource quantities and forces every inventory selector to remember to sum both.
- **Teach the generic `Task` system about warehouse buffers** (via a `precondition` field or ID-prefix sniffing). Rejected: leaks one domain (storage) into the foundation shared by every task type.
- **Spill into additional units when the buffer fills.** _Originally rejected_ — see Revision below; this is the behavior we ended up with after first contact with the running game showed hard-cap as wrong in practice.
- **Imperative `ProductionManager` watching warehouse state.** Rejected: the system is state-rendering; a selector that re-runs when warehouse content changes covers the same need without parallel state.
- **Standby energy draw while halted.** Rejected: makes the halt feedback ambiguous (player still pays without output) and adds a tuning knob with no current motivation.

## Consequences

- `addToWarehouse` no longer needs silent-overflow clipping for the production path — production deposits go through a buffer-aware reducer in `productionSlice`. The remaining callers (gifts, transfers, debug) can be tightened to crash on overflow per the "crash early, crash clearly" rule.
- Every reducer that mutates `warehouse.content` needs to migrate to mutating `warehouse.units` (the typed array). This is mechanical but touches a handful of call sites.
- Toggling production on becomes infeasible when no `empty` unit is available — the UI must reflect this (disabled toggle with tooltip) rather than silently failing.
- Each active production permanently occupies one storage unit until stopped, which is a real strategic cost the player will feel in tight warehouses. This is intentional.

## Revision — Rollover supersedes hard-cap

The original decision capped a production's output at one buffer's worth, requiring a manual stop-then-start to continue producing once that buffer filled. After wiring it up end-to-end this read as a bug rather than a feature: stop/start with no design intent in between is busywork, and a producer ringed by empty warehouse space sitting idle is visually wrong. Rollover is the natural read of _"production stops when we're running out of storage availability in their cell"_ — _running out_ means the cell is full, not that one unit is full.

Mechanics: when a deposit would push the buffer past `WAREHOUSE_UNIT_CAPACITY`, the full unit is released as `stored` and the next `empty` unit becomes the new buffer in one atomic transition. A production owns at most one buffer at any moment, but may occupy many storage units over its lifetime as it fills and rolls them over. Halted state is unchanged in shape — it just narrows to "buffer is full _and_ no empty remains."

The Q5 forward-looking argument for hard-cap (future multi-unit productions need a fixed footprint) is preserved by the new `canAcceptCycle` / `acceptCycle` surface, which checks for room across both the current buffer and any rollover target. A future production declaring an `outputUnits = N` footprint can use the same surface with `N` as the rollover requirement.
