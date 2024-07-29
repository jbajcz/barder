import { useState } from "react";
import { useBetween } from "use-between";

const useSuccessStatus = () => {
  const [success , setSuccess] = useState<string>("");
  return {
    success,
    setSuccess,
  };
};

const useSharedSuccessStatus = () => useBetween(useSuccessStatus);
export default useSharedSuccessStatus;
