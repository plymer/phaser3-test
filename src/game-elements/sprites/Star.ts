import { Game } from "../scenes/Game";

export class Star extends Phaser.Physics.Arcade.Sprite {
  scene: Phaser.Scene = null!;
  id: string | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "star"); // need to use a super call since we are extending Phaser.Physics.Arcade.Sprite
    this.scene = scene;
    this.id = Phaser.Math.RND.uuid(); // generate a unique ID for the star

    console.log("creating a star", this.id);

    // add both the visual sprite and the physics body to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set bounce properties for more realistic bouncing
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setBounce(1, 1); // Bounce on both X and Y axis
      body.setFriction(0.5);
      body.setCircle(this.width / 2);

      // Add some air resistance to prevent floating
      body.setDragX(20); // Horizontal air resistance
      body.setGravityY(1800); // Additional gravity for faster falling
      // body.setCollideWorldBounds(true); // Bounce off world boundaries
    }

    this.setRotation(0);

    if (scene instanceof Game) {
      scene.addStar(this);
    }

    // listen to the scene's update event
    scene.events.on("update", this.handleUpdate, this);
  }

  private handleUpdate() {
    // Add visual rotation based on velocity for rolling effect
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      // Rotate based on horizontal velocity
      this.rotation += body.velocity.x * 0.0001;
    }

    const windowHeight = parseFloat(this.scene.game.config.height.toString());

    if (this.y > windowHeight) {
      console.log("destroying a star", this.id);
      this.destroy();
    }
  }

  destroy() {
    // clean up the event listener when destroying
    this.scene.events.off("update", this.handleUpdate, this);
    super.destroy();
  }

  // make sure we are pre-loading the sprite's texture/image
  preload() {
    // this isn't working right now, so we are using the Game scene's preload method
    // this.scene.load.setPath("assets");
    // this.scene.load.image("star", "star.png");
  }
}
