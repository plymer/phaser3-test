import { useEngineContext } from "@/engine/EngineContext";

const UiLayer = () => {
  const { engineRef } = useEngineContext();

  const addSprite = () => {
    if (engineRef?.current) {
      const scene = engineRef.current.scene;

      if (scene) {
        // Add a new sprite to the current scene at a random position
        const sx = Phaser.Math.Between(64, scene.scale.width - 64);
        const sy = Phaser.Math.Between(64, scene.scale.height - 64);
        const lx = Phaser.Math.Between(64, scene.scale.width - 64);
        const ly = Phaser.Math.Between(64, scene.scale.height - 64);

        //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
        const star = scene.add.sprite(sx, sy, "star");
        // const logo = scene.add.sprite(lx, ly, "logo");

        const arc = scene.add.circle(lx, ly, 32, 0xff0000, 0.5);

        star.setRotation(Phaser.Math.DegToRad(Phaser.Math.Between(0, 360)));
        star.setScale(Phaser.Math.FloatBetween(0.5, 6));
      }
    }
  };

  return (
    <main className="absolute w-full h-full border-2 border-black">
      <button
        className="cursor-pointer absolute top-1/2 -translatex-1/2 right-0 border-2 border-black rounded-md px-4 py-2 mx-4 bg-amber-700"
        onClick={() => addSprite()}
      >
        Add New Sprite
      </button>
    </main>
  );
};

export default UiLayer;
