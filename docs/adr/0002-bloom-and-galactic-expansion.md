# The Bloom, the Gardeners, and galactic expansion

## Context

Spaciously today is a construction shell: harvest, produce, research, terraform, build. It has 6 raw resources, 19 buildings (extractors, generators, defenses), 50+ research nodes, 3 planets in code but only one displayed, and per-cell warehouses with buffered productions. What it does **not** have:

- An adversarial force. Defense buildings have full stats (health, shield, range, accuracy, ammo) and 8 ammunition recipes exist, but they have nothing to shoot at.
- Ships. `BuildingType.SHIPYARD`, `colonization-tech`, `fleet-construction`, and `stellar-navigation` research nodes are all defined; nothing builds or uses ships.
- Inter-planet topology. Three planets exist as entities but switching between them is a passive UI toggle. Nothing travels between them.
- A loss condition. The research tree implies an `ascension-protocol` win, but there is no way to lose, no pressure, no pacing dial beyond research-tree progression.
- Use of the `habitat` (`population`, `capacity`) types defined on cells.
- A consequence for net-negative energy balance.

The product brief is a solo space-strategy construction game in the browser: no backend, no network, no multiplayer. The design must remain client-only, modular, and avoid adversary subsystems (AI factions, pathfinding entities, in-flight combat resolution) whose simulation cost is unjustified by the brief.

This ADR captures the decision to **introduce the Bloom as a passive-terrain adversary and bind it to a galactic-expansion arc** that gives existing systems (defense buildings, ammo, ships-in-name-only, multi-planet, research tree) a coherent purpose.

## Decision

The full mechanical and naming details live in `CONTEXT.md`. This ADR records the **decisions and trade-offs** behind them.

### 1. The adversary is the Bloom, seeded by the off-screen Gardeners

The Bloom is a bio-engineered terraforming probe — a *seed system*, not a creature. It works the planet's substrate the same way the player's `terraform` action does, toward an end-state hostile to the player. Two terraformers, one ground.

The Gardeners (the civilization that sent the Bloom) are **never directly encountered** in v1: no Gardener ships, no Gardener combat, no Gardener UI. They exist only in inference, revealed progressively through the existing research tree. Their absence is the design intent — an unseen author of the threat is more menacing than any rendered enemy, and rendering them would require building an entire second adversary subsystem.

### 2. Bloom is passive terrain, not a mobile entity

Each cell carries an `infestation` level (0 to a per-cell `cap`). Each tick, occupied cells **grow** (`infestation += growthRate`) and, when at cap, **spread** by depositing `seedQuantity` into adjacent non-developed cells. There are no Bloom units, no pathfinding, no entity lifecycle.

The Bloom logic lives in its own slice (`bloomSlice`), so a future mobile-spore layer can be added additively without refactoring cell or building state.

### 3. Bloom rates are derived per-cell from the cell's resources

`growthRate`, `cap`, and `seedQuantity` are *not* global constants. They are functions of the cell's resource composition. Direction: Biomass accelerates, Crystals resist, Plasma/Isotopes will mutate (v2), Gas enables a probabilistic airborne seed to a non-adjacent hidden cell, Ore is neutral.

This binds the economy map and the threat map into one map. The same Biomass-rich cells you want to mine are the cells the Bloom wants to occupy. Resource distribution does double duty without new state.

### 4. Cell knowledge is a 4-state lifecycle, separate from claim

`hidden` → `sighted` → `surveyed` → `developed`. The unused `REVEALED` enum value is retired. `hidden` cells are outside sensor range; `sighted` cells are in range but contents unknown; `surveyed` cells have known contents (resources + infestation); `developed` cells are terraformed and built.

Survey is **automatic on adjacency** (sensor range = 1 by default) and **explicit + costed (energy + time)** for cells beyond it (sensor range > 1, via research/buildings/drones). Knowledge is sticky: once known, always known.

### 5. Bloom discovery has three layered paths

A `sighted`-but-unsurveyed cell's appearance to the player depends on the Bloom's mass:

1. **By survey** — at any infestation level > 0.
2. **By passive observation** — past a visibility threshold, the cell discolors on-map without survey.
3. **By contact** — Bloom radiates damage to an adjacent developed cell or breaches into it.

Layered intentionally: scouts get path 1, methodical builders get path 2, inattentive players get path 3. **There is always at least one warning preceding combat.**

### 6. Combat is escalating — siege then breach

Adjacent infested cells radiate damage to a developed cell's buildings (siege). Defense buildings fire back, consuming ammunition and reducing infestation. Damage flows into `shield`, then `health` — existing fields, not new ones. When **all defense buildings in the cell are destroyed AND** an adjacent cell has been at infestation cap for N consecutive ticks, the Bloom **breaches**: remaining buildings destroyed, warehouse contents lost, knowledge state drops to `surveyed`, cell joins the Bloom's frontline as a new spread source. The cell's underlying resource distribution is preserved (geography persists through breach).

