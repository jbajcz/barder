import { useState } from "react";
import { useBetween } from "use-between";

const useItemStatus = () => {
  const [itemStatus, setItemStatus] = useState<string>("");
  return {
    itemStatus,
    setItemStatus,
  };
};

const useSharedItemStatus = () => useBetween(useItemStatus);
export default useSharedItemStatus;
