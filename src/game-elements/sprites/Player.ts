/**
 * Player Class that has a triple jump modeled after the Destiny 2 Hunter class.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  scene: Phaser.Scene = null!;
  id: string | null = null;

  // Input handling
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private previousJumpKeyState = false; // Track previous frame's jump key state

  // Movement constants
  private readonly ACCELERATION = 800;
  private readonly MAX_SPEED = 300;
  private readonly AIR_RESISTANCE = this.ACCELERATION / 10;

  // Jump tracking properties
  private isJumping = false;
  private jumpStartTime = 0;
  private jumpCount = 0;
  private readonly MAX_JUMPS: number;
  private readonly hasTripleJump: boolean;
  private secondJumpPowerLevel = 0; // Track how much the second jump was charged
  private isChargingSecondJump = false; // Track if we're actively charging the second jump

  // First jump properties
  private readonly FIRST_JUMP_VELOCITY = -150;

  // Second jump properties
  private readonly MIN_SECOND_JUMP_VELOCITY = -150;
  private readonly MAX_SECOND_JUMP_VELOCITY = -350;
  private readonly MAX_SECOND_JUMP_HOLD_TIME = 100; // milliseconds

  // Third jump properties
  private readonly BASE_THIRD_JUMP_VELOCITY = -200; // Base third jump velocity
  private readonly MAX_THIRD_JUMP_BONUS = -150; // Maximum bonus from second jump charging

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = "star",
    options: { tripleJump?: boolean } = {}
  ) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.id = Phaser.Math.RND.uuid();

    // Configure jump settings based on options
    this.hasTripleJump = options.tripleJump || false;
    this.MAX_JUMPS = this.hasTripleJump ? 3 : 2;

    console.log("creating player", this.id, "with triple jump:", this.hasTripleJump);

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set physics properties
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setBounce(0.3, 0.1);
      body.setCollideWorldBounds(false);
      body.setCircle(this.width / 2);
      body.setDrag(20);
    }

    // Initialize input
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
    }

    this.setRotation(0);

    // Listen to the scene's update event
    scene.events.on("update", this.handleUpdate, this);
  }

  private handleUpdate(time: number, delta: number) {
    if (this.body && this.cursors) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      const isGrounded = body.onFloor();
      const deltaSeconds = delta / 1000;

      // Force velocity to zero when grounded and not moving
      if (isGrounded && Math.abs(body.velocity.y) < 2) {
        body.setVelocityY(0);
      }

      // Reset jump count when grounded
      if (isGrounded) {
        this.jumpCount = 0;
        this.isJumping = false;
        this.secondJumpPowerLevel = 0;
        this.isChargingSecondJump = false;
      }

      this.handleMovement(body, isGrounded, deltaSeconds);
      this.handleMultiJump(body, isGrounded, time);
      this.handleVisualEffects(body);

      this.previousJumpKeyState = this.cursors.up.isDown;
    }
  }

  private handleMovement(body: Phaser.Physics.Arcade.Body, isGrounded: boolean, deltaSeconds: number) {
    let targetVelocityX = 0;

    // Handle horizontal movement
    if (this.cursors.left.isDown) {
      targetVelocityX = -this.MAX_SPEED;
    } else if (this.cursors.right.isDown) {
      targetVelocityX = this.MAX_SPEED;
    }

    // Apply horizontal acceleration/deceleration
    const velocityXDiff = targetVelocityX - body.velocity.x;
    const accelerationRate = isGrounded ? this.ACCELERATION : this.AIR_RESISTANCE;
    const accelerationX = Math.sign(velocityXDiff) * accelerationRate * deltaSeconds;

    if (Math.abs(accelerationX) > Math.abs(velocityXDiff)) {
      body.setVelocityX(targetVelocityX);
    } else {
      body.setVelocityX(body.velocity.x + accelerationX);
    }
  }

  private handleMultiJump(body: Phaser.Physics.Arcade.Body, isGrounded: boolean, time: number) {
    // Check if jump key was just pressed (not held from previous frame)
    const jumpKeyJustPressed = this.cursors.up.isDown && !this.previousJumpKeyState;
    const jumpKeyJustReleased = !this.cursors.up.isDown && this.previousJumpKeyState;
    const jumpsRemaining = this.MAX_JUMPS - this.jumpCount;

    // Constants for horizontal jump boosts
    const HORIZONTAL_JUMP_BOOST = 100; // Additional horizontal velocity when jumping

    console.log("jumps remaining:", jumpsRemaining, "second jump power:", this.secondJumpPowerLevel);

    // First jump - instant and small
    if (jumpKeyJustPressed && this.jumpCount === 0) {
      this.jumpCount++;
      this.isJumping = true;
      body.setVelocityY(this.FIRST_JUMP_VELOCITY);

      // the first jump has no horizontal boost
    }

    // Second jump - start charging when key is pressed
    else if (jumpKeyJustPressed && this.jumpCount === 1) {
      this.jumpCount++;
      this.isJumping = true;
      this.isChargingSecondJump = true;
      this.jumpStartTime = time;
      this.secondJumpPowerLevel = 0;

      body.setVelocityY(0);
      body.setVelocityY(this.MIN_SECOND_JUMP_VELOCITY);

      // Add horizontal boost for second jump
      if (this.cursors.left.isDown) {
        body.setVelocityX(-HORIZONTAL_JUMP_BOOST);
      } else if (this.cursors.right.isDown) {
        body.setVelocityX(HORIZONTAL_JUMP_BOOST);
      }
    }

    // Third jump - powered by second jump charge level
    else if (jumpKeyJustPressed && this.jumpCount === 2 && this.hasTripleJump) {
      this.jumpCount++;
      this.isJumping = true;

      const powerBonus = this.secondJumpPowerLevel * this.MAX_THIRD_JUMP_BONUS;
      const thirdJumpVelocity = this.BASE_THIRD_JUMP_VELOCITY + powerBonus;

      body.setVelocityY(0);
      body.setVelocityY(thirdJumpVelocity);

      // Third jump gets bigger horizontal boost based on power level
      const horizontalBoost = HORIZONTAL_JUMP_BOOST * (1 + this.secondJumpPowerLevel);
      if (this.cursors.left.isDown) {
        body.setVelocityX(body.velocity.x - horizontalBoost);
      } else if (this.cursors.right.isDown) {
        body.setVelocityX(body.velocity.x + horizontalBoost);
      }
    }

    // Continue charging second jump while holding (up to max time)
    if (this.cursors.up.isDown && this.isChargingSecondJump && body.velocity.y < 0) {
      const jumpDuration = time - this.jumpStartTime;

      if (jumpDuration <= this.MAX_SECOND_JUMP_HOLD_TIME) {
        // Calculate additional velocity based on hold duration
        const holdProgress = jumpDuration / this.MAX_SECOND_JUMP_HOLD_TIME;
        const additionalVelocity = (this.MAX_SECOND_JUMP_VELOCITY - this.MIN_SECOND_JUMP_VELOCITY) * holdProgress;
        const targetVelocity = this.MIN_SECOND_JUMP_VELOCITY + additionalVelocity;

        // Store the power level for the third jump (0 to 1)
        this.secondJumpPowerLevel = holdProgress;

        // Apply the velocity if it's stronger than current velocity
        if (targetVelocity < body.velocity.y) {
          body.setVelocityY(targetVelocity);
        }
      } else {
        // Max charge time reached, finalize the power level
        this.secondJumpPowerLevel = 1.0;
      }
    }

    // Stop charging when key is released or player starts falling
    if (jumpKeyJustReleased || body.velocity.y >= 0) {
      this.isChargingSecondJump = false;
      this.isJumping = false;
    }
  }

  private handleVisualEffects(body: Phaser.Physics.Arcade.Body) {
    // Add visual rotation based on velocity for rolling effect
    this.rotation += (body.velocity.x / 2) * 0.0001;
  }

  destroy() {
    // Clean up the event listener when destroying
    this.scene.events.off("update", this.handleUpdate, this);
    console.log("you died!");
    super.destroy();
  }

  // Getter methods for accessing player state
  public getJumpCount(): number {
    return this.jumpCount;
  }

  public getMaxJumps(): number {
    return this.MAX_JUMPS;
  }

  public hasTripleJumpEnabled(): boolean {
    return this.hasTripleJump;
  }

  public getSecondJumpPowerLevel(): number {
    return this.secondJumpPowerLevel;
  }

  public isOnGround(): boolean {
    return this.body ? (this.body as Phaser.Physics.Arcade.Body).onFloor() : false;
  }

  public getVelocity(): { x: number; y: number } {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return { x: body.velocity.x, y: body.velocity.y };
  }
}
