# Studio LaDuke: Free Real-3D Production Architecture
**Status: first real WebGL foundation published, not a finished 27-room replacement. November 23, 2026.**

## Nonnegotiable visual target
An emotionally alive, welcoming, surprising, beautifully maintained artist's home with authentic personal art, orange-and-purple 1970s curved vinyl seating, checkerboard floors, carved wood, geometric details, realistic rain and wind, and a real architectural five-note stained-glass skylight. **Actual meshes, materials, depth, lighting and object behavior**, not a photograph with transparent SVG decorations. Visitors explore the owner's imagination.

Owner-approved decisions: `1C,2C,3C,4C,5C,6C,7C,8C,9B,10C,11C,12B`; refinements `1D,2D,3D,4C`. Keep the original twelve and later four linked to every custom room build.

## The living implementation

- Entry: `house-3d.html`. The regular `house.html` floor map includes an accessible physical-style gateway.
- Engine: **Three.js pinned to 0.187.0** (MIT licensed, using a free versioned jsDelivr ESM URL). No model-generation API charge and no subscription. Source: https://threejs.org/docs/ and https://github.com/mrdoob/three.js/
- Styling: `assets/studio-house-3d.css`; modeled scene: `assets/studio-house-3d.js`.
- Camera: smooth movement between an atrium viewpoint and curved-sofa living room. Mouse or touch drag to look; keyboard arrows, numbered room shortcuts, and physical-style room buttons.
- Architecture: actual 3D walls, beams, mouldings, checker floor, balcony, 13-step staircase with railing, five-section stained glass skylight, curved modular purple/orange vinyl couch, chrome and checker inlaid coffee table, real 3D framing around existing Studio LaDuke artwork.
- Atmosphere: physically lit materials, rain streak geometry, swaying 3D trees, moving scene details, local-clock skylight lighting, original user-initiated synthesised bowl-like chime and wind. **No copyrighted music playback**; no ambient autoplay.
- Interactions: skylight, lamps, vinyl seating, table, turntable, framed work, windows/rain. Object hits are through raycasting; keyboard/screen-reader object controls provide access without pointing.
- Persistence: collecting the sofa discovery writes the same on-device `studioladuke.house.discovery.v1` marker used by the existing Pocketbook, so progress connects across old and new experiences. No analytics or private data.
- Failure handling: if the 3D import or WebGL environment fails, a simple preserved House image and a way back to the old House appear. The original House is never removed as the fallback.
- This is **an architectural and interaction prototype**. Do not present the current glass, sofa geometry, furniture or texture detail as final photoreal art. The real five-note source image must be author-verified before the centerpiece is complete.

## No-cost toolchain

1. **Code-built 3D geometry:** Three.js, with authoring from OpenAI-generated and human-reviewed JavaScript. Work in parametric geometry first to test space/interaction. Turn any promising design into a reusable reusable module, not a one-off collage.
2. **Free 3D authoring:** Blender (GPL), using optional Blender Python scripts to generate and refine real `glTF/.glb` meshes with UVs and bakes. Avoid paid cloud rendering/generation. Assets are authored locally and then committed to the repository. See https://www.blender.org/
3. **Free photographic/PBR materials:** Poly Haven (CC0) for wood, stained metal, HDR lighting, forest stone; ambientCG (CC0) as additional texture source. Download the final chosen assets, optimize, self-host, and log their provenance. Do not call external live asset APIs on every page view. See https://polyhaven.com/license and https://ambientcg.com.
4. **Free CC0 geometry for initial blocking:** Kenney (e.g., Furniture Kit, CC0) only as an initial scale and prototype resource. Custom/realistic authored assets replace low-poly placeholder shapes when they look generic. See https://kenney.nl/assets/furniture-kit.
5. **OpenAI research code when helpful:** OpenAI's open-source Shap-E can generate experimental text/image-conditioned 3D assets if free local hardware is available, but **do not rely on its output or assume photorealism**. Repo: https://github.com/openai/shap-e. No paid OpenAI API or GPU hosting without the owner's later authorization.
6. **No paid integrations** during this phase: no Runway credits, subscription model services, paid asset downloads, paid compute or purchases. Explicitly confirm any chargeable service first.

## Product engineering

- Baseline: Chrome and Safari/WebGL2, responsive desktops and iPhones, WebGL error fallback.
- Budget: up to 1–2K texture maps per prominent object only where needed; compress to WebP/KTX2 when practical. Favor instancing for leaves, rain, trim repeats and furniture details. Use scene-relative culling and suspend rendering when the tab is hidden.
- Set mobile device pixel ratio cap, avoid unbounded post-processing/transmission and persistent unnecessary lights. Aim for **30 FPS or better on mid-range actual iPhones and 60 FPS desktop**, but do not claim those numbers without hardware profiling.
- Honor reduced motion. Keyboard/assistive object alternatives are mandatory. Audio always opt-in and muteable.
- Keep all personal/owner-only routes separate. Do not load protected resources into public scene code.
- Every scene must pass object-to-hitbox alignment, real lighting, no double-doors, camera and physics-scale correctness, network and console errors, phone and desktop screenshots, and transitions in both directions.
- Retain previous scene until a **new** replacement passes visual review, not merely code smoke tests.

## Migration strategy (still to build)

1. **Phase A:** Polish the connected atrium and living room in real 3D. Replace simple geometry with accurate sculptural upholstery, physically plausible light distribution, real PBR wood and metal, and faithful five-note skylight.
2. **Phase B:** Front Hall, actual stair transitions and library as **continuous or smoothly streamed real spaces**, not disconnected pages.
3. **Phase C:** Workshop, art studio, greenhouse/woods and physically present owner artwork, with gentle weather and meaningful tactile discoveries.
4. **Phase D:** Music Room with real yellow Tom DeLonge Strat (owned since sixteen), real pink guitar, green shag and vintage equipment; Maverick's attic and arcade/game rooms with actual playable transitions.
5. **Phase E:** Rebuild the remaining rooms and re-run the complete 27-room / 28-page audit, including deep playthroughs and iPhone Safari hardware tests. Cut over the default 'Enter' path to real 3D **only after owner-level visual quality is met**.

## Honest quality gate
A real WebGL canvas and 408 meshes are a *technical starting point*, not proof that the house looks photoreal or emotionally alive. Aesthetic sign-off remains open in `HOUSE_SIGNOFF.md`. Do not invite the owner into a half-implemented whole-house tour as though all 27 rooms were rebuilt.
