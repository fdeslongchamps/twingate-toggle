# Graph Report - twingate-toggle  (2026-10-09)

## Corpus Check
- 8 files · ~3,999 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 61 nodes · 62 edges · 9 communities (7 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7f55b006`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- extension.js
- First-Run Setup Dialog
- Behavior (current, 1.3.0)
- Changelog
- Paste-This Terminal Step (Copy / Open Terminal)
- Spec: Twingate Toggle
- install.sh
- Twingate Toggle
- uninstall.sh

## God Nodes (most connected - your core abstractions)
1. `Spec: Twingate Toggle` - 11 edges
2. `Behavior (current, 1.3.0)` - 6 edges
3. `Changelog` - 5 edges
4. `Twingate Toggle` - 5 edges
5. `install.sh script` - 5 edges
6. `First-Run Setup Dialog` - 5 edges
7. `Install and Set Up Twingate Step` - 4 edges
8. `TwingateToggleExtension` - 3 edges
9. `Paste-This Terminal Step (Copy / Open Terminal)` - 3 edges
10. `Disable` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Install and Set Up Twingate Step` --semantically_similar_to--> `Install script`  [INFERRED] [semantically similar]
  docs/ideas/first-run-setup.md → SPEC.md
- `Not Doing List (no prefs.js, no login form, no telemetry)` --conceptually_related_to--> `Boundaries`  [INFERRED]
  docs/ideas/first-run-setup.md → SPEC.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **First-run setup paste-step flow** — docs_ideas_first_run_setup_first_run_setup_dialog, docs_ideas_first_run_setup_paste_step, docs_ideas_first_run_setup_install_setup_step, docs_ideas_first_run_setup_polkit_rule, docs_ideas_first_run_setup_desktop_notifier [EXTRACTED 1.00]

## Communities (9 total, 2 thin omitted)

### Community 0 - "extension.js"
Cohesion: 0.20
Nodes (4): TwingateIndicator, TwingateToggle, TwingateToggleExtension, Disable

### Community 1 - "First-Run Setup Dialog"
Cohesion: 0.29
Nodes (6): twingate-desktop-notifier User Service (Sign-in), First-Run Setup Dialog, GNOME Shell ModalDialog, Tile 'Set up Twingate…' State, Three-State Detection (no client / not set up / set up), Boundaries

### Community 2 - "Behavior (current, 1.3.0)"
Cohesion: 0.25
Nodes (8): Install and Set Up Twingate Step, Official Twingate Install Script (apt/rpm repo), twingate setup (interactive, root), Behavior (current, 1.3.0), Install script, Refresh, Start / stop, State

### Community 3 - "Changelog"
Cohesion: 0.33
Nodes (5): 1.0.0, 1.1.0, 1.2.0, 1.3.0, Changelog

### Community 5 - "Spec: Twingate Toggle"
Cohesion: 0.20
Nodes (9): Code Style, Commands, Objective, Open Questions, Project Structure, Spec: Twingate Toggle, Success Criteria, Tech Stack (+1 more)

### Community 6 - "install.sh"
Cohesion: 0.60
Nodes (5): ask(), die(), info(), install.sh script, warn()

### Community 7 - "Twingate Toggle"
Cohesion: 0.33
Nodes (5): Install, Requirements, Troubleshooting, Twingate Toggle, Uninstall

## Knowledge Gaps
- **6 isolated node(s):** `twingate-desktop-notifier User Service (Sign-in)`, `GNOME Shell ModalDialog`, `Tile 'Set up Twingate…' State`, `Official Twingate Install Script (apt/rpm repo)`, `twingate setup (interactive, root)` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 35 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Behavior (current, 1.3.0)` connect `Behavior (current, 1.3.0)` to `extension.js`, `Spec: Twingate Toggle`?**
  _High betweenness centrality (0.312) - this node is a cross-community bridge._
- **What connects `twingate-desktop-notifier User Service (Sign-in)`, `GNOME Shell ModalDialog`, `Tile 'Set up Twingate…' State` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `Spec: Twingate Toggle` connect `Spec: Twingate Toggle` to `First-Run Setup Dialog`, `Behavior (current, 1.3.0)`?**
  _High betweenness centrality (0.273) - this node is a cross-community bridge._
- **Why does `Disable` connect `extension.js` to `Behavior (current, 1.3.0)`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._