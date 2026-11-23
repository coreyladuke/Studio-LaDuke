# Studio LaDuke House: Visual and Interaction Defect Register

**Release gate: BLOCKED.** This is the explicit list of remaining mismatches discovered by looking at all 27 mobile room screenshots and the contact sheets for 19 linked top-level pages. A Playwright smoke test passing is not equivalent to a visual/interaction approval.

**Target (updated for approved maximalist direction, November 23, 2026):** A beautifully maintained, *high-character*, brightly accented, retro artist's home with carved wood, varied checkerboards, dramatic color, exciting architecture and playful discoveries. The living room's approved orange-and-purple modular sofa and the authentic five-note-star stained glass are critical. The owner specifically rejected a too-perfect brown luxury cabin or run-down look. Original earlier target detail: ONE believable, richly detailed, lived-in Studio LaDuke house: rainy SE Alaska atmosphere, wood/cedar grain, authored art and tactile objects, personal guitars and movie Easter eggs, grounded doorways, coherent proportions and camera. No generic photomontage/stock photographs where the room is supposed to show one particular person's belongings. All doors should lead where they appear to lead.

## Ground floor

| Room | Priority | Outstanding visual or interaction mismatch | Acceptance requirement |
|---|---|---|---|
| Front Hall (`foyer`) | High | Reuses the same front-room doorway photograph as Main Hall; five-note mark is currently an overlay, not proven identical to the authentic owner reference | Distinct entrance perspective, correct five-note star source, physical entrance and closet/living/workshop transitions |
| Coat Closet (`coat`) | High | Reused dark shelf image with one drawer reveal, though this is supposed to be a coat closet with old ticket stubs in a pocket | Hanging coats, real pocket opening, tangible tickets/pick, distinct spatial view |
| Living Room (`living`) | High | Atmospheric music-room photograph rather than a recognizable living room; shares source with Music Room; no proven owner guitar fidelity | Distinct lived-in seating/cinema room with the right objects, furniture and actual connections |
| Main Hall (`hall`) | High | Identical room photograph to Front Hall; overlay door hotspots aren't reliably attached to actual illustrated thresholds | Distinct corridor view with physically sensible doors and scale |
| Dining Nook (`dining`) | High | Bright stock dining room looks like a different house | Moody wooden dining nook consistent with surrounding rooms, tabletop game interaction |
| Kitchen (`kitchen`) | High | Close-up stock cooking-pot image instead of a believable navigable kitchen | Real kitchen view, countertops, stove, rain outside, kettle responds |
| Pantry (`pantry`) | High | Reused generic storage shelf/packing boxes rather than food | Pantry shelving, labeled jars/snacks, tangible discoveries |
| Art Studio (`art`) | High | Dark close-cropped stock-like studio view, missing owner's specific artwork and workable art objects | Real owner supplied artwork and materials physically integrated; no decorative description glints |
| Downstairs Bathroom (`bath`) | Medium | White bathtub image looks unlike cedar-rich rooms | Warm, coherent bathroom with functional mirror interaction |
| Mudroom (`mud`) | High | Bright white stock interior, not wet-boot SE Alaska mudroom; Finn door lacks physical location | Boots/coats, actual dog door, correct path to Woods/basement |
| Laundry (`laundry`) | High | Dim, unclear image doesn't read as laundry room | Washer/dryer and lost sock interaction in believable space |
| Back Porch (`porch`) | High | Sunny bright generic deck contradicts rain-soaked Ketchikan atmosphere | Rainy wooded porch, credible route outdoors, ambient atmosphere |

## Second floor and attic

| Room | Priority | Outstanding mismatch | Acceptance requirement |
|---|---|---|---|
| Upstairs Landing (`landing`) | High | Bright modern stock staircase diverges from cabin character | Consistent house stairs; doors lead to real corresponding rooms |
| Bedroom (`bed`) | Medium | Warm orange stock bedroom but unrelated furnishings; lamp isn't visually aligned | Distinct intimate room with visible lamp and lighting changes |
| Walk-in Closet (`closet`) | High | Closeup shelves lack any owner's designed clothes | Raven jacket, hats, textiles, physical wardrobe display |
| Upstairs Bathroom (`bath2`) | High | Very bright modern bathroom unlike rest of house | Cohesive materials and mirror/steam interaction |
| Guest Room (`guest`) | Medium | Generic warm guest bedroom with no personality | Furnished guest space, distinct from primary bedroom |
| Library (`library`) | High | Closeup empty writing desk, books not visible; movable bookcase secret stair isn't anchored to a bookcase | Real bookshelves, original book covers, physically responsive secret shelf access to attic |
| Music Room (`music`) | Critical | Reuses Living Room photo; yellow and pink instruments do not match actual supplied guitar photos and body shapes, screen-level guitar icons insufficient | Actual yellow Tom DeLonge Strat received at sixteen and actual pink guitar built into 3D-styled wall, audio/easter eggs |
| Roof Lookout (`roof`) | High | Sunny modern outdoor structure; no Ketchikan rain/water outlook | Moody cedar/water lookout; physical way back |
| Maverick's Attic (`attic`) | Critical | Stock image is close-up of old wooden mechanism, not a room made for Maverick | Warm kid-scale attic with custom LEGO, sharks/snow leopard, game table, meaningful entry into Fort |

