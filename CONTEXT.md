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

**Bloom**:
The adversarial force. A bio-engineered terraforming probe seeded into the system by [[the Gardeners]] to prepare the worlds for their eventual arrival. Mechanically, the Bloom is a passive terrain layer (no mobile entities in v1): its presence in a cell is captured by an [[infestation]] level. When active, each tick the Bloom grows in occupied cells, spreads to adjacent cells, and radiates damage to adjacent [[developed cell]]s. The Bloom's per-cell behavior is shaped by that cell's [[resources]] (Biomass-rich cells accelerate it as nutrient substrate; Crystals resist it as inert silica; Plasma/Isotopes mutate it through high-energy interference; Gas enables airborne seeding). Lives in its own slice so a future mobile-spore layer can be added additively.

The Bloom is **dormant** on uncolonized planets (see [[dormancy]]) and **active** on the starting planet and any colonized planet. The starting planet (default name `Aurelia`) is the one exception to wilderness seeding: it begins entirely clean — the pre-game probes that selected it reported no Bloom presence — and first contact arrives as a discrete [[infection]] event some minutes into play, when the Gardeners detect the colony and seed it directly.

The Bloom's *function* mirrors the player's `terraform` action — both are terraformers, working the same ground toward incompatible end-states. This mirror is intentional and central to the design.
_Avoid_: Enemy, monster, alien, pirates, creep. (Note: `infection` is reserved as the term for the specific event-state where the Bloom hosts inside a player building; see [[infection]].)

**The Gardeners**:
The off-screen civilization that seeded the [[Bloom]] across the galaxy. They are never directly encountered in the game — no Gardener ships, no Gardener combat, no Gardener dialogue. Their existence is inferred and progressively revealed through the player's research and survey progress (see _Discovery arc_). Their absence is the design intent: the Bloom is their only avatar, and the unseen author of the threat is more menacing than any rendered enemy. The Gardeners' implied arrival anchors the endgame stakes (see _Win conditions_).
_Avoid_: Aliens, invaders, the enemy (the Bloom is the enemy you fight; the Gardeners are the reason).

**Infestation**:
The per-cell measure of [[Bloom]] presence. A non-negative integer (0 = clean) that grows each tick the cell is occupied, up to a per-cell cap. When it reaches the cap, the cell becomes a spread source for adjacent cells. Defense buildings firing at the cell reduce its infestation; a fully cleared cell (infestation = 0) returns to its prior state.
_Avoid_: Bloom level, corruption, taint (overloaded with magical/moral connotations).

**Cell knowledge state**:
A cell's progression along the player's *awareness* of it: `hidden` → `sighted` → `surveyed` → `developed`. Distinct from claim/control — knowledge is sticky (once known, always known, even if the Bloom later takes the cell).

- **hidden** — outside sensor range of all [[developed cell]]s; not drawn or drawn as void.
- **sighted** — within sensor range; cell shape visible, contents unknown. Bloom may be present but not yet revealed (see _Bloom discovery_ below).
- **surveyed** — contents known: resource distribution and current [[infestation]] level.
- **developed** — terraformed and available for building placement.

_Avoid_: `revealed` (the prior enum value — ambiguous between sighted and surveyed; retiring).

**Sensor range**:
The radius, in hex steps, around each [[developed cell]] within which surrounding cells are at least `sighted`. Default base = 1 (immediate neighbors). Research and certain buildings extend it.
_Avoid_: Vision range (overloaded with line-of-sight semantics we don't have), scan range (reserved for the [[survey]] action's reach).

**Survey**:
A player action that transitions a `sighted` cell to `surveyed`. Costs energy and time; no raw-material cost. Adjacent (sensor-range = 1) cells auto-survey on becoming sighted, so the explicit action only matters once sensor range exceeds 1 (via research/buildings/drones).
_Avoid_: Scan (we may reuse this for fine-grained / sensor-network actions later), reveal.

