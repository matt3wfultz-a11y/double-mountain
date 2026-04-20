class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.loser = data.loser || 1;
  }

  create() {
    const { W, H } = G;
    const isP1 = this.loser === 1;
    const loserColor = isP1 ? '#44ff88' : '#ff5544';

    // Dim overlay
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78);

    // Title
    this.add.text(W / 2, H * 0.28, 'FELL OFF!', {
      fontSize: '52px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#ff3300', stroke: '#000000', strokeThickness: 7,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.42, `PLAYER ${this.loser}`, {
      fontSize: '30px', fontFamily: 'monospace', fontStyle: 'bold',
      color: loserColor,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.51, 'lost their grip', {
      fontSize: '18px', fontFamily: 'monospace', color: '#666666',
    }).setOrigin(0.5);

    // Restart button
    const btn = this.add.text(W / 2, H * 0.66, '  RESTART  ', {
      fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#333355',
      padding: { x: 20, y: 13 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#4455aa' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#333355' }));
    btn.on('pointerdown', () => this.scene.start('Game'));

    this.tweens.add({
      targets: btn, scaleX: 1.05, scaleY: 1.05,
      duration: 550, yoyo: true, repeat: -1,
    });

    // Menu link
    const menu = this.add.text(W / 2, H * 0.78, 'main menu', {
      fontSize: '16px', fontFamily: 'monospace', color: '#444466',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerdown', () => this.scene.start('Menu'));

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'));
  }
}
