# Studio LaDuke House: Room-by-Room Sign-Off

**Status: NOT APPROVED FOR OWNER WALKTHROUGH.** This checklist is a gate, not a list of nice-to-have polish. A successful deployment or passing browser smoke test does not imply that a room feels finished.

## Approved direction (binding)
**Owner approved:** `1C, 2C, 3C, 4C, 5C, 6C, 7C, 8C, 9B, 10C, 11C, 12B` on November 23, 2026. Read `HOUSE_APPROVED_ART_DIRECTION.md` and `HOUSE_ROOM_IMPLEMENTATION_PLAN.md` before editing or signing off any room.

**Art-direction gate:** Handsome and playful, **not run-down**. Rich carved wooden details, varied black/white checker patterns, layered warm and theatrical color, richly colored vintage architecture and one singular physical object or surprise per key room. The living room needs the approved **orange-and-purple modular vinyl couch**; the central stained glass must depict the **actual five-note star**. The house escalates in wonder without losing architectural continuity. Generic well-appointed cabin plates **do not pass** this visual standard.

The approved palette-token stylesheet (`assets/house-approved-style.css`) and `approvedRoomIdentity` in `assets/house-director.js` provide a **shared interface foundation only**. They do not count as completed rooms, custom furnishings, physically mapped doorways or final visual approval.

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

## Additional nested HTML entrypoints (8)

A static link/asset audit has now checked **all 27 HTML files and 245 local references**, with **zero missing local paths**. This is existence validation, not proof that those destinations are visually complete or playable. Add each to the visual/gameplay review:

- [ ] `bob-bureau/index.html` | mobile/desktop screenshot, meaningful interactions, route in and back
- [ ] `commissions/index.html` | mobile/desktop screenshot, meaningful interactions, route in and back
- [ ] `game/visual-comparison.html` | mobile/desktop screenshot, meaningful interactions, route in and back
- [ ] `games/alder-crawl.html` | mobile/desktop screenshot, meaningful interactions, route in and back
- [ ] `games/heimr-visual-system.html` | mobile/desktop screenshot, meaningful interactions, route in and back
- [ ] `games/heimr.html` | mobile/desktop screenshot, meaningful interactions, route in and back
- [ ] `games/heimr.viewport-review.html` | mobile/desktop screenshot, meaningful interactions, route in and back
- [ ] `games/prism.html` | mobile/desktop screenshot, meaningful interactions, route in and back

**Current site-wide link audit:** `node qa/site-links-audit.cjs` (latest run: 27 HTML files, 245 local references, 0 missing). This supplements but does not replace the 27-room screenshot and object-action test `qa/house-audit.cjs`.

## Known release-blockers pending review

- The 16 supplementary Pexels background plates need a style-continuity review and should be replaced if they look like unrelated homes rather than one coherent imaginary house. Source credits: `house-scene-sources.md`.
- Personal objects, especially the owner's **actual yellow Tom DeLonge Strat, pink guitar, original five-note star and authentic artwork**, must match real supplied references. Decorative substitutes do not satisfy this item.
- Existing standalone games and deep pages have their own visual language; ensure entryways into and out of them feel intentional, not like accidental separate websites.
- Recheck all navigation after replacing the old text-only object popups with direct transitions and in-scene responses.
- No one should tell the owner to go inspect the house until all known major inconsistencies are corrected and this matrix is signed off.

## Repeatable audit

Serve the repo locally and run `npm install --no-save playwright && npx playwright install chromium && python3 -m http.server 8765`, then in a separate shell run `node qa/house-audit.cjs`. The script writes screenshots and JSON under `/tmp/studio-laduke-house-qa`. Review every screenshot visually and fix problems before marking **V**.

## Iteration log — November 23, 2026: exploration and connected discoveries

**Code completed and published, not visual sign-off:**

