import { Scene } from "phaser";
import { EventBus } from "../../engine/EventBus";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
  }

  create() {
    EventBus.emit("current-scene-ready", this);
  }
}