## Basement

| Room | Priority | Outstanding mismatch | Acceptance requirement |
|---|---|---|---|
| Basement Landing (`basement`) | Medium | Generic stairwell photography, personality/continuity not proven | Cohesive darker corridor; credible arcade/cinema/booth doors, useful green panel |
| Basement Arcade (`arcade`) | Medium | Arcade cabinet photo is good but cabinets and their game destinations not individually verified as physical taps | Each named cabinet opens its own playable game, arcade/pool/escape routes |
| Recording Booth (`recording`) | High | Stock dark amplifier/corner isn't a real booth; Moments content pending | Credible microphone, recording desk, guitar gear, music destination |
| Little Cinema (`cinema`) | High | Close-up antique film projector but no theater or seats | Cozy cinema with projector/screen and an original film interaction |
| Escape Room (`escape`) | Critical | Highly saturated violet Prism bench photography looks unrelated to house; clue glints not grounded | Real atmospheric escape room with discoverable physical green lamp, reel, trophy, keypad and working 472 code |
| Curiosity Vault (`vault`) | Critical | Duplicated coat/pantry storage photo, missing vault reveal | Distinct genuinely secret memorabilia/curiosity space, only accessible after solving escape |

## Common blockers, all rooms

1. **Physical camera and door mapping.** Doors currently use a positional overlay on still photos. A green test doesn't establish that the doorway/hit region visually aligns. At phone scale, target must be object-aligned and never look like an unrelated floating hotspot.
2. **Interaction substance.** A glowing dot or CSS overlay alone does not constitute a satisfactory door, instrument, machine, surprise or game. Replace generic sparkle/toast fallbacks with scene-native object behavior or a genuinely useful destination.
3. **Asset fidelity.** Original artwork, five-note star and physical guitars must come from supplied reference pictures. Stock placeholders must not be passed off as authentic.
4. **Art-direction continuity.** Supplemental photographs from distinct properties and lighting schemes should be replaced with a single coherent house-like art system. Current images are transitional scene scaffolds.
5. **Visual acceptance.** Audit EVERY ROOM from at least front, left and right pan positions in iPhone Safari and desktop Chrome/Safari; capture and compare. No final sign-off based on contact sheets or generic page load success.
6. **Accessibility and continuity.** Keyboard focus, touch scrolling/panning, real reduced-motion state, back navigation/history, overlays/map opening, all destination links and owner-only privacy require independent verification.

## Top-level page follow-up register

- `index.html`, `workshop.html`, `forest-path.html`: imagery is substantially closer to target but verify mobile camera hotspots, artwork fidelity, entrances and round-trip navigation.
- `directory.html`: large flat parchment directory is visually disconnected from immersive environment. Replace with physical in-world wayfinding or a subtle accessible fallback.
- `projects.html`: flat beige paper dominates scene; turn project selection into objects/workbench content rather than generic document panel.
- `about.html`, `books.html`, `music.html`: text-first overlays may be intentionally informational, but need visual integration, layout and true content audit.
- `bob.html`, `brain.html`, `gallery.html`, `forgotten-works.html`, `ogbob.html`: require detailed object interactions and owner image fidelity beyond load smoke test.
- `komplant-cabinet.html`, `mavericks-fort.html`, `mcbrides.html`, `mortal-komplant.html`, `pool.html`: independently PLAY/test games, touch controls, start/finish states, return navigation and graphical continuity. Merely loading the HTML is NOT completion.
- Every other HTML page linked from anywhere in the repo, including under `games/` and `commissions/`, must be discovered from the repository tree and added to the checklist if reachable.

## Existing automated QA (not visual sign-off)

The most recent full Playwright smoke pass after local image hosting returned **27/27 photo-based scene renderers, zero generic SVG room scenes, zero non-puzzle dialogs, zero room interaction exceptions, and 19/19 root HTML pages loading without JS/asset errors**. The script is `qa/house-audit.cjs`. These technical checks passed, but the above high-priority visual defects remain.

**Do not invite the owner to perform a walkthrough while any critical/high issue remains.** Update `HOUSE_SIGNOFF.md` only after inspecting the actual current results and eliminating the recorded defects.
