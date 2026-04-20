/* ─────────────────────────────────────────────
   GameScene – core gameplay
   ───────────────────────────────────────────── */
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  // ─── lifecycle ──────────────────────────────

  create() {
    const { W, WORLD_H } = G;

    this.gameOver   = false;
    this.startTime  = this.time.now;
    this.difficulty = 0; // 0-4 index into G.DIFF

    // Physics world spans the full height
    this.physics.world.setBounds(0, 0, W, WORLD_H);
    this.physics.world.gravity.y = G.GRAVITY;

    // Layer order: bg → wall → platforms → players → tether → ui
    this._buildBackground();
    this._buildWall();

    this.platforms = this.physics.add.staticGroup();
    this.obstacles = this.physics.add.staticGroup();

    // Ground at world bottom
    const ground = this.platforms.create(W / 2, WORLD_H + 16, 'rock');
    ground.setDisplaySize(W, 32).refreshBody();

    // First batch of platforms
    this._nextPlatformY = WORLD_H - 180;
    this._generatePlatforms(this._nextPlatformY, 1500);

    // Players
    const startY = WORLD_H - 140;
    this.p1 = this._makePlayer(1, G.WALL_X - 72, startY);
    this.p2 = this._makePlayer(2, G.WALL_X + 72, startY);

    // Colliders
    this.physics.add.collider(this.p1.sprite, this.platforms, (s) => this._land(this.p1));
    this.physics.add.collider(this.p2.sprite, this.platforms, (s) => this._land(this.p2));
    this.physics.add.collider(this.p1.sprite, this.obstacles, () => this._hitObstacle(this.p1));
    this.physics.add.collider(this.p2.sprite, this.obstacles, () => this._hitObstacle(this.p2));

    // Summit sensors
    this._buildSummit();

    // Tether graphics (drawn above world objects)
    this.tetherGfx = this.add.graphics().setDepth(20);

    // Camera
    this.cameras.main.setBounds(0, 0, W, WORLD_H);
    this._camY = startY;
    this.cameras.main.scrollY = startY - G.H * 0.6;

    // Input
    this._setupInput();

    // HUD (scrollFactor 0 = fixed to screen)
    this._buildHUD();

    // Particles emitter for dust
    this.dustEmitter = this.add.particles(0, 0, 'dust', {
      speed: { min: 20, max: 60 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.8, end: 0 },
      lifespan: 280,
      quantity: 0,
    }).setDepth(25);
  }

  update(time, delta) {
    if (this.gameOver) return;

    const dt = delta / 1000;

    this._handleKeyboard();
    this._updatePlayer(this.p1, dt);
    this._updatePlayer(this.p2, dt);
    this._applyTether();
    this._updateCamera();
    this._maybeGenerate();
    this._updateHUD();
    this._drawTether();
    this._updateDifficulty();
  }

  // ─── world building ─────────────────────────

  _buildBackground() {
    const { W, WORLD_H } = G;
    const bg = this.add.graphics().setDepth(-10).setScrollFactor(0.15);
    // Sky darkens from deep blue at bottom to near-black at summit
    for (let y = 0; y < WORLD_H; y += G.H) {
      const t = y / WORLD_H; // 0=top, 1=bottom
      const r = Math.round(Phaser.Math.Linear(4,  12, t));
      const g = Math.round(Phaser.Math.Linear(2,  18, t));
      const b = Math.round(Phaser.Math.Linear(8,  48, t));
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b)).fillRect(0, y, W, G.H + 1);
    }

    // Stars scattered through background
    const stars = this.add.graphics().setDepth(-9).setScrollFactor(0.25);
    for (let i = 0; i < 300; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, WORLD_H * 0.9);
      const a = Math.random() * 0.7 + 0.15;
      const s = Math.random() < 0.15 ? 2 : 1;
      stars.fillStyle(0xffffff, a).fillRect(x, y, s, s);
    }
  }

  _buildWall() {
    const { WALL_X, WALL_W, WORLD_H, TILE } = G;
    const wall = this.add.graphics().setDepth(2);

    for (let y = 0; y <= WORLD_H; y += TILE) {
      // Altitude determines wall colour (gets icy near top)
      const frac = 1 - y / WORLD_H;
      const r = Math.round(Phaser.Math.Linear(42, 130, frac));
      const gr = Math.round(Phaser.Math.Linear(30, 150, frac));
      const b  = Math.round(Phaser.Math.Linear(18, 180, frac));
      wall.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      wall.fillRect(WALL_X - WALL_W / 2, y, WALL_W, TILE + 1);

      // Left highlight strip
      wall.fillStyle(0xffffff, 0.06).fillRect(WALL_X - WALL_W / 2, y, 4, TILE);
      // Right shadow strip
      wall.fillStyle(0x000000, 0.18).fillRect(WALL_X + WALL_W / 2 - 4, y, 4, TILE);
    }

    // Physical static body for the wall
    this.wallBody = this.add.rectangle(WALL_X, WORLD_H / 2, WALL_W, WORLD_H).setVisible(false);
    this.physics.add.existing(this.wallBody, true);
  }

  _buildSummit() {
    const { W, WALL_X, WALL_W, SUMMIT_Y } = G;
    const s = this.add.graphics().setDepth(5);

    // Finish-line banner
    s.fillStyle(0xffdd00, 0.9).fillRect(0, SUMMIT_Y - 8, W / 2 - WALL_W / 2, 18);
    s.fillStyle(0xff4411, 0.9).fillRect(W / 2 + WALL_W / 2, SUMMIT_Y - 8, W / 2 - WALL_W / 2, 18);
    s.lineStyle(3, 0xffffff, 0.8).lineBetween(0, SUMMIT_Y - 8, W, SUMMIT_Y - 8);

    this.add.text(W * 0.25, SUMMIT_Y - 20, 'SUMMIT', {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', color: '#000000',
    }).setOrigin(0.5).setDepth(6);
    this.add.text(W * 0.75, SUMMIT_Y - 20, 'SUMMIT', {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', color: '#000000',
    }).setOrigin(0.5).setDepth(6);

    // Summit platforms
    const leftPlatW  = Math.floor((W / 2 - WALL_W / 2) / G.TILE);
    const rightPlatW = leftPlatW;
    this._addPlatformAt(0, SUMMIT_Y + 2, leftPlatW, 'snow');
    this._addPlatformAt(W / 2 + WALL_W / 2, SUMMIT_Y + 2, rightPlatW, 'snow');

    // Overlap zones for win detection
    const lz = this.add.zone(W * 0.25, SUMMIT_Y - 20, W / 2 - WALL_W / 2, 60).setDepth(10);
    const rz = this.add.zone(W * 0.75, SUMMIT_Y - 20, W / 2 - WALL_W / 2, 60).setDepth(10);
    this.physics.world.enable([lz, rz]);
    lz.body.setAllowGravity(false);
    rz.body.setAllowGravity(false);

    this.physics.add.overlap(this.p1.sprite, lz, () => this._win(1));
    this.physics.add.overlap(this.p2.sprite, rz, () => this._win(2));
  }

  // ─── platform generation ────────────────────

  _generatePlatforms(fromY, spanPx) {
    const toY = fromY - spanPx;
    let y = fromY;

    while (y > toY) {
      const diff = this.difficulty;
      const minGap = G.GAP_Y_MIN + diff * 8;
      const maxGap = G.GAP_Y_MAX + diff * 10;
      y -= Phaser.Math.Between(minGap, maxGap);

      const leftX  = this._placePlatform('left',  y);
      const rightX = this._placePlatform('right', y);

      // Obstacles scale with difficulty
      const obsChance = 0.15 + diff * 0.12;
      if (Math.random() < obsChance) this._addObstacleOn('left',  y, leftX);
      if (Math.random() < obsChance) this._addObstacleOn('right', y, rightX);
    }

    this._nextPlatformY = y;
  }

  _placePlatform(side, y) {
    const { WALL_X, WALL_W, W, TILE } = G;
    const wMin = G.PLATFORM_W_MIN;
    const wMax = Math.max(wMin, G.PLATFORM_W_MAX - this.difficulty);
    const tiles = Phaser.Math.Between(wMin, wMax);
    const pxW   = tiles * TILE;

    let x;
    const alt = 1 - y / G.WORLD_H; // 0 = bottom, 1 = top
    const isSnow = alt > 0.75;

    if (side === 'left') {
      const maxX = WALL_X - WALL_W / 2 - pxW;
      x = Phaser.Math.Between(8, Math.max(8, maxX));
    } else {
      const minX = WALL_X + WALL_W / 2;
      const maxX = W - pxW - 8;
      x = Phaser.Math.Between(minX, Math.max(minX, maxX));
    }

    this._addPlatformAt(x, y, tiles, isSnow ? 'snow' : 'rock');
    return x;
  }

  _addPlatformAt(x, y, tiles, tex) {
    for (let i = 0; i < tiles; i++) {
      const tile = this.platforms.create(x + i * G.TILE + G.TILE / 2, y, tex || 'rock');
      tile.setDisplaySize(G.TILE, G.TILE).refreshBody().setDepth(3);
    }
  }

  _addObstacleOn(side, platY, platX) {
    const { WALL_X, WALL_W, W, TILE } = G;
    let x;
    if (side === 'left') {
      const maxX = WALL_X - WALL_W / 2 - TILE;
      x = Phaser.Math.Between(Math.max(8, platX), Math.min(platX + 80, maxX));
    } else {
      const minX = WALL_X + WALL_W / 2;
      x = Phaser.Math.Between(Math.max(platX, minX), Math.min(platX + 80, W - TILE - 8));
    }
    const obs = this.obstacles.create(x + TILE / 2, platY - TILE + 4, 'obstacle');
    obs.setDisplaySize(TILE, 28).refreshBody().setDepth(4);
  }

  _maybeGenerate() {
    const camTop = this.cameras.main.scrollY;
    if (camTop < this._nextPlatformY + G.H * 1.8) {
      this._generatePlatforms(this._nextPlatformY, G.H * 2.5);
    }
  }

  // ─── player ─────────────────────────────────

  _makePlayer(num, x, y) {
    const key = 'p' + num;
    const sprite = this.physics.add.sprite(x, y, key)
      .setDepth(10)
      .setCollideWorldBounds(false)
      .setMaxVelocity(500, 1000)
      .setSize(20, 28).setOffset(4, 4)
      .setDisplaySize(28, 32);

    sprite.body.setAllowGravity(true);

    // Wall collision
    this.physics.add.collider(sprite, this.wallBody);

    const p = {
      sprite,
      num,
      minX: num === 1 ? 14 : G.WALL_X + G.WALL_W / 2 + 4,
      maxX: num === 1 ? G.WALL_X - G.WALL_W / 2 - 4 : G.W - 14,
      stunned: false,
      stunTimer: 0,
      grounded: false,
      // For landing detection
      wasGrounded: false,
    };

    return p;
  }

  _updatePlayer(p, dt) {
    const s = p.sprite;

    // Stun countdown
    if (p.stunned) {
      p.stunTimer -= dt;
      if (p.stunTimer <= 0) { p.stunned = false; s.setAlpha(1); }
      else { s.setAlpha(Math.sin(p.stunTimer * 20) * 0.4 + 0.6); }
    }

    // Clamp to own side
    if (s.x < p.minX) { s.x = p.minX; s.body.velocity.x = Math.max(0, s.body.velocity.x); }
    if (s.x > p.maxX) { s.x = p.maxX; s.body.velocity.x = Math.min(0, s.body.velocity.x); }

    // Ground state
    p.grounded = s.body.blocked.down;

    // Slight horizontal damping when on ground
    if (p.grounded) s.body.velocity.x *= 0.78;
  }

  // ─── input ──────────────────────────────────

  _setupInput() {
    const { WALL_X, W } = G;

    // Touch / mouse
    this.input.on('pointerdown', (ptr) => {
      const sx = ptr.x;
      if (sx < WALL_X) {
        // P1 side: left half → jump-left, right half → jump-right
        this._jump(this.p1, sx < WALL_X / 2 ? -1 : 1);
      } else {
        // P2 side
        const mid = WALL_X + (W - WALL_X) / 2;
        this._jump(this.p2, sx < mid ? -1 : 1);
      }
    });

    // Multi-touch support
    this.input.addPointer(3);

    // Keyboard
    this._keys = {
      a: this.input.keyboard.addKey('A'),
      d: this.input.keyboard.addKey('D'),
      w: this.input.keyboard.addKey('W'),
      left:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    };
  }

  _handleKeyboard() {
    const k = this._keys;

    if (Phaser.Input.Keyboard.JustDown(k.a)) this._jump(this.p1, -1);
    if (Phaser.Input.Keyboard.JustDown(k.d)) this._jump(this.p1,  1);
    if (Phaser.Input.Keyboard.JustDown(k.w)) this._jump(this.p1,  0);

    if (Phaser.Input.Keyboard.JustDown(k.left))  this._jump(this.p2, -1);
    if (Phaser.Input.Keyboard.JustDown(k.right)) this._jump(this.p2,  1);
    if (Phaser.Input.Keyboard.JustDown(k.up))    this._jump(this.p2,  0);
  }

  _jump(p, dir) {
    if (p.stunned) return;
    const s = p.sprite;
    const canJump = s.body.blocked.down || s.body.blocked.left || s.body.blocked.right;
    if (!canJump) return;

    s.setVelocityY(G.JUMP_VY);
    if (dir !== 0) s.setVelocityX(dir * G.MOVE_VX);

    // Dust particles
    this.dustEmitter.setPosition(s.x, s.y + 14);
    this.dustEmitter.explode(5);
  }

  _land(p) {
    // Called by collider callback – used for future sound/effects hook
  }

  _hitObstacle(p) {
    if (p.stunned) return;
    p.stunned    = true;
    p.stunTimer  = 1.2;
    p.sprite.setVelocityY(250); // knocked back down
    this.cameras.main.shake(180, 0.006);
  }

  // ─── tether ─────────────────────────────────

  _applyTether() {
    const s1 = this.p1.sprite;
    const s2 = this.p2.sprite;
    const dy  = s2.y - s1.y; // positive = p2 is lower (behind)

    // Tether model: rope goes over mountain peak.
    // Enforce max Y-difference between climbers.
    if (Math.abs(dy) > G.TETHER_Y_MAX) {
      const dir = dy > 0 ? 1 : -1; // +1 means p2 is lower
      const excess = (Math.abs(dy) - G.TETHER_Y_MAX) * 0.5;

      if (dir > 0) {
        // p2 is lower → nudge p2 upward
        s2.body.velocity.y -= G.TETHER_PULL;
        s2.y -= excess * 0.4;
      } else {
        // p1 is lower
        s1.body.velocity.y -= G.TETHER_PULL;
        s1.y -= excess * 0.4;
      }
    }
  }

  _drawTether() {
    const s1 = this.p1.sprite;
    const s2 = this.p2.sprite;
    const { WALL_X } = G;
    const dy   = Math.abs(s2.y - s1.y);
    const taut = dy > G.TETHER_Y_MAX * 0.75;

    this.tetherGfx.clear();
    this.tetherGfx.lineStyle(taut ? 3 : 2, taut ? 0xff4422 : 0xddaa44, taut ? 1 : 0.55);

    // Route rope: player1 → wall-top → player2 (around the mountain peak)
    // Wall-top anchor is the visible summit-line height at WALL_X
    const anchorY = Math.min(s1.y, s2.y) - 60;

    const pts = this._bezierPoints(s1.x, s1.y, WALL_X, anchorY, s2.x, s2.y, 14);
    this.tetherGfx.beginPath();
    this.tetherGfx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) this.tetherGfx.lineTo(pts[i].x, pts[i].y);
    this.tetherGfx.strokePath();
  }

  _bezierPoints(x1, y1, cx, cy, x2, y2, steps) {
    const pts = [];
    for (let t = 0; t <= 1; t += 1 / steps) {
      pts.push({
        x: (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2,
        y: (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2,
      });
    }
    return pts;
  }

  // ─── camera ─────────────────────────────────

  _updateCamera() {
    // Follow the average Y, biased toward the higher (smaller Y) climber
    const y1 = this.p1.sprite.y;
    const y2 = this.p2.sprite.y;
    const higher = Math.min(y1, y2);
    const avg    = (y1 + y2) / 2;
    const target = avg * 0.6 + higher * 0.4;

    this._camY = Phaser.Math.Linear(this._camY, target, 0.07);
    this.cameras.main.scrollY = this._camY - G.H * 0.62;
  }

  // ─── difficulty ──────────────────────────────

  _updateDifficulty() {
    const highest = Math.min(this.p1.sprite.y, this.p2.sprite.y);
    const metres  = Math.round((G.WORLD_H - highest) / 10);

    for (let i = G.DIFF.length - 1; i >= 0; i--) {
      if (metres >= G.DIFF[i]) { this.difficulty = i; break; }
    }
  }

  // ─── HUD ────────────────────────────────────

  _buildHUD() {
    const { W } = G;
    const sf = 0; // scrollFactor 0 = screen-fixed

    // Semi-transparent top bar
    this.hudBar = this.add.graphics().setScrollFactor(sf).setDepth(50);
    this.hudBar.fillStyle(0x000000, 0.45).fillRect(0, 0, W, 46);

    this.p1Label = this.add.text(12, 8, 'P1  0m', {
      fontSize: '16px', fontFamily: 'monospace', color: '#44ff88',
    }).setScrollFactor(sf).setDepth(51);

    this.p2Label = this.add.text(W - 12, 8, 'P2  0m', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ff5544',
    }).setScrollFactor(sf).setDepth(51).setOrigin(1, 0);

    // Tether indicator in HUD centre
    this.tetherLabel = this.add.text(W / 2, 8, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#ddaa44',
    }).setScrollFactor(sf).setDepth(51).setOrigin(0.5, 0);

    // Altitude progress bars (thin vertical strips on each edge)
    this.p1Bar = this.add.graphics().setScrollFactor(sf).setDepth(50);
    this.p2Bar = this.add.graphics().setScrollFactor(sf).setDepth(50);

    // Tap zone shading (very subtle)
    const tz = this.add.graphics().setScrollFactor(sf).setDepth(48);
    tz.fillStyle(0xffffff, 0.02).fillRect(0, 0, G.WALL_X / 2, G.H);
    tz.fillStyle(0xffffff, 0.02).fillRect(G.WALL_X + (G.W - G.WALL_X) / 2, 0, (G.W - G.WALL_X) / 2, G.H);

    // Zone arrows
    const arrowStyle = { fontSize: '16px', fontFamily: 'monospace', alpha: 0.22 };
    this.add.text(G.WALL_X * 0.25,   G.H - 28, '◄', { ...arrowStyle, color: '#44ff88' }).setScrollFactor(sf).setDepth(49).setOrigin(0.5);
    this.add.text(G.WALL_X * 0.75,   G.H - 28, '►', { ...arrowStyle, color: '#44ff88' }).setScrollFactor(sf).setDepth(49).setOrigin(0.5);
    const rx = G.WALL_X + (G.W - G.WALL_X) / 2;
    this.add.text(G.WALL_X + (rx - G.WALL_X) * 0.5, G.H - 28, '◄', { ...arrowStyle, color: '#ff5544' }).setScrollFactor(sf).setDepth(49).setOrigin(0.5);
    this.add.text(G.WALL_X + (rx - G.WALL_X) * 1.5, G.H - 28, '►', { ...arrowStyle, color: '#ff5544' }).setScrollFactor(sf).setDepth(49).setOrigin(0.5);
  }

  _updateHUD() {
    const totalClimbable = G.WORLD_H - G.SUMMIT_Y - 200;

    const h1 = Math.max(0, Math.round((G.WORLD_H - this.p1.sprite.y) / 10));
    const h2 = Math.max(0, Math.round((G.WORLD_H - this.p2.sprite.y) / 10));
    this.p1Label.setText(`P1  ${h1}m`);
    this.p2Label.setText(`P2  ${h2}m`);

    const dy = Math.abs(this.p1.sprite.y - this.p2.sprite.y);
    if (dy > G.TETHER_Y_MAX * 0.72) {
      this.tetherLabel.setText('~taut~').setAlpha(Math.sin(this.time.now / 150) * 0.5 + 0.5);
    } else {
      this.tetherLabel.setText('');
    }

    // Altitude bars
    const barH = G.H - 60;
    const barW = 5;

    this.p1Bar.clear();
    const p1frac = Phaser.Math.Clamp((G.WORLD_H - this.p1.sprite.y) / totalClimbable, 0, 1);
    this.p1Bar.fillStyle(0x000000, 0.4).fillRect(0, 50, barW, barH);
    this.p1Bar.fillStyle(0x44ff88, 0.8).fillRect(0, 50 + barH * (1 - p1frac), barW, barH * p1frac);

    this.p2Bar.clear();
    const p2frac = Phaser.Math.Clamp((G.WORLD_H - this.p2.sprite.y) / totalClimbable, 0, 1);
    this.p2Bar.fillStyle(0x000000, 0.4).fillRect(G.W - barW, 50, barW, barH);
    this.p2Bar.fillStyle(0xff5544, 0.8).fillRect(G.W - barW, 50 + barH * (1 - p2frac), barW, barH * p2frac);
  }

  // ─── win ────────────────────────────────────

  _win(playerNum) {
    if (this.gameOver) return;
    this.gameOver = true;

    const elapsed = this.time.now - this.startTime;
    const h1 = Math.round((G.WORLD_H - this.p1.sprite.y) / 10);
    const h2 = Math.round((G.WORLD_H - this.p2.sprite.y) / 10);

    // Brief flash
    this.cameras.main.flash(400, 255, 220, 80);

    this.time.delayedCall(600, () => {
      this.scene.start('Win', { winner: playerNum, heights: [h1, h2], time_ms: elapsed });
    });
  }
}
