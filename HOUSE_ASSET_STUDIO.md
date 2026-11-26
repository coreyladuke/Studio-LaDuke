# Modular house review

Start at `house-layout.html` for the full House Guide layout, or `house-studio.html` to work on scenery. The previous photographic walk is available from the layout header. Its images, room IDs and interactions remain in place.

- `assets/house-layout.mjs` holds stable room and portal IDs, provisional dimensions and paired connections. The proposed attic hatch is at Upstairs Landing. Bedroom Two is present as a review assumption. Room envelopes and floor heights are schematic. The attached guide specifies adjacency and names. A dimensioned plan was unavailable.
- `assets/house-scene.mjs` displays the room envelope and percentage-based portal boundaries. `assets/house-layout-walk.mjs` owns camera selection, navigation, gestures, fixture states and audio. The layout uses discrete viewpoints. It has no free-walking collision solver.
- `assets/house-assets.mjs` defines permanent room/view/slot keys, desktop and mobile variants, approved baseline images, and browser-local IndexedDB versions. The renderer uses the same registry as the studio. Scenery, foreground, background, environment, lighting and object-texture layers are composited. Depth and occlusion are registered and previewable in the studio. Geometry-aware depth and occlusion rendering is pending.
- In browser-local mode, approval activates the revision on that browser and origin. Drafts, history and room settings stay in IndexedDB. With shared storage configured and unlocked, authenticated sessions read and write the private repository. Restore can reinstate a prior approved version or the original in either mode.
- The isolated Vercel review project uses Vercel Authentication. The World Builder API additionally checks the owner session and write origin. The current local preview uses browser-local mode. Shared live storage remains unprovisioned.

## Use the replacement flow

1. Open the studio on the protected preview, select Upstairs Landing, Primary, and Primary again for the slot.
2. Import a WebP, JPEG, PNG or AVIF file. Compare the placeholder or currently approved artwork with the candidate, choose a variant, and adjust its alignment and portal boundary.
3. Approve and open **Inspect in walk**. The same room and portal IDs work with the approved image.
4. Use version history to restore the original placeholder or another approved version.

The inventory lists missing scenery per viewpoint. Optional layer slots remain selectable even when no file has been approved.

The Front Hall settings also store provisional stair width, run, rise and landing depth. Dimensional drawing and collision use these values together. The photographic walk keeps its established camera calibration. The three editable Front Hall objects accept position, radius, rotation around the vertical axis, and uniform scale. These settings are included in the room package.
