# HEIMR visual system

This directory is the authoritative visual source for the HEIMR game. `visual-system.json` defines the shared camera, palette, character scale, animation rows, world sources, reusable environment motifs, collision semantics, and reference art.

## Locked character scale

All four playable sheets use 72×72 cells, three gait columns, and four direction rows. The runtime renders Maverick at 60 logical pixels, Dad at 74, Finn at 48, and Heimr at 52. Maverick must retain normal child proportions and must never be replaced by the rejected giant-head concept.

## World sources

- `world/forest-master-v1.webp` — porch, woodline, creek, crossing, trail, shore, vegetation, rocks, and foreground canopy source.
- `world/home-master-v1.webp` — warm cabin interior, kitchen, hearth, entry, workbench, storage, and Finn’s bed source.

The named crops in `visual-system.json` are the reusable motif library. Collision and depth data remain authored separately so visible obstacles and physical blockers stay aligned.

## Reference hierarchy

1. The shipped sprite sheets and world sources are the playable truth.
2. `reference/gameplay-camera-target-v1.webp` governs camera, scale, depth, and readable paths.
3. `reference/environment-scenes-v1.webp` extends that language to deep forest, crossing, shore, home, and future discovery spaces.
4. `reference/heimr-promotional-master-v1.webp` governs mood and character relationships, not gameplay scale.

Concept references never override the exact proportions or collision rules in `visual-system.json`.
