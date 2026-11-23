# Studio LaDuke — Approved full-house implementation plan
**Revision: November 23, 2026 · Owner selections `1C 2C 3C 4C 5C 6C 7C 8C 9B 10C 11C 12B`**

**Binding documents:** `HOUSE_APPROVED_ART_DIRECTION.md` (creative approval), `HOUSE_VISUAL_BLOCKERS.md` (currently known defects), `HOUSE_SIGNOFF.md` (release gate), and the existing repository code.

## Work rules

- The 27 rooms must feel like **one house**: a lovingly restored, artist-curated, surprising building, not 27 stock photographs. Rich walnut and carved wood anchor the brighter pigments. Checkerboard appears at deliberately chosen points, never every surface. Always preserve realistic architectural scale.
- Pacing: **front door charming → ground floor lively → upstairs intensely personal → attic magical → basement full-throttle creative play**.
- Each room owns a distinct floor, material/color composition and *at least one* tangible interaction. Use **physical, object-aligned** controls, not indiscriminate glowing dots or caption dialogs.
- **The real five-note-star stained-glass fixture is the center of gravity.** Put it in a sensible architectural volume; let related details echo through the house without reproducing the emblem incorrectly.
- **Do not create false authenticity.** Use actual owner images, user-approved designs and original art assets for guitars/art/personal mementos. Supplemental photo plates are scaffolds only.
- Save every coherent code batch; then test **WebKit/iPhone + desktop**, front/left/right pan, touch, focus/keyboard, reduced motion, navigation in and out, link health, and error logs. Do not mark screenshot or final approval based solely on automated green results.

## Work queue

**P0 identity sample:** finish `foyer` (authentic stained-glass star), `living` (orange/purple modular vinyl sofa) and `hall` (real carved architecture and checkered transitions). Capture a synchronized style sample with the same geometry, materials and lighting. Reject if still photographic collage.

**P1 contiguous ground floor:** `coat → dining → kitchen → pantry → art → bath → mud → laundry → porch`. Follow an actual walking path and verify all connected transitions.

**P2 upper floor:** `landing → bed → closet → bath2 → guest → library → music → roof`. The Music Room is a separate highest-fidelity milestone because of real instruments and vintage gear.

**P3 personality zones:** `attic → basement → arcade → recording → cinema → escape → vault`. Maverick's Attic, the escape puzzle and the secret vault receive custom, not borrowed, scenes.

**P4 linked destinations:** inspect *all 27 HTML pages*, their internal routing and actual games to completion; style surrounding interfaces so the experience doesn't snap into an unrelated generic page.

## Ground floor: plans and acceptance

| Room / code | Palette, floor and architecture | Hero and tactile behavior | Done only when... |
|---|---|---|---|
| **Front Hall `foyer`** | Cream/walnut with narrow black-white checker floor and a plum stair/arch accent. Carved door jambs, real architectural glass opening. | **Owner's true five-music-note star** as an illuminated stained-glass installation, not a generic five-point star. Show moving light across tiles on interaction. | Door mapping to front, living, coat and workshop is true to built thresholds; stained-glass likeness confirmed. |
| **Coat Closet `coat`** | Compact warm cabinetry, deep plum inside, decorative wood hooks and striped runner. | Coats and a **real sewn pocket** that opens, reveals stubs and a guitar pick physically, then closes. | No duplicate pantry-shelf image; touch region on the pocket, not empty air. |
| **Living Room `living`** | **Black/white checker threshold → wood and rug**, carved arches, warm walnut, touches of teal and brass. | **Chunky orange-and-purple modular vinyl couch** (orange bases, purple rolled/tufted bolsters), lamps, movie/music artifacts and lived-in personal discoveries. | A recognizable living room, not the Music Room plate; couch is unquestionably the hero, with real furnishings and object-specific actions. |
| **Main Hall `hall`** | Playfully irregular woodwork: carved newel, alternating checkerboard risers, one colored-glass panel, cream walls with deep wood wainscoting. | A real stair, inset art and physical branch points. Subtle echoes of star colors guide guests deeper. | A unique corridor, not the same asset as foyer; physically coherent access to art, living and upstairs. |
| **Dining Nook `dining`** | Warm wood floor and mustard/plum upholstery around a checker-inlaid table, colored glass pendant. | A handmade board-game box actually opens or launches a playable game. | No anonymous bright dining photo; all kitchen/pantry/living exits work. |
| **Kitchen `kitchen`** | Apricot cabinets, dark cedar shelves, black-and-white tile backsplash, chrome and warm brass knobs. | Kettle/stove steam and a small pasta-related discovery, with real counters and rain outside. | Visible physical kettle aligns with interaction; recognizably a kitchen. |
| **Pantry `pantry`** | Sage green shelving, cream jars, orange/yellow labeled bins; simple patterned tile. | A jar/canister slides forward revealing a small oddity or family snack note. | Real food storage, not the same crate photo as vault/closet. |
| **Art Studio `art`** | Big daylight, turquoise/cream with messy *but cared-for* workbench, warm wood and checker textiles. | **Owner's genuine formline work, drawings, carved paddle, fabric and sewing experiments** shown as real physical objects; touch yields a work/gallery destination. | No generic art props pretending to be the owner's actual art; brush/object can be picked up or opened. |
| **Downstairs Bath `bath`** | Bold black-and-white tiles, apricot basin cabinet, vintage cream fixtures with carved wooden mirror frame. | Mirror reacts to steam; vintage light switch responds. | Room belongs to this house, not stark white stock bathroom. |
| **Mudroom `mud`** | Forest green walls, wet-boot rubber mat, varnished beadboard, little orange hooks and check runner. | Finn's **physical little doorway** and boots/coats; step outside to the Woods. | Rainy SE Alaska authenticity and useful routes; proper scale for dog door. |
| **Laundry `laundry`** | Lavender and warm white, checker cabinet doors, dark cedar shelving. | Washer/dryer door and missing sock discovery, not a decorative shimmer. | Washer/dryer visible; door to mud/kitchen functions. |
| **Back Porch `porch`** | Protected cedar porch, checker outdoor cushion, turquoise railing accents, rainy evergreen backdrop. | Rain, sheltered light fixture, access to The Woods/fire pit/greenhouse paths. | Not sunny California deck; coherent rainy lighting with both interior and forest. |

