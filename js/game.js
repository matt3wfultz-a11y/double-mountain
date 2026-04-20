/* jshint esversion: 6 */
window.addEventListener('load', () => {
  new Phaser.Game({
    type: Phaser.AUTO,
    width:  G.W,
    height: G.H,
    backgroundColor: '#050208',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 }, // per-body gravity set in GameScene
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: document.body,
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene, WinScene],
  });
});
