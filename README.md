# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-ff2e88)](https://make.fun/bounty/gta6-trophy-guide-01)
[![GTA VI](https://img.shields.io/badge/GTA%20VI-55%20trophies-2ee6d6)](https://make.fun/bounty/gta6-trophy-guide-01)
[![offline](https://img.shields.io/badge/offline-static%20app-ffc94d)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline static web app that tracks all **55 official Grand Theft Auto VI trophies** on PlayStation 5 — every trophy with a cited guide, a 6-stage platinum roadmap, a missable watch list and a spoiler mode.

## What it does

- **Tracker** — checklist over all 55 official trophies (1 platinum / 2 gold / 6 silver / 46 bronze), saved in localStorage. Search, kind filters (Story / Activities / Collectibles / Missable), grade filter, hide-earned, per-trophy notes, export/import save as JSON.
- **Audit strip** — always visible: 55 official trophies, list checked 19 Nov 2026 against Exophase, 0 missing, 0 blank guides, 1,230 PSN points total.
- **PSN points** — every trophy shows its standard PlayStation points (bronze 15, silver 30, gold 90, platinum 180); the header totals your earned points out of 1,230.
- **Roadmap** — all 55 trophies grouped into 6 stages, each with earned counters and points, so you can work the platinum in order.
- **Missable Watch** — the 7 trophies flagged from the wording of their official descriptions. Each guide states plainly that the flag is our reading and the trigger is unconfirmed (the game released 19 Nov 2026).
- **Spoiler mode** — masks unearned story trophies (and the platinum) everywhere, including Next-up.
- **Next-up planner** — your next three unearned trophies in roadmap order.
- **Dated citations** — every trophy shows its sources with dates: Exophase (official list, 18 Nov 2026) and, where a count is tracked, PSNProfiles (19 Nov 2026).

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network, no account. Your progress never leaves your device.

## Sources

- Official trophy list (names, descriptions, grades): [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/), checked 18 Nov 2026.
- Tracked counts for grind trophies: [PSNProfiles](https://psnprofiles.com/trophies/grand-theft-auto-vi), checked 19 Nov 2026.

Unofficial guide, not affiliated with Rockstar Games.

---

Built for the [make.fun bounty "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01) — invite link: https://make.fun/r/bsqaxrmg
