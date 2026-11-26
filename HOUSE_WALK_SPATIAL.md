# House walk geometry and photography

The Studio LaDuke House Guide defines the connection names and room order. The current frontend binds those names and legacy route IDs to `assets/house-spatial.js`. `house.html` retains the artwork-relative interaction polygons for the photographed views. The stair renderer uses the same world geometry for both directions. The guide's connection list takes precedence over older room-directory links. This specification covers the current review route. Adjoining rooms need their own measured geometry when they enter scope.

## References and review status

| Reference | Use |
| --- | --- |
| Studio LaDuke House Guide v0.1, pp. 2–4 and 7 | Front Hall, Main Hall Opening, Main Hall, Main Stairs, Upstairs Landing and adjoining door names |
| ENT-01 and existing door-wall plate | Approved Front Hall art preserved, including the three-opening composition |
| HALL–C, `assets/house-plates/main-hall-cedar.webp` | Approved Main Hall art. Left opening to Front Hall, central stair ascent, right opening to Art Studio |
| UP-LAN forward and reverse | Open artwork picks. Existing room views and the moving stair model are provisional |
| Dimensioned floor-plan drawing and stair section | Required to verify dimensions. Unavailable in the attached guide or current repository |

## Shared geometry

Origin is at the center of the first stair riser. Positive x points east, positive z points toward the upper landing, and y is elevation above the Main Hall floor. All dimensions below are provisional. The compass labels establish an internal coordinate convention.

| Element | Review assumption |
| --- | --- |
| Front Hall and Main Hall | Floor y = 0 m, ceiling y = 2.55 m |
| Main Hall Opening | Center x = −1.40 m, z = −0.80 m. Clear opening 1.02 × 2.12 m. Shared by both halls |
| Main Stairs | Straight flight toward +z. Width 1.10 m, run 3.50 m, rise 2.72 m. 14 treads of 250 mm and 15 risers of about 181 mm |
| Stairwell | 1.55 m wall to wall, 0.91 m modeled rail height above the tread line |
| Upstairs Landing | Floor y = 2.72 m, ceiling y = 5.15 m, 1.60 m modeled depth beyond top riser |
| Camera | Eye height 1.58 m above walking line, 65° vertical field of view. Same path reversed on descent. Camera poses and plate crops still need calibration against the approved photographs |

Dimensions are for visual development. Verify the opening centers, full wall lengths, landing depth, stair pitch, treads, ceiling and window against the plan before treating the model as an architectural match.

## Approved asset brief

Capture or render the following from one calibrated model or camera survey, with the same rail profile, newel, tread count, windows, materials and gray daylight. Deliver at minimum 2560 × 1440 masters with uncropped frames, camera position, yaw, pitch, focal length and animation masks as separate deliverables. Leave the existing approved images intact.

1. **Main Hall reverse toward Front Hall.** Eye near the first riser looking back through the Main Hall Opening. Match the door jamb and sightline to the approved Front Hall furnishings and checker-floor threshold.
2. **Upstairs Landing arrival.** Camera just beyond the upper newel looking toward the landing window. Include the nearest wall return, landing floor, actual window and approved door positions. Supply optional glazing mask and separate tree/rain layer.
3. **Upstairs Landing reverse.** Camera at the same upper landing pose looking down the actual flight. Include the foreground newel, rails, treads and recognizable HALL–C sightline at the lower end.
4. **Stair traversal reference.** Supply one matching mid-flight view in each direction plus the full stair section. A textured Blender scene or a set of calibrated plates with occlusion masks and depth can then replace the current projected model without changing connections or input.

## Rendering decision

The photographic walk retains its approved anchor views and short Canvas stair passage. The dimensional preview now builds a continuous WebGL flight from the same nominal stair width, rise, run, tread count and eye height. The landing, corridor collision and camera height use the same room configuration, including optional provisional dimensions stored by World Builder. The camera moves along a smooth walking line above the discrete treads in either direction. The front door and both halls stay in the same scene.

The missing deliverables are the measured opening and stair section, calibrated reverse Main Hall and landing views, and aligned masks or geometry for the photographed newels, rails, glazing and foreground trim. For the material pass, provide linear normal and roughness maps registered to the approved cedar, stair treads and painted trim, plus a daylight reference at the landing and a lower-hall exposure. Keep the same camera metadata and dimensions as the approved plates. The current dimensional scene uses the existing walnut texture, basic local lighting, and a provisional glazed landing opening.
