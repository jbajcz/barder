import { useState, useEffect } from "react";
import useSharedGameStatus from "@/app/hook/useGameStatus";
import useSharedItemStatus from "@/app/hook/useItemStatus";

const TraderSelection = () => {
  const [data, setData] = useState([]);
  const { gameStatus, setGameStatus } = useSharedGameStatus();
  const { itemStatus, setItemStatus } = useSharedItemStatus();

  return <div className="mx-auto max-w-md w-full mt-32">Trader Selection</div>;
};

export default TraderSelection;
