# Graph Report - twingate-toggle  (2026-10-09)

## Corpus Check
- Corpus is ~3,085 words - fits in a single context window. You may not need a graph.

## Summary
- 49 nodes · 71 edges · 8 communities (5 shown, 3 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.91)
- Token cost: 50,176 input · 0 output

## Community Hubs (Navigation)
- Project Docs And Install
- Extension Core Module
- User-Facing Features
- Start Stop Flow
- Install Script Helpers
- Service Following And Polling
- Extension Lifecycle
- Sudo Command Runner

## God Nodes (most connected - your core abstractions)
1. `Twingate Toggle GNOME Shell Extension` - 6 edges
2. `Spec: Twingate Toggle` - 6 edges
3. `install.sh script` - 5 edges
4. `Twingate Quick Settings Tile` - 4 edges
5. `Zenity Password Window` - 4 edges
6. `Changelog` - 4 edges
7. `systemd D-Bus PropertiesChanged on twingate.service` - 4 edges
8. `Adaptive Polling (2s transitional / 30s idle)` - 4 edges
9. `twingate status State Parsing` - 4 edges
10. `Start / Stop Flow` - 4 edges

## Surprising Connections (you probably didn't know these)
- `SUDO_ASKPASS Helper (zenity / ssh-askpass)` --semantically_similar_to--> `Zenity Password Window`  [INFERRED] [semantically similar]
  SPEC.md → README.md
- `twingate status State Parsing` --shares_data_with--> `Twingate Quick Settings Tile`  [INFERRED]
  SPEC.md → README.md
- `README broken by commit 141dab7` --references--> `Twingate Toggle GNOME Shell Extension`  [EXTRACTED]
  SPEC.md → README.md
- `Spec: Twingate Toggle` --references--> `Twingate Toggle GNOME Shell Extension`  [EXTRACTED]
  SPEC.md → README.md
- `1.0.0: first release` --references--> `Twingate Quick Settings Tile`  [INFERRED]
  CHANGELOG.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Tile state refresh mechanism** — spec_systemd_dbus_signals, spec_adaptive_polling, spec_status_parsing, readme_quick_settings_tile, readme_top_bar_vpn_icon [EXTRACTED 1.00]
- **Start/stop with sudo, logging and failure notification** — spec_start_stop_flow, spec_sudo_askpass, spec_cli_output_to_log, readme_failure_notification, readme_twingate_toggle_log [INFERRED 0.85]

## Communities (8 total, 3 thin omitted)

### Community 0 - "Project Docs And Install"
Cohesion: 0.24
Nodes (9): Changelog, 1.0.0: first release, 1.1.0: install script sets up Twingate client, Twingate Quick Settings Tile, Twingate Linux Client, Install Script Behavior, metadata.json, Spec: Twingate Toggle (+1 more)

### Community 1 - "Extension Core Module"
Cohesion: 0.25
Nodes (4): ASKPASS_PATH, CACHE_DIR, LOG_PATH, TwingateToggle

### Community 2 - "User-Facing Features"
Cohesion: 0.25
Nodes (6): Top-bar VPN Icon, Troubleshooting, Twingate Toggle GNOME Shell Extension, Open Questions, README broken by commit 141dab7, Testing Strategy (syntax checks + manual)

### Community 3 - "Start Stop Flow"
Cohesion: 0.33
Nodes (3): Command Failure Notification, ~/.cache/twingate-toggle.log, Start / Stop Flow

### Community 4 - "Install Script Helpers"
Cohesion: 0.60
Nodes (5): ask(), die(), info(), install.sh script, warn()

## Knowledge Gaps
- **2 isolated node(s):** `Troubleshooting`, `Open Questions`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 11 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Spec: Twingate Toggle` connect `Project Docs And Install` to `Extension Core Module`, `User-Facing Features`, `Install Script Helpers`?**
  _High betweenness centrality (0.403) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Twingate Quick Settings Tile` (e.g. with `1.0.0: first release` and `twingate status State Parsing`) actually correct?**
  _`Twingate Quick Settings Tile` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Troubleshooting`, `Open Questions` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `Twingate Toggle GNOME Shell Extension` connect `User-Facing Features` to `Project Docs And Install`, `Start Stop Flow`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `Start / Stop Flow` connect `Start Stop Flow` to `Extension Core Module`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._