**Siege**:
The first phase of [[Bloom]] combat against a [[developed cell]]. Each adjacent infested cell radiates damage to the developed cell's buildings each tick, scaled by the adjacent cell's [[infestation]] level (multiple infested neighbors stack). Defense buildings inside the developed cell fire back at adjacent infested cells, consuming ammunition and reducing infestation. Building `shield` absorbs damage before `health`; shields regenerate when not under attack. A developed cell under siege remains developed — only its buildings are at risk.
_Avoid_: Attack, raid (too generic), pressure.

**Breach**:
The Bloom's promotion from siege to occupation. Triggered when **all** defense buildings in the [[developed cell]] are destroyed *and* at least one adjacent cell has been at infestation cap for N consecutive ticks (N TBD). On breach: all remaining buildings in the cell are destroyed, the cell's warehouse contents are lost (Bloom-contaminated), the cell's knowledge state drops to `surveyed` (geography is known, claim is gone), and the cell itself becomes infested at cap — joining the [[Bloom]]'s frontline as a new spread source. The cell's underlying resource distribution (`cell.resources`) is preserved; it is a property of the geography, not of the buildings.
_Avoid_: Fall, capture, overrun, lose.

**Dormancy**:
The state of [[Bloom]] on an uncolonized planet: seeded into the planet at generation but **frozen** — no growth, no spread, no radiation. The dormant tableau represents Gardener seed cells placed long ago, waiting on an industrial/biological signal to activate. **Probe** intel reports the dormant state truthfully ("N dormant seed cells, aggregate infestation X%"), and the snapshot remains valid indefinitely — Bloom on a dormant planet does not change over time. **Colonization activates** the planet: at the moment a Colony Ship lands and places the first [[developed cell]], the Bloom on that planet wakes up and proceeds under the standard growth/spread model.
_Avoid_: Frozen, paused, sleeping (overloaded with cell-state semantics).

**Infection**:
A scripted first-contact event on the **starting planet**, one-shot. The starting planet begins with zero Bloom (its pre-game probes reported it clean). Once two conditions are met — at least ~10 minutes elapsed game time *and* the player has built up to a progress floor (N developed cells, M buildings; numbers TBD) — the Gardeners seed one of the player's buildings, weighted toward biomass-rich cells if any exist. The chosen building's [[developed cell]] becomes an *infected developed cell*: its `infestation` jumps from 0 to some starting value (TBD, probably ~30% of cap), the host building begins taking damage each tick, and from that point on the cell behaves under the standard Bloom growth/spread model — spreading outward to adjacent cells over time. Subsequent Bloom on the starting planet follows the standard spread rules from patient zero outward. No further infection events occur in v1.

The narrative weight of the event is that the player thought they'd found a clean refuge; the Gardeners' reach proves galactic, not local.
_Avoid_: Outbreak, contamination (too narrow), patient-zero (descriptive, not canonical).

**Cleanse**:
The reduction of a cell's [[infestation]] to 0 through sustained fire from adjacent defense buildings. There is no separate cleanse action — ammunition is the resource cost, infestation hitting 0 is the cleanse. On reaching 0, the cell stops radiating, stops being a spread source, and reverts to its prior [[cell knowledge state]]:
- A cleansed `sighted` cell returns to `sighted`.
- A cleansed `surveyed` cell returns to `surveyed`.
- A cleansed *breached* cell (one that was `developed` before falling) returns to `surveyed`-empty: knowledge of the geography is retained, but the buildings and warehouse contents lost at [[breach]] do not return. To reclaim it as `developed`, the player re-terraforms.

The cell's underlying resource distribution is geography and persists through breach and cleanse alike.
_Avoid_: Purge (reserved for any future scorched-earth mechanic), purify, reclaim (overloaded with the re-terraform step).

**Bloom discovery**:
The three paths by which a player learns Bloom is present on a cell:
1. **By survey** — the survey action returns the cell's [[infestation]] level at any value > 0.
2. **By passive observation** — once a `sighted` cell's infestation crosses a visibility threshold, the cell's appearance changes (discoloration / haze) and the player can see "something is there" without surveying. Threshold value TBD.
3. **By contact** — Bloom from an adjacent cell begins radiating damage to a [[developed cell]]'s buildings, or breaches into the cell directly (combat model TBD).

