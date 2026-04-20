class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { W, H } = G;

    // Sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x060110, 0x060110, 0x0e0830, 0x0e0830, 1);
    bg.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H * 0.75);
      const a = Math.random() * 0.6 + 0.2;
      const s = Math.random() < 0.2 ? 2 : 1;
      this.add.rectangle(x, y, s, s, 0xffffff, a);
    }

    // Mountain silhouette
    const mtn = this.add.graphics();
    mtn.fillStyle(0x100a05);
    mtn.fillTriangle(W / 2, H * 0.12, W * 0.02, H * 0.65, W * 0.98, H * 0.65);
    mtn.fillRect(0, H * 0.65, W, H * 0.35);

    // Snow cap
    mtn.fillStyle(0xddeeff);
    mtn.fillTriangle(W / 2, H * 0.12, W * 0.35, H * 0.32, W * 0.65, H * 0.32);

    // Title
    this.add.text(W / 2, H * 0.1, 'DOUBLE', {
      fontSize: '56px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#3366ff', strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.21, 'MOUNTAIN', {
      fontSize: '56px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#ff4411', strokeThickness: 8,
    }).setOrigin(0.5);

    // Player colour labels
    this._badge(W * 0.22, H * 0.52, 'P1', '#44ff88', '#1a6633');
    this._badge(W * 0.78, H * 0.52, 'P2', '#ff5544', '#992211');

    // Controls diagram
    this._controlHint(W * 0.22, H * 0.63, '#44ff88');
    this._controlHint(W * 0.78, H * 0.63, '#ff5544');

    this.add.text(W / 2, H * 0.68, 'tap zones to jump & climb', {
      fontSize: '15px', fontFamily: 'monospace', color: '#888888',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.73, 'tether connects climbers', {
      fontSize: '15px', fontFamily: 'monospace', color: '#666666',
    }).setOrigin(0.5);

    // Tap to start
    const startBtn = this.add.text(W / 2, H * 0.87, '  TAP TO START  ', {
      fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#333344',
      padding: { x: 14, y: 10 },
    }).setOrigin(0.5);

    this.tweens.add({ targets: startBtn, alpha: 0.25, duration: 650, yoyo: true, repeat: -1 });

    // Keyboard hint
    this.add.text(W / 2, H * 0.94, 'WASD  |  ← ↑ →', {
      fontSize: '13px', fontFamily: 'monospace', color: '#444444',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown', () => this.scene.start('Game'));
  }

  _badge(x, y, label, color, bg) {
    this.add.rectangle(x, y, 80, 36, Phaser.Display.Color.HexStringToColor(bg).color, 0.9).setOrigin(0.5);
    this.add.text(x, y, label, {
      fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold', color,
    }).setOrigin(0.5);
  }

  _controlHint(cx, cy, color) {
    const W2 = 88, H2 = 36;
    this.add.rectangle(cx, cy, W2, H2, 0x222233, 0.7).setOrigin(0.5);
    this.add.text(cx - W2 * 0.25, cy, '◄', { fontSize: '18px', fontFamily: 'monospace', color, alpha: 0.9 }).setOrigin(0.5);
    this.add.text(cx + W2 * 0.25, cy, '►', { fontSize: '18px', fontFamily: 'monospace', color, alpha: 0.9 }).setOrigin(0.5);
  }
}
