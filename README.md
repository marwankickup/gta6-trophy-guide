# Leonida Trophy Guide — GTA VI

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/marwankickup/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/marwankickup/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for [gta6-trophy-guide-01 "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Tracker** — all 55 trophies as a checklist; ticking one saves progress in localStorage. The header shows overall % complete, counts per grade (1 platinum, 2 gold, 6 silver, 46 bronze) and a platinum-progress line.
- **Per-trophy guides** — each trophy expands to its official description, grade badge, kind tag, a missable flag where it applies, and a guide written in our own words: what to do, where and how, and when it can be missed. Every guide names its sources beside it (PowerPyx's GTA 6 Trophy Guide & Roadmap, cross-checked against the full trophy lists on Sixshore, One More Game, GameMapa and GTA Spotter).
- **Roadmap to the platinum** — five stages built from the official descriptions: story first (60–80 hours), the 100% checklist (~100 hours), Strangers & Freaks and side strands (~10 hours), money and property, then the platinum.
- **Missable flags** — the one potentially missable trophy, Positive Mental Attitude (the Chapter 1 balcony meditation at Jason's house — no mission replay), is flagged with a visible badge, a warning banner, and a missable-only filter.
- **Filters + search** — by kind (story, collectibles, activities, combat, exploration, money, misc), by grade, by earned/unearned, and free-text search over names and descriptions.
- **Spoiler setting** — hides story trophies' names and descriptions (shown as “Hidden story trophy”) until each is earned.
- **Export / import / reset** — progress exports to a JSON file download and imports back from one.

## Run it

Serve `app/` with any static server and open `app/index.html` in desktop Chrome. It works with the network off: every file it loads is under `app/`, and the only request it makes is a same-origin fetch of `app/data/trophies.json`. Locally:

```
node serve.ts   # then open http://localhost:8080
```

## Sources

Official trophy names, descriptions and grades are as PlayStation publishes them, as carried by Exophase and PSNProfiles. Guide steps are drawn from PowerPyx and cross-checked against the lists above; nothing is copied from another guide. An original, unofficial fan guide — not affiliated with Rockstar Games or PlayStation, and it shows no Rockstar logo, artwork or game screenshots.
