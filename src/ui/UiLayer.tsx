import { useEngineContext } from "@/engine/EngineContext";
import { Star } from "@/game-elements/sprites/Star";

const UiLayer = () => {
  const { engineRef } = useEngineContext();

  const addSprite = () => {
    if (engineRef?.current) {
      const scene = engineRef.current.scene;

      if (scene) {
        // Add a new sprite to the current scene at a random position
        const x = Phaser.Math.Between(64, scene.scale.width - 64);
        const y = Phaser.Math.Between(64, scene.scale.height - 64);

        const star = new Star(scene, x, y);
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
