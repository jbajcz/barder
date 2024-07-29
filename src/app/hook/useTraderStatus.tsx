import { useState } from "react";
import { useBetween } from "use-between";


interface Trader {
  name: string;
  animal: string;
  personality: string;
  mood: string;
  inventory_item: string;
  inventory_value: number;
}
const defaultTrader: Trader = {
  name: '',
  animal: '',
  personality: '',
  mood: '',
  inventory_item: '',
  inventory_value: 0,
};

const useTraderStatus = () => {
  const [traderStatus, setTraderStatus] = useState<Trader>(defaultTrader);
  return {
    traderStatus,
    setTraderStatus,
  };
};
const useSharedTraderNameStatus = () => useBetween(useTraderStatus);
export default useSharedTraderNameStatus;
