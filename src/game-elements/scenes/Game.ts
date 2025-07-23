import { Scene } from "phaser";
import { EventBus } from "../../engine/EventBus";
import { Star } from "../sprites/Star";
import { Player } from "../sprites/Player";

export class Game extends Scene {
  private platform!: Phaser.GameObjects.Rectangle;
  private stars!: Phaser.Physics.Arcade.Group;
  private player!: Player;
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private debugText!: Phaser.GameObjects.Text;

  // Camera state tracking
  private currentCameraOffset = { x: 0, y: 200 };
  private activeCameraTween: Phaser.Tweens.Tween | null = null;

  // State-based camera system
  private currentCameraState = "neutral";
  private lastCameraState = "neutral";
  private previousVelocity = { x: 0, y: 0 };

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("star", "star.png");
  }

  create() {
    this.camera = this.cameras.main;

    // Create platform first
    this.platform = this.add.rectangle(400, 568, 800, 64, 0x00ff00).setOrigin(0.5, 1);
    this.physics.add.existing(this.platform, true);

    // Initialize stars group before creating player
    this.stars = this.physics.add.group();

    // Create player with triple jump enabled
    this.player = new Player(this, 400, 300, "star", { tripleJump: true });

    // Set up the camera
    this.camera.startFollow(this.player);
    this.camera.setLerp(0.05);
    this.camera.setFollowOffset(this.currentCameraOffset.x, this.currentCameraOffset.y);

    // Set up collision detection AFTER all objects are created
    this.physics.add.collider(this.stars, this.platform);
    this.physics.add.collider(this.stars, this.player);
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.stars, this.stars);

    // Add debug text to the game
    this.debugText = this.add
      .text(10, 10, "Debug Info", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setScrollFactor(0);

    EventBus.emit("current-scene-ready", this);
  }

  update(time: number, delta: number) {
    const velocity = this.getPlayer().getVelocity();
    this.updateCameraOffset(velocity);
  }

  private updateCameraOffset(velocity: { x: number; y: number }) {
    // Calculate acceleration (change in velocity)
    const acceleration = {
      x: velocity.x - this.previousVelocity.x,
      y: velocity.y - this.previousVelocity.y,
    };

    // Update previous velocity for next frame
    this.previousVelocity = { x: velocity.x, y: velocity.y };

    // Determine camera state based on both acceleration and velocity
    const ACCELERATION_THRESHOLD = 2; // For vertical movement
    const VELOCITY_THRESHOLD = 50; // For horizontal movement at speed

    // Calculate horizontal and vertical states separately
    let horizontalState = "neutral-x";
    let verticalState = "neutral-y";

    // Horizontal state (velocity + acceleration based)
    if (Math.abs(velocity.x) > VELOCITY_THRESHOLD || Math.abs(acceleration.x) > ACCELERATION_THRESHOLD) {
      if (velocity.x > 0 || acceleration.x > 0) horizontalState = "moving-right";
      else horizontalState = "moving-left";
    }

    // Vertical state (acceleration based only)
    if (Math.abs(acceleration.y) > ACCELERATION_THRESHOLD) {
      if (acceleration.y > 0) verticalState = "accelerating-down";
      else verticalState = "accelerating-up";
    }

    // Combine states for comparison
    const newCameraState = `${horizontalState}+${verticalState}`;

    // Only change camera if state actually changed
    if (newCameraState !== this.currentCameraState) {
      console.log("Camera state changed:", this.currentCameraState, "->", newCameraState);

      this.lastCameraState = this.currentCameraState;
      this.currentCameraState = newCameraState;

      // Calculate target offset by blending horizontal and vertical components
      let targetOffset = { x: 0, y: 200 }; // Start with base neutral position

      // Apply horizontal offset
      switch (horizontalState) {
        case "moving-right":
          targetOffset.x = -100; // Look ahead when moving right
          break;
        case "moving-left":
          targetOffset.x = 100; // Look ahead when moving left
          break;
        case "neutral-x":
        default:
          targetOffset.x = 0; // Centered horizontally
          break;
      }

      // Apply vertical offset (modify the base Y position)
      switch (verticalState) {
        case "accelerating-up":
          targetOffset.y = 400; // Look up when jumping
          break;
        case "accelerating-down":
          targetOffset.y = -200; // Look down when falling
          break;
        case "neutral-y":
        default:
          targetOffset.y = 200; // Default neutral Y position
          break;
      }

      // Stop any existing tween
      if (this.activeCameraTween) {
        console.log("Stopping previous tween for state change");
        this.activeCameraTween.destroy();
        this.activeCameraTween = null;
      }

      // Create new tween for state change
      this.activeCameraTween = this.tweens.add({
        targets: this.currentCameraOffset,
        x: targetOffset.x,
        y: targetOffset.y,
        duration: 300, // Slightly longer for smoother transitions
        ease: "Power2",
        onUpdate: () => {
          this.camera.setFollowOffset(this.currentCameraOffset.x, this.currentCameraOffset.y);
        },
        onComplete: () => {
          console.log("Camera tween completed for state:", newCameraState);
          this.activeCameraTween = null;
          this.currentCameraOffset.x = targetOffset.x;
          this.currentCameraOffset.y = targetOffset.y;
        },
      });
    }

    // Update debug text
    if (this.debugText) {
      this.debugText.setText([
        `H-State: ${horizontalState}`,
        `V-State: ${verticalState}`,
        `Combined: ${newCameraState}`,
        `Current: x:${this.currentCameraOffset.x.toFixed(1)}, y:${this.currentCameraOffset.y.toFixed(1)}`,
        `Velocity: x:${velocity.x.toFixed(1)}, y:${velocity.y.toFixed(1)}`,
        `Acceleration: x:${acceleration.x.toFixed(1)}, y:${acceleration.y.toFixed(1)}`,
        `Tween active: ${this.activeCameraTween ? "YES" : "NO"}`,
      ]);
    }
  }

  addStar(star: Star) {
    this.stars.add(star);
  }

  getPlayer(): Player {
    return this.player;
  }
}