- The panorama camera now eases arrow/keyboard movement and adds restrained pointer-release momentum. Direct finger dragging remains immediate, and `prefers-reduced-motion` disables the motion smoothing.
- `assets/house-adventure.js` and `assets/house-adventure.css`: optional physical-ticket-styled **Pocketbook** recording eight real room discoveries, with safe local-only persistence, keyboard access, an accessible announcement and reset control.
- `assets/house-approved-style.css`: gentle cross-room fade and room-specific colored-glass lighting, retaining the approved orange/purple/checkerboard design tokens without turning real photos into cartoons.
- Integration in `house.html`: discoveries are recorded when relevant physical objects are interacted with; resolving the escape code records its own event. Journal navigation returns to its room.
- A preliminary vector couch test did **not** match the photo-rich art target and was **discarded**, not integrated. The approved orange-and-purple couch remains a critical visual-to-build item.

**QA actually performed for this batch:**
- Current local browser test: **27/27 scene renderers**, zero browser script/asset errors, zero failed non-puzzle interaction steps; **19/19 root entry pages** loaded. This is functional smoke coverage, not gameplay completion.
- Link audit: **27 total HTML files**, **248 local references**, **0 missing files**.
- iPhone-size Playwright interaction proof: open the Living Room, collect its object, open/close Pocketbook, reload and retain progress, use smoothly eased camera arrows, travel to Front Hall, and confirm reduced-motion immediate panning.
- **Live production** browser proof: new stylesheet loaded, Pocketbook opened and showed an entry after object interaction, zero browser exceptions, zero failed asset/network requests.

**Open visual release blockers:** all custom high-fidelity rooms, actual five-note-star stained glass, genuine personal guitars and artwork, orange/purple modular couch, physically anchored doors and object hitboxes, cohesive architecture, deeper game playthroughs and final iPhone Safari review. No owner walkthrough approval.

**Next owner input:** `HOUSE_NEXT_CHOICES.md` contains Batch 02 codes **1–4**, with A/B/C/D options and free-text alternative. The previously approved 12 decisions stay unchanged.

## Iteration log — November 23, 2026: Batch 02 selections 1D / 2D / 3D / 4C

**Owner-approved, locked:** Free exploration + opt-in hidden thread, mixed-media curiosities, the authentic five-note skylight above a **central atrium**, and a **semicircular curved orange-and-purple modular sofa** gathered around a characterful vintage coffee table. Full contractual details: `HOUSE_NEXT_CHOICES.md` and `HOUSE_ROOM_IMPLEMENTATION_PLAN.md`.

**Published incremental implementation (not visual completion):**
- `assets/house-adventure.js`: optional **Follow a hidden thread** switch defaults off, offers progressive narrative hints, and preserves all unrestricted exploration. Toggle persists locally and never gates rooms.
- Pocketbook entries now render varied media: clearly imaginary ticket-like props, actual existing site book/cartridge artwork, and destinations (including Music Room), while avoiding unconfirmed five-note artwork. No stock music is misrepresented as an original recording.
- `assets/house-adventure.css`: physical paper and scrapbook media styles and accessible story switch.
- `assets/house-director.js` and `assets/house-approved-style.css`: time-of-day colored atrium lighting shared by **foyer, main hall and upstairs landing**, using the visitor's local clock. The complete skylight glass geometry, lighting integration and atrium architecture are **not yet built**.
- The previously rejected flat couch illustration remains discarded. **4C is a precise art requirement, not a complete sofa currently present on site**.

**QA evidence:** New browser regression verified opt-in default off, story hint on, mixed-media cards, local persistence across reloads, passage between rooms, and time-of-day light in the three atrium rooms; 0 browser/asset errors. Full smoke test still passes **27/27 rooms and 19/19 top-level HTML pages**. Repository local-reference audit: **27 HTML pages**, **248 local references**, **0 missing**. Published-site mobile browser verified Pocketbook toggle, foyer discovery, morning atrium light in America/Sitka time, and no browser errors.

**Release gate stays closed:** The authentic five-note glazed skylight and structural atrium, photoreal curved orange/purple vinyl sofa plus coffee table, owner-specific art fidelity, object-aligned door hotspots, and whole-house visual sign-off are still incomplete. Do not ask the owner to inspect the full house yet.

## Live exploration refinement, November 23, 2026

