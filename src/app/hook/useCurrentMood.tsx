import { useState } from "react";
import { useBetween } from "use-between";



const useCurrentMood = () => {
    
    const [currentMood, setCurrentMood] = useState<string>("");
    return {
        currentMood,
        setCurrentMood,
  };
};

const useSharedCurrentMood = () => useBetween(useCurrentMood);
export default useSharedCurrentMood;