The three paths are designed to *layer*: aggressive scouts get path 1, methodical builders get path 2, inattentive players get path 3. There is always at least one warning preceding combat.

## Relationships

- A **Warehouse** has a fixed number of **Storage units**.
- A **Storage unit** is in one of three states: empty, stored, or [[buffer]].
- A **Storage unit** is dedicated to at most one resource type while non-empty.
- A resource type's quantity is summed across both stored units and buffers of that resource; either kind counts toward the player-facing inventory.
- A **Buffer** is owned by exactly one production and is sealed to all other inputs (manual transfers, other productions of the same resource).

## Design notes

### Premise

The player commands a colonization mission. Humanity is fleeing an off-screen Gardener wave on its original homeworld; what could be salvaged was loaded onto Colony Ships, and the mission's pre-game probes identified the **starting planet** (default name `Aurelia`) as a clean refuge. Game state begins with the player's first Colony Ship already landed: one [[developed cell]] at the planet's origin coord, the rest of the grid `hidden`. The other two planets in the system are dark on the galaxy map until [[interstellar-scanning]] research reveals them. The starting planet's clean state is a brief reprieve — the [[infection]] event will prove the Gardeners' reach is galactic.

### Galaxy topology and planet unlock

The game has 3 planets, each its own hex grid. The starting planet simulates continuously from game start; the other two stay [[dormant]] until a Colony Ship lands on them (no ticking, no growth, no resource production, no Bloom progress). A new **galaxy map view** sits above the per-planet hex view: nodes for planets, dispatched ships shown in transit between them.

The player has a *shared* economy across planets — one research tree, one tech progression, one game clock, one player score — but each planet has its own warehouses, buildings, energy grid, and [[Bloom]] front. Resources cross between planets only via cargo ships.

A planet's visibility unlocks in stages, each gated by existing research:

1. **Pre-discovery** — galaxy map shows only an unlabeled dot.
2. **Discovered** (via `interstellar-scanning`) — name, gross resource profile, Bloom presence (yes/no).
3. **Probed** (via `exploration-drones` + a Probe ship arriving) — Bloom severity (low/med/high), refined resource hotspots, climate flavor. The hex grid is **still not drawn**.
4. **Colonized** (via `colonization-tech` + a Colony Ship landing) — the hex grid is drawn for the first time. The landing cell is [[developed cell]]; all others are `hidden` and progress through normal sensor/survey play.

`planetary-mapping` later acts as a *bulk-promotion* tech on colonized planets — all cells become at least `sighted`, skipping the slow outward-sensor-expansion phase on planets the player already holds.

The map-reveal gating preserves the "two terraformers meeting" beat: until you land, you have not yet *seen* the ground the Bloom has been working. Colonization is the moment of revelation.

### Ships

A ship is a **timed transfer order**, not a moving entity — a record of {source, destination, cargo, depart-at, arrive-at}. The UI shows ships in transit on the galaxy map; gameplay treats them as a future-dated state change. No pathfinding, no in-flight combat.

v1 ship types:

- **Probe** — one-way, scans a planet, returns intel. Cheap, fast.
- **Colony Ship** — one-way, plants the player's first [[developed cell]] on a target planet. Expensive, slow.
- **Cargo Ship** — round-trip, manifest of resources, transfers between planet warehouses. Multiple capacity/speed tiers expected over time.

### Bloom growth and spread

Each tick, every Bloom-occupied cell does two things:

1. **Grow** — `infestation` rises by the cell's `growthRate`, capped at the cell's `cap`.
2. **Spread (at cap only)** — for each adjacent non-developed cell, deposit `seedQuantity` of infestation into it. The neighbor begins growing on its own next tick.

`growthRate`, `cap`, and `seedQuantity` are **derived per-cell** from the cell's resource composition (no global rates). Direction (numbers TBD):

- **Biomass** — accelerates growth and raises cap. Fast, dense advance.
- **Crystals** — slows growth and lowers cap. Natural firebreak terrain.
- **Plasma / Isotopes** — slows growth but mutates the seeds that *leave* the cell (mutation as a future v2 expansion vector, recorded but not implemented in v1).
- **Gas** — normal growth, but adds a per-tick probabilistic *airborne seed* into a non-adjacent hidden cell on the same planet. This is the sole probabilistic element in spread; everything else is deterministic.
- **Ore** — neutral / base rates.

