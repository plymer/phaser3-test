import { Scene } from "phaser";
import { EventBus } from "../../engine/EventBus";
import { Star } from "../sprites/Star";

export class Game extends Scene {
  private plaform!: Phaser.GameObjects.Rectangle;
  private stars!: Phaser.Physics.Arcade.Group;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("star", "star.png");
  }

  create() {
    const platform = this.add.rectangle(400, 568, 800, 64, 0x00ff00).setOrigin(0.5, 1);
    this.physics.add.existing(platform, true);

    this.stars = this.physics.add.group();

    // make the  stars interact with the platform
    this.physics.add.collider(this.stars, platform);

    // make the stars collide with each other
    this.physics.add.collider(this.stars, this.stars);

    EventBus.emit("current-scene-ready", this);
  }

  addStar(star: Star) {
    this.stars.add(star);
  }
}
