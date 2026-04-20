class WinScene extends Phaser.Scene {
  constructor() { super('Win'); }

  init(data) {
    this.winner = data.winner || 1;
    this.heights = data.heights || [0, 0];
    this.time_ms = data.time_ms || 0;
  }

  create() {
    const { W, H } = G;
    const isP1 = this.winner === 1;
    const color = isP1 ? '#44ff88' : '#ff5544';
    const darkColor = isP1 ? 0x1a6633 : 0x992211;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050210, 0x050210, 0x0d0820, 0x0d0820, 1);
    bg.fillRect(0, 0, W, H);

    // Confetti burst
    this._confetti();

    // Winner banner
    this.add.rectangle(W / 2, H * 0.28, W * 0.88, 110, darkColor, 0.9).setOrigin(0.5);
    this.add.text(W / 2, H * 0.22, 'SUMMIT!', {
      fontSize: '46px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#ffffff', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(W / 2, H * 0.31, `PLAYER ${this.winner} WINS`, {
      fontSize: '28px', fontFamily: 'monospace', fontStyle: 'bold', color,
    }).setOrigin(0.5);

    // Stats
    const secs = (this.time_ms / 1000).toFixed(1);
    this.add.text(W / 2, H * 0.44, `time  ${secs}s`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5);
    this.add.text(W / 2, H * 0.50, `P1  ${this.heights[0]}m`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#44ff88',
    }).setOrigin(0.5);
    this.add.text(W / 2, H * 0.56, `P2  ${this.heights[1]}m`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#ff5544',
    }).setOrigin(0.5);

    // Rematch
    const btn = this.add.text(W / 2, H * 0.72, '  PLAY AGAIN  ', {
      fontSize: '24px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#333355',
      padding: { x: 16, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#4455aa' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#333355' }));
    btn.on('pointerdown', () => this.scene.start('Game'));
    this.tweens.add({ targets: btn, scaleX: 1.04, scaleY: 1.04, duration: 600, yoyo: true, repeat: -1 });

    // Menu link
    const menu = this.add.text(W / 2, H * 0.82, 'main menu', {
      fontSize: '16px', fontFamily: 'monospace', color: '#555577',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerdown', () => this.scene.start('Menu'));

    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
  }

  _confetti() {
    const colors = [0xffdd00, 0xff4411, 0x44ff88, 0x4488ff, 0xff88cc, 0xffffff];
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(20, G.W - 20);
      const r = this.add.rectangle(x, -20,
        Phaser.Math.Between(4, 10), Phaser.Math.Between(4, 10),
        Phaser.Utils.Array.GetRandom(colors), 1);
      this.tweens.add({
        targets: r,
        y: G.H + 40,
        x: r.x + Phaser.Math.Between(-60, 60),
        angle: Phaser.Math.Between(-360, 360),
        duration: Phaser.Math.Between(1400, 2800),
        delay: Phaser.Math.Between(0, 800),
        ease: 'Linear',
      });
    }
  }
}
