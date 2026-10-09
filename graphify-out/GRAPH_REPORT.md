# Graph Report - twingate-toggle  (2026-10-09)

## Corpus Check
- 10 files · ~4,808 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .gjs 1)

## Summary
- 72 nodes · 79 edges · 9 communities (8 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0095ce4b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Behavior (current, 1.4.0)
- First-Run Setup Dialog
- Changelog
- Install and Set Up Twingate Step
- Spec: Twingate Toggle
- install.sh
- Twingate Toggle
- uninstall.sh
- extension.js

## God Nodes (most connected - your core abstractions)
1. `Spec: Twingate Toggle` - 11 edges
2. `Changelog` - 8 edges
3. `Behavior (current, 1.4.0)` - 7 edges
4. `First-Run Setup Dialog` - 5 edges
5. `install.sh script` - 5 edges
6. `Twingate Toggle` - 5 edges
7. `parseResources()` - 4 edges
8. `parseStatus()` - 4 edges
9. `Install and Set Up Twingate Step` - 4 edges
10. `TwingateToggleExtension` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Plan: resources menu (1.4.0)` --references--> `parseResources()`  [INFERRED]
  tasks/plan.md → lib.js
- `Plan: resources menu (1.4.0)` --references--> `parseStatus()`  [INFERRED]
  tasks/plan.md → lib.js
- `Install and Set Up Twingate Step` --semantically_similar_to--> `Install script`  [INFERRED] [semantically similar]
  docs/ideas/first-run-setup.md → SPEC.md
- `Resources menu (1.4.0)` --references--> `parseResources()`  [INFERRED]
  SPEC.md → lib.js
- `Resources menu (1.4.0)` --references--> `parseStatus()`  [INFERRED]
  SPEC.md → lib.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **First-run setup paste-step flow** — docs_ideas_first_run_setup_first_run_setup_dialog, docs_ideas_first_run_setup_paste_step, docs_ideas_first_run_setup_install_setup_step, docs_ideas_first_run_setup_polkit_rule, docs_ideas_first_run_setup_desktop_notifier [EXTRACTED 1.00]

## Communities (9 total, 1 thin omitted)

### Community 0 - "Behavior (current, 1.4.0)"
Cohesion: 0.22
Nodes (7): TwingateIndicator, TwingateToggleExtension, Behavior (current, 1.4.0), Disable, Refresh, Start / stop, State

### Community 1 - "First-Run Setup Dialog"
Cohesion: 0.29
Nodes (6): twingate-desktop-notifier User Service (Sign-in), First-Run Setup Dialog, GNOME Shell ModalDialog, Tile 'Set up Twingate…' State, Three-State Detection (no client / not set up / set up), Boundaries

### Community 3 - "Changelog"
Cohesion: 0.22
Nodes (8): 1.0.0, 1.1.0, 1.2.0, 1.3.0, 1.4.0, 1.4.1, 1.4.2, Changelog

### Community 4 - "Install and Set Up Twingate Step"
Cohesion: 0.25
Nodes (6): extensions.gnome.org Review Guidelines, Install and Set Up Twingate Step, Official Twingate Install Script (apt/rpm repo), Don't Ask Again Polkit Rule, twingate setup (interactive, root), Install script

### Community 5 - "Spec: Twingate Toggle"
Cohesion: 0.20
Nodes (9): Code Style, Commands, Objective, Open Questions, Project Structure, Spec: Twingate Toggle, Success Criteria, Tech Stack (+1 more)

### Community 6 - "install.sh"
Cohesion: 0.60
Nodes (5): ask(), die(), info(), install.sh script, warn()

### Community 7 - "Twingate Toggle"
Cohesion: 0.33
Nodes (5): Install, Requirements, Troubleshooting, Twingate Toggle, Uninstall

### Community 9 - "extension.js"
Cohesion: 0.20
Nodes (7): ICON, TwingateToggle, parseResources(), parseStatus(), resourceAction(), Resources menu (1.4.0), Plan: resources menu (1.4.0)

## Knowledge Gaps
- **6 isolated node(s):** `twingate-desktop-notifier User Service (Sign-in)`, `GNOME Shell ModalDialog`, `Tile 'Set up Twingate…' State`, `Three-State Detection (no client / not set up / set up)`, `Official Twingate Install Script (apt/rpm repo)` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 40 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Behavior (current, 1.4.0)` connect `Behavior (current, 1.4.0)` to `extension.js`, `Install and Set Up Twingate Step`, `Spec: Twingate Toggle`?**
  _High betweenness centrality (0.319) - this node is a cross-community bridge._
- **What connects `twingate-desktop-notifier User Service (Sign-in)`, `GNOME Shell ModalDialog`, `Tile 'Set up Twingate…' State` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `Spec: Twingate Toggle` connect `Spec: Twingate Toggle` to `Behavior (current, 1.4.0)`, `First-Run Setup Dialog`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Why does `Resources menu (1.4.0)` connect `extension.js` to `Behavior (current, 1.4.0)`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._