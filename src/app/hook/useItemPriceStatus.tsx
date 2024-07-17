import { useState } from "react";
import { useBetween } from "use-between";

const useItemPriceStatus = () => {
  const [itemPriceStatus, setItemPriceStatus] = useState<number>(10000);
  return {
    itemPriceStatus,
    setItemPriceStatus,
  };
};

const useSharedItemPriceStatus = () => useBetween(useItemPriceStatus);
export default useSharedItemPriceStatus;
