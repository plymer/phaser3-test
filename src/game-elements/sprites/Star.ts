export class Star extends Phaser.Physics.Arcade.Sprite {
  scene: Phaser.Scene = null!;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "star"); // need to use a super call since we are extending Phaser.Physics.Arcade.Sprite
    this.scene = scene;

    // add both the visual sprite and the physics body to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  // make sure we are pre-loading the sprite's texture/image
  preload() {
    this.scene.load.image("star", "star.png");
  }

  update() {
    this.setRotation(this.rotation + 0.1); // rotate the star sprite
  }
}