Tunable from `config.ts` via a small set of base constants — the whole game's pacing flows from those numbers.

### Initial seeding

The starting planet begins **clean** — no Bloom anywhere. Its first contact is the [[infection]] event.

Planets 2 and 3 begin **seeded** at planet generation, but [[dormant]] (frozen until colonized). Seed placement on these planets:

- **Count**: ~6 seed cells per planet (numbers TBD; tunable in `config.ts`).
- **Initial infestation**: ~40% of the cell's cap (TBD).
- **Placement weighting**: distance-weighted *away* from any plausible Colony Ship landing zone (no spawn-camp surprises) and resource-weighted *toward* biomass-rich cells (the Gardeners seeded where the terraforming would succeed fastest).
- **Visibility**: hidden — the player only learns the planet's seeding via Probe intel (aggregate) and direct observation once colonized.

Seeded cells start at non-zero infestation: they are not "clean cells that will eventually be infested" — they are already infested, just frozen, waiting on a Colony Ship to wake them up.

### Cascading Bloom escalation

The [[Bloom]] on each planet is local during normal play — no inter-planet Bloom transit. But when a planet *falls* (every [[developed cell]] on it has [[breach]]ed and the player can no longer fight back from any cell on that planet), the Gardeners' seeding plan **escalates on the remaining planets**:

- **Dormant planets**: the existing seed cells' initial infestation rises (e.g., from 40% → 60% of cap), or additional seed cells appear. The probe report changes the next time the player checks.
- **Active (colonized) planets**: growth rate, spread rate, or both tick upward (mechanism TBD).

This is the only way the threat grows beyond what was seeded — there are no continuous new seeds during normal play. Galactic stakes without inter-planet combat.

### Discovery arc

Lore about the [[Bloom]] and [[the Gardeners]] is unlocked progressively through the existing research tree, never dumped via exposition. Direction (specific research nodes that gate each tier are TBD):

1. **"What is this?"** Surveys report `infestation: N` with no further classification.
2. **"It's engineered."** A bio/xenobiology research reveals tissue samples show uniform engineered structure.
3. **"It's reporting."** A scanning/decoding research detects encoded transmissions emitted by mature Bloom masses.
4. **"They sent it."** Further decoding identifies the Gardeners as a distant, methodical civilization and the Bloom as one of many seeds.
5. **"They're coming."** Context for the [[ascension protocol]] becomes explicit: escape or denial.

### Win conditions

Two paths, drawn from the same story:

- **Ascension win** — complete the existing `ascension-protocol` research and any required mega-structure (TBD). Your civilization escapes / transcends beyond the Gardeners' reach.
- **Defiant win** — fully cleanse the Bloom from all 3 planets. You deny the Gardeners the harvest; they arrive (off-screen) to a sterile system and move on.

Loss: all planets fall (last [[developed cell]] on each planet has [[breach]]ed and the player cannot recover).

## Flagged ambiguities

- `warehouse.capacity` historically meant *absolute total quantity* (e.g. 160). Going forward, the stored field is `warehouse.units` (e.g. 20); any "absolute capacity" is a derived value, not a stored one.
- [[Bloom]] per-resource coefficients — the *direction* of each resource's effect is committed (Biomass accelerates, Crystals resist, Plasma/Isotopes mutate, Gas airborne-seeds, Ore neutral), but the per-resource numbers (growth multipliers, resistance percentages, mutation rules, seed probabilities) are still TBD.
- [[Infestation]] cap and rates — single global growth rate vs per-cell rate derived from resources; cap as a flat number vs derived from the cell's resource composition. Direction: derive everything from resources, no globals, so the world feels coherent. Numbers TBD.
- [[Bloom discovery]] visibility threshold — at what infestation level does an unsurveyed sighted cell become visibly bloomed (path 2)? Likely a fraction of the cell's cap. Value TBD.
- Combat numbers — radiation damage per tick at each [[infestation]] level, breach hold duration `N`, shield regen rate. All TBD.
