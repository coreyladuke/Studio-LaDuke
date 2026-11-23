# Studio LaDuke House: Room-by-Room Sign-Off

**Status: NOT APPROVED FOR OWNER WALKTHROUGH.** This checklist is a gate, not a list of nice-to-have polish. A successful deployment or passing browser smoke test does not imply that a room feels finished.

## Required standard for every scene

- [ ] Scene visually belongs to the same atmospheric, lived-in Studio LaDuke world, with dimensional furniture, believable materials, lighting and depth; no generic room templates
- [ ] Physical doors, props, hitboxes and navigation align with what visitors see; swipe-panning and direct tapping both work
- [ ] No decorative dead ends, duplicated/misleading door labels, filler text popups, fake interactions, or broken internal links
- [ ] Correct, real Studio LaDuke art and personal objects when the room promises them; no stock photo pretending to depict the owner's own belongings
- [ ] Every prop has a specific useful response (physical animation, discovery, puzzle, content or intentional destination) and a way back
- [ ] Mobile iPhone Safari viewport including safe areas; desktop; keyboard focus; reduced motion; accessible labels; no clipped critical content
- [ ] No JavaScript errors, missing assets, privacy exposure, or unintended owner-only access

## Room inventory (27)

Legend: **B** = built, **T** = automated runtime and interaction tests, **V** = screenshot viewed and composition reviewed, **S** = final sign-off. Mark B only when non-generic scene code exists, T only on successful current-version tests, V only after a human-equivalent visual inspection. **Do not mark S until all four plus the required standard pass.**

| Floor | Room (route) | B | T | V | S | Notes |
|---|---|---|---|---|---|---|
| Ground | Front Hall (`foyer`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Coat Closet (`coat`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Living Room (`living`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Main Hall (`hall`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Dining Nook (`dining`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Kitchen (`kitchen`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Pantry (`pantry`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | The Art Studio (`art`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Downstairs Bathroom (`bath`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Mudroom (`mud`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Laundry Room (`laundry`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Ground | Back Porch (`porch`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Second | Upstairs Landing (`landing`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Second | Bedroom (`bed`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Second | Walk-in Closet (`closet`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Second | Upstairs Bathroom (`bath2`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Second | Guest Room (`guest`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Second | The Library (`library`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Second | Music Room (`music`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Second | The Roof Lookout (`roof`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Attic | Maverick's Attic (`attic`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Basement | Basement Landing (`basement`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Basement | Basement Arcade (`arcade`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Basement | Recording Booth (`recording`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Basement | The Little Cinema (`cinema`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Basement | The Escape Room (`escape`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |
| Basement | The Curiosity Vault (`vault`) | [x] | [x] | [ ] | [ ] | Automated mobile scene/object smoke tests passed; visual approval blocked |

## Linked top-level pages (19)

All are separate entry points and must be opened on both mobile and desktop, not inferred from the house navigation test. A page loading without errors does **not** clear its visual or interaction review.

- [ ] `about.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `bob.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `books.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `brain.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `directory.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `forest-path.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `forgotten-works.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `gallery.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `house.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `index.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `komplant-cabinet.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `mavericks-fort.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `mcbrides.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `mortal-komplant.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `music.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `ogbob.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `pool.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `projects.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior
- [ ] `workshop.html` | load / navigation / interactive controls / visual consistency / accessible responsive behavior

**Current automated QA evidence:** 27 room renderers, 27 object-action smoke paths, all top-level page loads and their assets passed the latest local browser run. This does **not** clear visual sign-off, physical doorway alignment, quality of real objects, or deep game playthroughs. The detailed owner-protecting defect list is in [`HOUSE_VISUAL_BLOCKERS.md`](HOUSE_VISUAL_BLOCKERS.md).

## Known release-blockers pending review

- The 16 supplementary Pexels background plates need a style-continuity review and should be replaced if they look like unrelated homes rather than one coherent imaginary house. Source credits: `house-scene-sources.md`.
- Personal objects, especially the owner's **actual yellow Tom DeLonge Strat, pink guitar, original five-note star and authentic artwork**, must match real supplied references. Decorative substitutes do not satisfy this item.
- Existing standalone games and deep pages have their own visual language; ensure entryways into and out of them feel intentional, not like accidental separate websites.
- Recheck all navigation after replacing the old text-only object popups with direct transitions and in-scene responses.
- No one should tell the owner to go inspect the house until all known major inconsistencies are corrected and this matrix is signed off.

## Repeatable audit

Serve the repo locally and run `npm install --no-save playwright && npx playwright install chromium && python3 -m http.server 8765`, then in a separate shell run `node qa/house-audit.cjs`. The script writes screenshots and JSON under `/tmp/studio-laduke-house-qa`. Review every screenshot visually and fix problems before marking **V**.