## Upper floor and attic

| Room / code | Palette, floor and architecture | Hero and tactile behavior | Done only when... |
|---|---|---|---|
| **Upstairs Landing `landing`** | Intricate carved staircase, checkered risers, warm wood and modest purple glass landing. | Four physical doorway choices and a rain-streaked window. | Upstairs volume logically joins main hall, library, guest and bedroom. |
| **Bedroom `bed`** | Aubergine/cream with vintage walnut, amber glass lights, small pattern accents; more restful than showpiece rooms. | Distinct real bed and bedside lamp switch with warm-to-dark lighting. | Light actually changes the photographed/rendered space; bed remains inviting. |
| **Walk-in Closet `closet`** | Teal wardrobe interiors, black lacquer racks, checker drawer liner, brass rails. | **Signature black Raven wing denim jacket**, hats, fabric pattern samples, moccasins, costume runway rack. | Art and garments are anchored to authentic user design references and can be examined. |
| **Upstairs Bath `bath2`** | Purple tile details, warm cream, stained-glass window, carved mirror frame. | Mirror fog / light interaction. | Clearly part of same building and visually distinct from downstairs bath. |
| **Guest Room `guest`** | Moss green and peach, vintage orange reading chair, geometric quilt and light wood. | Reading lamp and one peculiar family artifact or handmade puzzle. | Distinct welcoming space; not another copied stock bedroom. |
| **Library `library`** | Rich walnut shelves, checker ladder/platform detail, burgundy reading seat and colored book spines. | **Real published/written Studio LaDuke books** on shelves; a crooked bookcase rotates to an actual attic stair. | Book interaction opens authentic content and physical shelf aligns with hidden route. |
| **Music Room `music`** | **Green shag**, walnut wall cabinetry, chrome and turquoise accents, warm lamp glow, subtle checker record sleeves. | User's **actual yellow Tom DeLonge Strat** and **actual pink guitar** in recognizable proportions; vintage record equipment and turquoise glitter Kustom amplifier. | Instruments visually faithful to real supplied photos, wall taps match guitars, music controls and link function. Must not reuse living room background. |
| **Roof Lookout `roof`** | Hand-built cedar lookout, stained colored glass inset, nautical black-white cushion; rain and Ketchikan view. | Telescope/observation object, rain sound opt-in, inviting return stair. | Rainy water-and-trees outside, not sunny generic stock roof. |
| **Maverick's Attic `attic`** | Playful custom geometry, orange/yellow/teal, alternating wood and foam/tile patterns, cozy low rafters. | LEGO shelves, shark and snow leopard motifs, game consoles, **Super Maverick's World/Fort** physical launch. | Believably Maverick's own kingdom and clearly linked from library's secret stairs. |

