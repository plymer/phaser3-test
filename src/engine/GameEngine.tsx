import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { AUTO, Game, Types } from "phaser";
import { EventBus } from "@/engine/EventBus";
import { Game as MainGame } from "@/game-elements/scenes/Game";

export interface IRefGameEngine {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const GameEngine = forwardRef<IRefGameEngine, IProps>(function GameEngine({ currentActiveScene }, ref) {
  const game = useRef<Phaser.Game | null>(null!);

  const config: Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#028af8",
    parent: "game-container",
    physics: { arcade: { gravity: { x: 0, y: 300 }, debug: true }, default: "arcade" },
    scene: [MainGame],
  };

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = new Game(config);

      if (typeof ref === "function") {
        ref({ game: game.current, scene: null });
      } else if (ref) {
        ref.current = { game: game.current, scene: null };
      }
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        if (game.current !== null) {
          game.current = null;
        }
      }
    };
  }, [ref]);

  useEffect(() => {
    EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
      if (currentActiveScene && typeof currentActiveScene === "function") {
        currentActiveScene(scene_instance);
      }

      if (typeof ref === "function") {
        ref({ game: game.current, scene: scene_instance });
      } else if (ref) {
        ref.current = {
          game: game.current,
          scene: scene_instance,
        };
      }
    });
    return () => {
      EventBus.removeListener("current-scene-ready");
    };
  }, [currentActiveScene, ref]);

  return <div id="game-container"></div>;
});
