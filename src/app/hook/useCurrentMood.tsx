import { useState } from "react";
import { useBetween } from "use-between";



const currentMood = () => {
    
    const [currentMood, setCurrentMood] = useState<string>("");
    return {
        currentMood,
        setCurrentMood,
  };
};

const useCurrentMood = () => useBetween(currentMood);
export default useCurrentMood;