## Basement: more adventurous without becoming rundown

| Room / code | Palette, floor and architecture | Hero and tactile behavior | Done only when... |
|---|---|---|---|
| **Basement Landing `basement`** | Dark wood and purple-green neon *accents*, polished checkers, brass electrical panels. | Working green indicator/utility switch and cinematic arches leading to subrooms. | Clear exits to mudroom, arcade, cinema and recording booth. |
| **Basement Arcade `arcade`** | Black-white checker floor, deep plum walls, multicolored cabinet fronts and amber/purple marquee lighting. | Each **distinct physical cabinet** launches its correct playable game; original pool/escape connections. | Actual cabinet-to-game routing verified, no generic directory substitute for all cabinets. |
| **Recording Booth `recording`** | Deep burgundy, old-school wood acoustic slats, turquoise/amber controls, vintage industrial mic and hardware. | Physical tape deck or mixer links to actual Studio LaDuke music / *Moments* material with opt-in audio. | It reads as a real booth, not an unrelated amplifier stock photo. |
| **Little Cinema `cinema`** | Aubergine plush seating, orange vinyl armrests, geometric curtains, checker threshold and brass aisle lights. | Real projector turns on and shows owned/original content on a screen, never copyrighted film clips. | Clear screen, seats and transport-like player controls, not close-up projector still. |
| **Escape Room `escape`** | Elaborate stained wood, weird built-ins, a contrasting green mechanism, controlled theatrical violet illumination. | Physically grounded clues: lamp, reel and trophy lead to **472** keypad sequence. Door/compartment responds with animation. | Puzzle playthrough verified end to end; no unsupported floating clue glints. |
| **Curiosity Vault `vault`** | Secret jewel box in chrome, lacquer black and saturated purple/orange velvet, checker details; architecturally different from pantry. | Genuine memorabilia, tiny discoveries and a dramatic opening event; the reveal is earned after escape. | Distinct *vault* scene, inaccessible before solving, not the same old shelf image. |

## Global work packages (across ALL rooms)

1. **Geometry/reference sheet:** draw a coherent plan, mark where the central five-note-star glass belongs, record every doorway mechanism and visual sightline. Avoid contradictions like opening a door labeled for the current room.
2. **Shared style kit:** carved wood trim grammar, checkerboard floor tile variants, vintage switches/knobs, leaded glass/colored reflections, upholstered vinyl patterns, warm materials, palette token system. Maintain distinct per-room color accents without overwhelming the visitor.
3. **Actual personal assets:** inventory and validate actual star, yellow and pink guitars, artwork, Kustom cabinet, runway garments and Maverick-specific references; build once, reuse without distortion.
4. **In-room interactions:** per-room prop register with `visual ref → object hit shape → action → state → reverse/return → accessibility`.
5. **Camera/QA:** multi-view iPhone WebKit screenshots for every room, desktop, reduced motion, keyboard focus and touch, plus code and local links audit; replace flawed screenshots until acceptable.
6. **Linked pages (all 27):** `index.html`, `house.html`, `workshop.html`, `forest-path.html`, `directory.html`, `projects.html`, `about.html`, `books.html`, `music.html`, `gallery.html`, `forgotten-works.html`, `bob.html`, `ogbob.html`, `brain.html`, `komplant-cabinet.html`, `mavericks-fort.html`, `mcbrides.html`, `mortal-komplant.html`, `pool.html`, `bob-bureau/index.html`, `commissions/index.html`, `game/visual-comparison.html`, `games/alder-crawl.html`, `games/heimr-visual-system.html`, `games/heimr.html`, `games/heimr.viewport-review.html`, `games/prism.html`. Each requires content/visual/play testing as applicable, not simply an HTTP 200.
7. **Final release gate:** `HOUSE_SIGNOFF.md` has 27 completed per-room `B/T/V/S` statuses plus all linked page and gameplay gates. Owners only get the tour invitation after **all** high/critical visual blockers are resolved; small optional polish may remain logged.

## Current execution state (do not conflate)

- **Approved:** creative direction above and these explicit implementation specifications.
- **Existing in code:** photographic scene scaffolding, room routing, coarse prop interactions, source tracking and a reproducible local smoke test. No claim of high-fidelity artistic completion.
- **Still blocked:** all 27 room visual sign-offs, personalized objects, physically aligned multi-view interactivity and true full-game walkthrough QA.
- **Priority next coding batch:** `foyer`, `living`, `hall`; only after this style reference is technically and visually credible should it be scaled across floors.