### 7. Cleansing is fire-only

No separate cleanse action. Defense buildings firing from adjacency drive infestation to 0; when it hits 0, the cell is clean. A cleansed previously-breached cell returns to `surveyed`-empty: geography is yours again, but the buildings and warehouse contents are not. Ammunition is the resource cost; no parallel cost layer.

### 8. The galaxy: dormant uncolonized, active colonized

The three planets have asymmetric simulation states:

- **Starting planet (`Aurelia` by default)**: clean at start, active simulation, first contact via the [[infection]] event.
- **Other planets**: seeded with dormant Bloom at generation. Frozen — no growth, no spread, no damage, no ticking — until a Colony Ship lands. The probe report on a dormant planet is a stable snapshot, valid indefinitely.

This solves a doom-loop the simpler "all-planets-tick-always" model would have produced: by the time a player finishes Earth and arrives at planet 2, the Bloom there would be saturated and unwinnable. Dormancy preserves both the lore (Gardeners' bio-tech is reactive, activating on industrial signal) and the playability (planet difficulty is what was *seeded*, not what was *seeded plus elapsed wall time*).

### 9. Premise: you are colonists, not natives

The player commands a colonization mission fleeing an earlier off-screen Gardener wave on humanity's original homeworld. The pre-game probes selected the starting planet as clean. The infection event is the dramatic moment when the player realizes the Gardeners' reach is *galactic*, not local — the refuge was never safe.

This reframes the starting planet from "home being defended" to "fragile new beginning being compromised," which is a stronger story beat and a more honest one for a game where you can lose everything.

### 10. Ships are timed transfer orders, not entities

A ship is a record: `{source, destination, cargo, depart-at, arrive-at}`. The UI shows ships in transit on the galaxy map; gameplay treats them as future-dated state changes. No pathfinding, no in-flight combat, no per-frame movement.

v1 ship types — **Probe** (one-way recon, returns intel), **Colony Ship** (one-way, plants first developed cell + activates planet), **Cargo Ship** (round-trip resource transfer between planet warehouses). Future types (Defender, Cleanser, Mapper-with-payload) are natural extensions of the same shape.

### 11. Map reveal is gated by tech and presence

A planet's representation unfolds in stages:

| Stage | Gate | What the player sees |
|---|---|---|
| Pre-discovery | default | Unlabeled dot on galaxy map |
| Discovered | `interstellar-scanning` | Name + gross resource profile + Bloom presence (yes/no) |
| Probed | `exploration-drones` + Probe arrival | Bloom severity + resource hotspots — **no hex grid** |
| Colonized | `colonization-tech` + Colony Ship arrival | **Hex grid drawn for the first time**; landing cell is `developed`, rest is `hidden`, normal sensor/survey play resumes |

`planetary-mapping` (already in the research tree) is the late-game bulk-promotion tech: on colonized planets, all cells are promoted to `sighted` at minimum.

The map-reveal gating preserves the "two terraformers meeting" beat: until you land, you have not yet seen the ground the Bloom has been working. Colonization is the moment of revelation.

### 12. Cascading escalation on planet fall

A planet *falls* when every developed cell on it has breached. On fall, remaining planets escalate: dormant planets' seeded levels rise, active planets' growth/spread rates tick up. This is the **only** mechanism for the threat to grow beyond initial seeding — there are no continuous new seeds during normal play. The player is never "drip-jumped" by RNG.

### 13. Two win paths, one loss

- **Ascension win** — complete `ascension-protocol` and any required mega-structure. Civilization escapes/transcends.
- **Defiant win** — fully cleanse the Bloom from all 3 planets. The Gardeners arrive (off-screen) to a sterile system.
- **Loss** — all planets fallen, no developed cells remaining on any planet.

Two paths rewarding different playstyles (research-focused vs combat-focused) emerging from one story.

## Considered alternatives

Decisions were taken in a `grill-with-docs` session; alternatives below were each explicitly considered and rejected.

- **Pirates / event raids instead of the Bloom.** Simpler — event timer spawns raids on developed cells. Rejected: makes the hex grid feel passive (adversary is timeline-shaped, not spatial). The defense buildings already designed have *range* and *ammo*, which want a spatial target. The Bloom uses the hex grid; pirates do not.
- **AI rival faction.** Real strategic depth, but a faction AI is a substantial client-side simulation cost, contradicts the solo/no-backend brief, and forces design of an entire AI player model. Held for a hypothetical v3.
- **Bloom as mobile units from day one.** More dynamic, but requires pathfinding, entity lifecycle, and combat resolution per pair — a whole new subsystem before either the terrain or the entity layer is proven. Designed-for as v2 (the `bloomSlice` module boundary supports additive extension); not built in v1.
- **Resource-blind Bloom.** Simpler to tune (one global growth rate), but throws away the economy-map = threat-map coupling. The same Biomass-rich cells that are economically critical are also the most Bloom-vulnerable; this dual role is the design pillar.
- **Day-one fully-visible Bloom.** Plays like a strategy puzzle (threat map transparent from minute one). Loses the discovery beat — which is half the appeal of a hex-grid game.
- **All-three-planets-tick-always.** Simplest model, but produced a doom-loop: time spent on the starting planet doomed planets 2 and 3 to saturation before the player could arrive. Dormancy is the in-world fix; pause-until-probed is the same fix dressed as engineering.
- **Frozen probe snapshot that "thaws" on colonization.** Same end result as dormancy but harder to model. Dormancy is the cleaner abstraction.
- **Synchronized indoor infection on every planet, no outdoor wilderness seeding.** Kills the "two terraformers contesting wilderness" metaphor that the spread model is built around. Infection is reserved for the starting-planet beat.
- **Two-step cleanse (fire degrades, then explicit Cleanse action).** Symmetric to siege → breach in narrative, but adds UI clicks and a parallel cost layer. Ammunition is already the cost; the simpler one-step rule keeps the surface area down.
- **Pure breach (no siege phase) or pure siege (no cell flip).** Pure breach is undertelegraphed; pure siege removes the "frontline advancing" feel. Escalating is the middle path with both readability and stakes.
- **Probabilistic Bloom spread.** More "organic" feel but unpredictable in a way that frustrates strategy. Deterministic spread + one probabilistic exception (Gas airborne seeding) preserves emergent surprise without making the whole system a coin flip.
- **Continuous re-seeding throughout play.** Steady pressure increase, but reduces player agency — they can do everything right and still get jumped. Held for an optional difficulty mode.

## Consequences

**Code surface**

- **New slice**: `bloomSlice` owning per-cell `infestation`, growthRate/cap/seedQuantity coefficients, dormancy flags, and the tick reducer that grows + spreads.
- **New slice or extension**: galaxy-layer state for inter-planet ships in transit and the cascading-escalation registry. Possibly fits in `planetSlice`.
- **New cell state**: `infected developed cell` — a developed cell with `infestation > 0`. Needs to interoperate with the existing developed/buildings/warehouse machinery.
- **New cell knowledge state**: `sighted` is added between `hidden` and `surveyed`. `REVEALED` enum value retires. Existing call sites need migration; `terraformCell` jumps `surveyed → developed`, not `hidden → developed`.
- **Energy economy implications**: surveys, ship dispatches, and bloom-combat firing all draw energy. The current "net-energy can go negative with no consequence" gap becomes more visible — flagged as open in `CONTEXT.md`, not addressed in this ADR.
- **`firstPlanet` in `planetSlice.ts` renames from `Earth` to `Aurelia`.** Mechanically trivial; thematically load-bearing.

**Existing systems gain purpose**

- **Defense buildings + ammunition** finally have a target. The 8 ammunition types and 5 defense buildings map onto distinct anti-Bloom roles (anti-mass, anti-mutation, etc.) — direct alignment without redesign.
- **Research tree** anchors the lore-discovery arc (5 tiers) and gates planet visibility (`interstellar-scanning`, `exploration-drones`, `colonization-tech`, `planetary-mapping`). Nodes that previously implied an off-screen "later" now have explicit roles.
- **`HexCellState.REVEALED`** is finally not dead code (after rename to `SIGHTED`).
- **Three-planet system** becomes a real galaxy with progression instead of a UI dropdown.

**Player experience**

- **Two distinct early-game phases.** Peaceful construction on `Aurelia`, then the infection event flips the tone. The transition is the game's most memorable moment.
- **Strategic geography.** Biomass-rich tiles are economic AND threat-laden; crystal-rich tiles are slow-yield AND defensible. Players reason about the map at two levels at once.
- **Probing has decision-weight.** Probe data is a stable tactical briefing the player walks around the galaxy map weighing. Colonization is committing to a specific war.
- **Loss is graded across multiple scales.** Buildings can die without losing a cell. A cell can breach without losing a planet. A planet can fall without losing the galaxy. The player has many escalating opportunities to course-correct.

**Open items deferred to later ADRs or implementation tuning**

- Per-resource Bloom rate coefficients (numbers).
- Infection trigger thresholds (time floor, progress floor) and patient-zero selection algorithm.
- Visibility threshold for path-2 Bloom discovery.
- Specific research-node mapping to the 5 lore tiers.
- Energy-when-negative consequence model.
- Habitat/population — whether `cell.habitat` becomes a real mechanic or the unused types are deleted.
- Ship travel durations, cargo capacities, and dispatch UX.
- Mutation rules for Plasma/Isotopes-seeded Bloom (v2).
- Mobile-spore Bloom variant (v2).
