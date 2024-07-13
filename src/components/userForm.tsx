import { useState, useEffect } from "react";
import axios from "axios";
import useSharedGameStatus from "@/app/hook/useGameStatus";
import useSharedItemStatus from "@/app/hook/useItemStatus";

const UserForm = () => {
  const [data, setData] = useState([]);
  const { gameStatus, setGameStatus } = useSharedGameStatus();
  const { itemStatus, setItemStatus } = useSharedItemStatus();
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
    if (formData.name && formData.item) {
      setGameStatus("trader-selection");
      setItemStatus(formData.item);
    }
  };

  return (
    <div className="mx-auto max-w-md w-full mt-32">
      <div className="mb-4 items-center text-center">
        <h2 className="text-3xl font-semibold items-center">
          Let&apos;s Barder!
        </h2>
        <p className="text-sm text-gray-600 mb-4">
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
            className="block text-sm font-medium text-[#e0e0e0]"
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
        </div>
        <div>
          <label
            htmlFor="item"
            className="block text-sm font-medium text-[#e0e0e0]"
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
