import { GameEngine } from "@/engine/GameEngine";
import { useEngineContext } from "@/engine/EngineContext";
import UiLayer from "@/ui/UiLayer";

function App() {
  const { engineRef } = useEngineContext();

  return (
    <>
      <UiLayer />
      <GameEngine ref={engineRef} />
    </>
  );
}

export default App;
