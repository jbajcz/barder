import { useState } from "react";
import { useBetween } from "use-between";

const useGameStatus = () => {
  const [gameStatus, setGameStatus] = useState<string>("start-screen");
  return {
    gameStatus,
    setGameStatus,
  };
};

const useSharedGameStatus = () => useBetween(useGameStatus);
export default useSharedGameStatus;
