class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Suppress missing-asset errors so placeholder textures are used when
    // real asset files haven't been dropped in yet.
    this.load.on('loaderror', () => {});

    this.load.spritesheet('tiles',  'assets/tiles.png',  { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    this._makeFallbacks();
    this.scene.start('Menu');
  }

  _makeFallbacks() {
    const add = (key, w, h, fn) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ add: false });
      fn(g);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    // Rock platform tile
    add('rock', 32, 32, g => {
      g.fillStyle(0x3a2d1e);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x4d3d28);
      g.fillRect(2, 2, 28, 10);
      g.lineStyle(1, 0x22180d);
      g.strokeRect(0, 0, 32, 32);
    });

    // Wall tile (center mountain)
    add('wall', 32, 32, g => {
      g.fillStyle(0x2a1f12);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x3a2d1e);
      g.fillRect(4, 0, 24, 32);
      g.lineStyle(1, 0x1a1008);
      g.strokeRect(0, 0, 32, 32);
    });

    // Wall edge highlight (left face)
    add('wall-l', 8, 32, g => {
      g.fillStyle(0x5a4530);
      g.fillRect(0, 0, 8, 32);
      g.fillStyle(0x6a5540);
      g.fillRect(0, 0, 4, 32);
    });

    // Wall edge highlight (right face)
    add('wall-r', 8, 32, g => {
      g.fillStyle(0x1e1408);
      g.fillRect(0, 0, 8, 32);
    });

    // Obstacle (spiked rock)
    add('obstacle', 32, 28, g => {
      g.fillStyle(0x7a5535);
      g.fillTriangle(16, 0, 0, 28, 32, 28);
      g.fillStyle(0x9a7050);
      g.fillTriangle(16, 4, 4, 28, 28, 28);
    });

    // Player 1 (green jacket)
    add('p1', 28, 32, g => {
      g.fillStyle(0xf5c888); g.fillRect(7, 0, 14, 14);   // head
      g.fillStyle(0x3a2210); g.fillRect(7, 0, 14, 6);    // hair
      g.fillStyle(0x2a8844); g.fillRect(4, 14, 20, 13);  // body
      g.fillStyle(0x3a5acc); g.fillRect(4, 27, 9, 5);    // leg L
      g.fillStyle(0x3a5acc); g.fillRect(15, 27, 9, 5);   // leg R
      g.fillStyle(0xf5c888); g.fillRect(0, 14, 4, 10);   // arm L
      g.fillStyle(0xf5c888); g.fillRect(24, 14, 4, 10);  // arm R
    });

    // Player 2 (red jacket)
    add('p2', 28, 32, g => {
      g.fillStyle(0xf5c888); g.fillRect(7, 0, 14, 14);
      g.fillStyle(0x220f06); g.fillRect(7, 0, 14, 6);
      g.fillStyle(0xaa3322); g.fillRect(4, 14, 20, 13);
      g.fillStyle(0x3a5acc); g.fillRect(4, 27, 9, 5);
      g.fillStyle(0x3a5acc); g.fillRect(15, 27, 9, 5);
      g.fillStyle(0xf5c888); g.fillRect(0, 14, 4, 10);
      g.fillStyle(0xf5c888); g.fillRect(24, 14, 4, 10);
    });

    // Flag at summit
    add('flag', 32, 48, g => {
      g.lineStyle(3, 0xdddddd);
      g.lineBetween(2, 0, 2, 48);
      g.fillStyle(0xffdd00);
      g.fillRect(2, 0, 28, 20);
      g.fillStyle(0xff4400);
      g.fillRect(2, 20, 28, 4);
    });

    // Small particle for jump dust
    add('dust', 8, 8, g => {
      g.fillStyle(0xaa8855, 0.7);
      g.fillCircle(4, 4, 4);
    });

    // Snow tile for high altitude
    add('snow', 32, 32, g => {
      g.fillStyle(0x8899bb);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0xaabbcc);
      g.fillRect(2, 2, 28, 10);
      g.lineStyle(1, 0x6688aa);
      g.strokeRect(0, 0, 32, 32);
    });
  }
}
