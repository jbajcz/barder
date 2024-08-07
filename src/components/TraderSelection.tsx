import { useState, useEffect } from "react";
import axios from "axios";
import useSharedGameStatus from "@/app/hook/useGameStatus";
import useSharedTraderNameStatus from "@/app/hook/useTraderStatus";
import useSharedLevelStatus from "@/app/hook/useLevelStatus";
import useCurrentMood from "@/app/hook/useCurrentMood";
import useSharedSuccessStatus from "@/app/hook/useSuccessStatus";



interface Trader {
  name: string;
  animal: string;
  personality: string;
  mood: string;
  inventory_item: string;
  inventory_value: number;
}

const TraderSelection = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const { gameStatus, setGameStatus } = useSharedGameStatus();
  const { traderStatus, setTraderStatus } = useSharedTraderNameStatus();
  const { levelStatus, setLevelStatus} = useSharedLevelStatus();
  const [formData, setFormData] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {currentMood , setCurrentMood} = useCurrentMood();
  const { success , setSuccess } = useSharedSuccessStatus();


 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/generate_traders"
        );
        setTraders(response.data.traders);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: any) => {
    setFormData(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    setSuccess("Trade processing")
    e.preventDefault();
    console.log("Trader Name:", formData);
    const trader = traders.find(trader => trader.name.toLowerCase() === formData.toLowerCase());
    if (trader) {
      setGameStatus("chat-session");
      trader.inventory_item = trader.inventory_item.charAt(0).toUpperCase()+trader.inventory_item.slice(1)
      setTraderStatus(trader);
      setCurrentMood(trader.mood);
    } else {
      setErrorMessage("Trader name not found. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="item-info top-right font-bold">
        <h2>
          Level: {levelStatus}
        </h2>
      </div>
      <h1 className="text-2xl font-bold mb-8 text-center text-purple-600">
        Select a Trader
        </h1>
      <div className="flex overflow-x-auto space-x-4">
        {traders.map((trader, index) => (
          <div key={index} className="flex-shrink-0 w-64 p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex justify-center mb-2">
              <img
                src={`http://127.0.0.1:5000/static/images/traders/${trader.animal}.jpg`}
                alt={trader.animal}
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">
              {trader.name}
              </h2>
            <p className="text-gray-700 mb-1 text-center">
              Personality: {trader.personality}
              </p>
            <p className="text-gray-700 mb-3 text-center">
              Mood: {trader.mood}
              </p>
            <div className="flex justify-center mb-2">
              <img
                src={`http://127.0.0.1:5000/static/images/inventory/${trader.inventory_item}.jpg`}
                alt={trader.inventory_item}
                className="w-36 h-24 object-cover"
                />
            </div>
            <p className="text-gray-700 text-center">Value: ${trader.inventory_value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <label 
          htmlFor="traderName" 
          className="text-lg mt-6 text-purple-600">
          Enter the name of the trader you want to trade with:
      </label>
      {errorMessage && (
        <p 
          className="text-red-500 text-sm mt-2">
            {errorMessage}
        </p>
      )}
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col space-y-4 p-4 rounded-lg mt-1 shadow-md border border-[#8b5cf6]">
        <label
            htmlFor="name"
            className="block text-sm font-medium text-white"
          >
            Name
        </label>
        <input
          type="text"
          id="traderName"
          value={formData}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-[#8b5cf6] rounded-md shadow-sm bg-[#0f0f1a] text-white focus:outline-none sm:text-sm"
        />
        <button 
          type="submit" 
          className="self-start inline-flex items-center px-4 py-2 w-auto border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#19b351] hover:bg-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9a37b8]">
          Submit
          </button>
          
      </form>
    </div>
  );
};

export default TraderSelection;
