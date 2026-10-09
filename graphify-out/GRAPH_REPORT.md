# Graph Report - twingate-toggle  (2026-10-09)

## Corpus Check
- 8 files · ~4,119 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 67 nodes · 86 edges · 8 communities
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.87)
- Token cost: 54,496 input · 0 output

## Community Hubs (Navigation)
- Extension Core Module
- Setup Dialog Design
- Install And Setup Steps
- Releases And Client
- Privilege And Review Rules
- State Detection And Refresh
- Install Script Helpers
- User-Facing Features

## God Nodes (most connected - your core abstractions)
1. `Twingate Quick Settings Tile` - 7 edges
2. `First-Run Setup Dialog` - 7 edges
3. `install.sh script` - 5 edges
4. `twingate status Parsing (online/starting/authenticating)` - 5 edges
5. `Start/Stop via twingate CLI with sudo` - 5 edges
6. `SUDO_ASKPASS Helper (zenity / ssh-askpass)` - 5 edges
7. `install.sh Behavior` - 5 edges
8. `SPEC Open Questions` - 5 edges
9. `Twingate Toggle GNOME Shell Extension` - 4 edges
10. `Install and Set Up Twingate Step` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Tile 'Set up Twingate…' State` --conceptually_related_to--> `Twingate Quick Settings Tile`  [INFERRED]
  docs/ideas/first-run-setup.md → README.md
- `Start/Stop via systemd D-Bus StartUnit/StopUnit` --semantically_similar_to--> `Start/Stop via twingate CLI with sudo`  [INFERRED] [semantically similar]
  docs/ideas/first-run-setup.md → SPEC.md
- `Install and Set Up Twingate Step` --semantically_similar_to--> `install.sh Behavior`  [INFERRED] [semantically similar]
  docs/ideas/first-run-setup.md → SPEC.md
- `Three-State Detection (no client / not set up / set up)` --conceptually_related_to--> `twingate status Parsing (online/starting/authenticating)`  [INFERRED]
  docs/ideas/first-run-setup.md → SPEC.md
- `Start/Stop via systemd D-Bus StartUnit/StopUnit` --references--> `systemd over D-Bus System Bus`  [INFERRED]
  docs/ideas/first-run-setup.md → SPEC.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Tile state refresh mechanism** — spec_status_parsing, readme_quick_settings_tile, readme_top_bar_vpn_icon [EXTRACTED 1.00]
- **Start/stop with sudo, logging and failure notification** — spec_start_stop_flow, readme_failure_notification, readme_twingate_toggle_log [INFERRED 0.85]
- **Current sudo-based start/stop flow (1.2.0)** — spec_start_stop_flow, spec_twingate_cli, spec_sudo_askpass_helper, readme_twingate_toggle_log, spec_failure_notification [EXTRACTED 1.00]
- **First-run setup paste-step flow** — docs_ideas_first_run_setup_first_run_setup_dialog, docs_ideas_first_run_setup_paste_step, docs_ideas_first_run_setup_install_setup_step, docs_ideas_first_run_setup_polkit_rule, docs_ideas_first_run_setup_desktop_notifier [EXTRACTED 1.00]
- **Redesign driven by extensions.gnome.org review rules** — docs_ideas_first_run_setup_ego_review_guidelines, docs_ideas_first_run_setup_no_root_principle, docs_ideas_first_run_setup_systemd_startunit_stopunit, spec_sudo_askpass_helper [INFERRED 0.85]

## Communities (8 total, 0 thin omitted)

### Community 0 - "Extension Core Module"
Cohesion: 0.16
Nodes (8): ASKPASS_PATH, CACHE_DIR, ensureAskpass(), LOG_PATH, runAction(), TwingateIndicator, TwingateToggle, TwingateToggleExtension

### Community 1 - "Setup Dialog Design"
Cohesion: 0.18
Nodes (10): twingate-desktop-notifier User Service (Sign-in), First-Run Setup Dialog, GNOME Shell ModalDialog, Tile 'Set up Twingate…' State, French UI Strings (Mot de passe, Installe zenity), SPEC Open Questions, SUDO_ASKPASS Helper (zenity / ssh-askpass), Supported GNOME Shell Versions 46-48 (+2 more)

### Community 2 - "Install And Setup Steps"
Cohesion: 0.29
Nodes (5): Install and Set Up Twingate Step, Official Twingate Install Script (apt/rpm repo), twingate setup (interactive, root), install.sh Behavior, metadata.json version / version-name + CHANGELOG

### Community 3 - "Releases And Client"
Cohesion: 0.29
Nodes (7): Changelog, 1.0.0: first release, 1.1.0: install script sets up Twingate client, 1.2.0: D-Bus following of twingate.service, Twingate Quick Settings Tile, Twingate Linux Client, Top-bar VPN Indicator

### Community 4 - "Privilege And Review Rules"
Cohesion: 0.33
Nodes (4): extensions.gnome.org Review Guidelines, Don't Ask Again Polkit Rule, ~/.cache/twingate-toggle.log, Start/Stop Failure Notification

### Community 5 - "State Detection And Refresh"
Cohesion: 0.33
Nodes (5): Three-State Detection (no client / not set up / set up), Success Criteria, systemd over D-Bus System Bus, Testing Strategy (syntax checks + manual checks), twingate CLI

### Community 6 - "Install Script Helpers"
Cohesion: 0.60
Nodes (5): ask(), die(), info(), install.sh script, warn()

### Community 7 - "User-Facing Features"
Cohesion: 0.40
Nodes (4): Command Failure Notification, Top-bar VPN Icon, Troubleshooting, Twingate Toggle GNOME Shell Extension

## Knowledge Gaps
- **8 isolated node(s):** `1.1.0: install script sets up Twingate client`, `Top-bar VPN Icon`, `Troubleshooting`, `1.2.0: D-Bus following of twingate.service`, `Top-bar VPN Indicator` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 18 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Twingate Quick Settings Tile` connect `Releases And Client` to `Setup Dialog Design`, `State Detection And Refresh`, `User-Facing Features`?**
  _High betweenness centrality (0.276) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Twingate Quick Settings Tile` (e.g. with `1.0.0: first release` and `Tile 'Set up Twingate…' State`) actually correct?**
  _`Twingate Quick Settings Tile` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `1.1.0: install script sets up Twingate client`, `Top-bar VPN Icon`, `Troubleshooting` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `install.sh Behavior` connect `Install And Setup Steps` to `Setup Dialog Design`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `twingate status Parsing (online/starting/authenticating)` (e.g. with `Three-State Detection (no client / not set up / set up)` and `Refresh on twingate.service PropertiesChanged (D-Bus)`) actually correct?**
  _`twingate status Parsing (online/starting/authenticating)` has 2 INFERRED edges - model-reasoned connections that need verification._