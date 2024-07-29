import { useState } from "react";
import { useBetween } from "use-between";

const useUserNameStatus = () => {
  const [userNameStatus, setUserNameStatus] = useState<string>("");
  return {
    userNameStatus,
    setUserNameStatus,
  };
};

const useSharedTraderNameStatus = () => useBetween(useUserNameStatus);
export default useSharedTraderNameStatus;
