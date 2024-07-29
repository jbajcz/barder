import { useState } from "react";
import { useBetween } from "use-between";

const useLevelStatus = () => {
  const [levelStatus, setLevelStatus] = useState<number>(1);
  return {
    levelStatus,
    setLevelStatus,
  };
};

const useSharedLevelStatus = () => useBetween(useLevelStatus);
export default useSharedLevelStatus;
