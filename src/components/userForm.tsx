import { useState, useEffect } from "react";
import axios from "axios";
import { startUser } from "./userMessage";
import useSharedGameStatus from "@/app/hook/useGameStatus";
import useSharedItemStatus from "@/app/hook/useItemStatus";
import useSharedItemPriceStatus from "@/app/hook/useItemPriceStatus";
import useUserNameStatus from "@/app/hook/useUserName";
import { checkUsername } from './checkName';


const UserForm = () => {
  const [data, setData] = useState([]);
  const { gameStatus, setGameStatus } = useSharedGameStatus();
  const { itemStatus, setItemStatus } = useSharedItemStatus();
  const { itemPriceStatus, setItemPriceStatus } = useSharedItemPriceStatus();
  const { userNameStatus, setUserNameStatus } = useUserNameStatus();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ check , setCheck] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    item: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/starting_items"
        );
        console.log(response.data["starting_items"]);
        setData(response.data["starting_items"]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("Form data:", formData);

    try {
      const response = await checkUsername(formData.name);
      setCheck(response.inappropriate)
      if (response.inappropriate === 'yes') {
        setErrorMessage("The name you entered is not allowed. Please choose another name.")
        return;
      }

      if (formData.name && formData.item) {
        setGameStatus("trader-selection");
        formData.name = formData.name.charAt(0).toUpperCase()+formData.name.slice(1);
        setUserNameStatus(formData.name);
        formData.item = formData.item.charAt(0).toUpperCase()+formData.item.slice(1);
        setItemStatus(formData.item);
        setItemPriceStatus(10000);
  
        startUser(formData.name, formData.item, itemPriceStatus)
        setErrorMessage(null);
  
      }
    } catch (error) {
      console.error('Error checking name', error);
      setErrorMessage("An error occurred while checking the name. Please try agian.");
    }

    
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="mb-4 items-center text-center">
        <h2 className="text-3xl font-semibold items-center text-purple-600">
          Let&apos;s Barder!
        </h2>
        <p className="text-sm text-gray-600 mb-4 text-white">
          Enter your name and choose your starting gear
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-8 rounded-lg shadow-md border border-[#8b5cf6]"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-[#8b5cf6] rounded-md shadow-sm bg-[#0f0f1a] text-[#e0e0e0] focus:outline-none sm:text-sm"
            required
          />
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600">
              {errorMessage}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="item"
            className="block text-sm font-medium text-white"
          >
            Item
          </label>
          <select
            id="item"
            name="item"
            value={formData.item}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-[#8b5cf6] rounded-md shadow-sm bg-[#0f0f1a] text-[#e0e0e0] focus:outline-none sm:text-sm"
            required
          >
            <option value="">Select a starting item</option>
            {data?.map((item) => (
              <option key={item} value={item}>
                {item} ($10,000)
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#19b351] hover:bg-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9a37b8]"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
