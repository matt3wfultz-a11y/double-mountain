# Art Assets

Place your sprite sheets here. The game loads them automatically; if a file is
missing it falls back to procedurally-generated placeholder graphics so the
game always runs.

## Expected files

| File | Format | Notes |
|------|--------|-------|
| `tiles.png` | Spritesheet, 32×32 frames | Frame 0 used as rock platform tile |
| `player.png` | Spritesheet, 32×32 frames | Frame 0 used for both climbers |

## Using your own assets

The game checks for `tiles.png` and `player.png` on startup (BootScene.js).
If you have separate sprites for the two players, rename them `p1.png` /
`p2.png` and update the `preload()` call in `BootScene.js`.

To use a specific frame from your sheet, find the `_makeFallbacks()` method
and change the `generateTexture` key to match the spritesheet key plus frame,
e.g. `this.textures.get('tiles').get(3)`.
