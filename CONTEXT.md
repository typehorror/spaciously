# Spaciously

Domain glossary for the colony/space game. Captured lazily as terms get resolved during design conversations.

## Language

**Warehouse**:
A per-cell container that stores resources, sized by a count of storage units.
_Avoid_: Inventory, stockpile.

**Storage unit**:
A fixed-capacity container inside a warehouse that holds at most one resource type at a time. Unit capacity is the constant `WAREHOUSE_UNIT_CAPACITY`. A warehouse's total absolute capacity is derived: `units * WAREHOUSE_UNIT_CAPACITY`. A storage unit has a type that distinguishes how it is being used: empty (unused), stored (general player storage), or [[buffer]] (reserved by a production for its output).
_Avoid_: Slot, block, bin.

**Buffer**:
A storage unit reserved by a production as the exclusive destination for its output. A buffer holds the production's output resource, accumulating up to `WAREHOUSE_UNIT_CAPACITY`. A production cannot start without successfully claiming a buffer (rule: _you cannot produce what you do not have space for_). When a buffer fills, it rolls over: the full unit is released as a `stored` unit and the production claims the next empty unit as its new buffer, in a single atomic transition — production never pauses just because one unit filled. A production becomes [[halted]] only when its buffer is full _and_ no empty unit remains to roll over to.
_Avoid_: Dock (reserved for spaceship use), slot, output, output-buffer.

**Production**:
A standing intent to repeatedly produce a resource in a cell. Identified by `(cellId, productName)`. A production claims a [[buffer]] when started, deposits each completed cycle's output into that buffer, and releases the buffer when stopped (accumulated content spills to a stored unit). At most one production exists per `(cell, product)` pair.
_Avoid_: Job, factory line, production task.

**Halted**:
A derived state of a [[production]] whose [[buffer]] cannot accept its next cycle's output. A halted production consumes no energy and runs no cycles. The state is not stored — it is computed from the buffer's current contents.
_Avoid_: Paused (manual user action), blocked, stalled.

## Relationships

- A **Warehouse** has a fixed number of **Storage units**.
- A **Storage unit** is in one of three states: empty, stored, or [[buffer]].
- A **Storage unit** is dedicated to at most one resource type while non-empty.
- A resource type's quantity is summed across both stored units and buffers of that resource; either kind counts toward the player-facing inventory.
- A **Buffer** is owned by exactly one production and is sealed to all other inputs (manual transfers, other productions of the same resource).

## Flagged ambiguities

- `warehouse.capacity` historically meant *absolute total quantity* (e.g. 160). Going forward, the stored field is `warehouse.units` (e.g. 20); any "absolute capacity" is a derived value, not a stored one.
