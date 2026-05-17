# Spaciously

Domain glossary for the colony/space game. Captured lazily as terms get resolved during design conversations.

## Language

**Warehouse**:
A per-cell container that stores resources, sized by a count of storage units.
_Avoid_: Inventory, stockpile.

**Storage unit**:
A fixed-capacity slot inside a warehouse that holds at most one resource type at a time. Unit capacity is the constant `WAREHOUSE_UNIT_CAPACITY`. A warehouse's total absolute capacity is derived: `units * WAREHOUSE_UNIT_CAPACITY`.
_Avoid_: Slot, block, bin.

## Relationships

- A **Warehouse** has a fixed number of **Storage units**.
- A **Storage unit** is dedicated to at most one resource type while non-empty.
- A resource type with quantity `q` occupies `ceil(q / WAREHOUSE_UNIT_CAPACITY)` **Storage units**.

## Flagged ambiguities

- `warehouse.capacity` historically meant *absolute total quantity* (e.g. 160). Going forward, the stored field is `warehouse.units` (e.g. 20); any "absolute capacity" is a derived value, not a stored one.
