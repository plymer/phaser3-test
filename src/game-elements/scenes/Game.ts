import { Scene } from "phaser";
import { EventBus } from "../../engine/EventBus";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");

    this.load.image("star", "star.png");
    this.load.image("logo", "logo.png");
  }

  create() {
    // this.add.image(window.innerWidth / 2, window.innerHeight / 2, "logo").setDepth(100);
    // this.add
    //   .text(
    //     window.innerWidth / 2,
    //     window.innerHeight / 2 + 128,
    //     "Make something fun!\nand share it with us:\nsupport@phaser.io",
    //     {
    //       fontFamily: "Arial Black",
    //       fontSize: 38,
    //       color: "#ffffff",
    //       stroke: "#000000",
    //       strokeThickness: 8,
    //       align: "center",
    //     }
    //   )
    //   .setOrigin(0.5)
    //   .setDepth(100);

    EventBus.emit("current-scene-ready", this);
  }
}
