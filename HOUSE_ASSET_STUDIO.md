# Modular house review

Start at `house-layout.html` for the full House Guide layout, or `house-studio.html` to work on scenery. The previous photographic walk is available from the layout header. Its images, room IDs and interactions remain in place.

- `assets/house-layout.mjs` holds stable room and portal IDs, provisional dimensions and paired connections. The proposed attic hatch is at Upstairs Landing. Bedroom Two is present as a review assumption. Room envelopes and floor heights are schematic. The attached guide specifies adjacency and names. A dimensioned plan was unavailable.
- `assets/house-scene.mjs` displays the room envelope and percentage-based portal boundaries. `assets/house-layout-walk.mjs` owns camera selection, navigation, gestures, fixture states and audio. The layout uses discrete viewpoints. It has no free-walking collision solver.
- `assets/house-assets.mjs` defines permanent room/view/slot keys, desktop and mobile variants, approved baseline images, and browser-local IndexedDB versions. The renderer uses the same registry as the studio. Scenery, foreground, background, environment, lighting and object-texture layers are composited. Depth and occlusion are registered and previewable in the studio. Geometry-aware depth and occlusion rendering is pending.
- Approval makes the selected revision active in this browser on this deployment origin. Drafts and rejection history stay in IndexedDB. Restore can reinstate a prior approved version or the original. Uploads are local to this browser. They are not sent to a server and do not sync between devices or deployment URLs.
- Vercel Authentication protects the entire isolated review deployment, including direct requests to the studio and its modules. The studio is a static owner tool with local storage. There is no public write API.

## Use the replacement flow

1. Open the studio on the protected preview, select Upstairs Landing, Primary, and Primary again for the slot.
2. Import a WebP, JPEG, PNG or AVIF file. Compare the placeholder or currently approved artwork with the candidate, choose a variant, and adjust its alignment and portal boundary.
3. Approve and open **Inspect in walk**. The same room and portal IDs work with the approved image.
4. Use version history to restore the original placeholder or another approved version.

The inventory lists missing scenery per viewpoint. Optional layer slots remain selectable even when no file has been approved.
