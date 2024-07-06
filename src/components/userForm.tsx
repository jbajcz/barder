import { useState } from "react";

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    item: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Form data:", formData);
    // Handle form submission, e.g., send data to an API
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
            htmlFor="category"
            className="block text-sm font-medium text-[#e0e0e0]"
          >
            Item
          </label>
          <select
            id="category"
            name="category"
            value={formData.item}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-[#8b5cf6] rounded-md shadow-sm bg-[#0f0f1a] text-[#e0e0e0] focus:outline-none sm:text-sm"
            required
          >
            <option value="">Select a starting item</option>
            <option value="">Item 1</option>
            <option value="">Item 2</option>
            <option value="">Item 3</option>
            <option value="">Item 4</option>
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