- **Camera history improvement**: Returning to a previously visited room using an internal door, the map, or browser Back now restores that room's previous horizontal view instead of snapping the camera to center. The stored value is the *intended pan target*, so an easing animation in progress does not create a partially restored angle.
- Verified in browser with an iPhone-size viewport, using Front Hall → Living Room → browser Back. **Live production** check restored the same ~257 px camera position, with no JavaScript exceptions or failed network requests. Commit: `54fb12a7f23b08ddec00f9c75112bbd474ec45f6`.
- A local **SVG-overlay atrium skylight** prototype was rendered at the Front Hall, Main Hall, and upstairs landing. It responded to touch but looked pasted over existing room photography; **rejected and never published**. This is a design blocker, not a valid finished implementation. Do not simply add flat graphics over stock rooms.
- **Tooling**: Runway was checked only for optional image capability; no generated artwork or Runway credits were used. There is no connection prerequisite for normal GitHub/Vercel coding and testing.

**Release status:** The true five-note star/skylight and curved orange-purple couch still require cohesive, image-quality physical scenes. Keep all visual sign-off boxes unchecked until verified.

## New free real-3D foundation, November 23, 2026

**User authorization:** Use every practical *free* method, OpenAI-authored code, open-source software, and properly licensed no-cost assets. Do **not** incur paid API, model-generation, Runway, software, storage or other subscription costs without a new explicit price approval.

**Published code:**
- `house-3d.html`, `assets/studio-house-3d.js`, `assets/studio-house-3d.css`; reachable from the original House floor plan (carved wood/brass gateway). The original 27-room house is preserved unchanged as the fallback.
- First genuine 3D atrium and living room: **408 meshes / 20 interactive targets** at latest local/prod stage, with full 3D staircase, carved trim, balcony, checker floor, glass skylight, real spatial orange/purple curved modular vinyl couch, sculptural coffee table, lamps and turntable.
- Physical lighting and material response, swaying trees and rain geometry visible beyond windows, local-clock atmosphere, and optional synthetically generated bowl/wind sound. No autoplay, no copyright media, no paid audio.
- Real existing owner art mounted in spatial frames. Models have raycast object actions plus keyboard-accessible object controls. Progress earned in new 3D scene is recorded in the existing on-device House Pocketbook.
- Self-hosted CC0 512px PBR color/roughness/normal maps from Poly Haven's **wood_floor** (`assets/pbr/`), with a built-in procedural fallback; source and license in `HOUSE_3D_ARCHITECTURE.md`.
- Adaptive detail for slower devices, capped pixel resolution, reduced-motion behavior, hidden-tab render pause and fallback to original House if WebGL or CDN module import fails.

**Verified:**
- Published browser tests in desktop and 390x844 phone-sized Chromium showed WebGL scene render, room transitions, no network or JavaScript errors at the tested revision, and correct fallback when the Three.js CDN was intentionally blocked.
- Full cross-page journey verified on the published site: **Front Hall → floor-plan 3D gateway → modeled Living Room → keyboard-selected vinyl sofa → back to old House → Pocketbook**, retaining discovery `living:sofa` with no errors.
- Repository static audit: **28 HTML files / 253 local links and asset references / 0 missing** at the tested revision.
- PBR asset URLs returned HTTP 200 from the live site; final post-cache-bust browser verification of the three runtime texture requests remains open until it is observed.
- Testing used cloud Chromium with software GPU emulation, NOT an actual iPhone Safari. Do not claim stable 30/60 FPS on real hardware.

**Still not approved for complete House walkthrough:** two modeled viewpoints are a *foundation*, not 27 completed 3D rooms. Current first-model aesthetic is spatially real but still too stylized/low-poly to meet the owner's ultimate photoreal/exciting bar. The original actual five-note skylight artwork requires source-faithful tracing, vinyl needs physically plausible tufting and shading, and every doorway/hit region must be physically correct. The visual quality gate remains closed.

**Canonical plan:** `HOUSE_3D_ARCHITECTURE.md` and the earlier approved art direction. Continue with genuine PBR materials, precise custom objects, animated environment, mobile optimization and room-by-room migration; do not regress into stock-photo overlays or call the whole house done.
