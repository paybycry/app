"use client";

import MerchantForm, { Merchant } from "@/components/MerchantForm";
import { useEffect, useState } from "react";

const MerchantsPage = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchMerchants = async () => {
      const response = await fetch("/api/merchants");
      const data = await response.json();
      if (response.ok) {
        setMerchants(data);
      } else {
        setMessage(data.error || "Failed to fetch merchants");
      }
    };

    fetchMerchants();
  }, []);

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/merchants/delete?id=${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (response.ok) {
      setMessage("Merchant deleted successfully");
      setMerchants(merchants.filter((merchant) => merchant.id !== id));
    } else {
      setMessage(data.error || "Failed to delete merchant");
    }
  };

  const handleEdit = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
  };

  const handleAdd = () => {
    setSelectedMerchant(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Merchants
        </h2>
        <button
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          Add Merchant
        </button>
        {message && <p className="mb-4 text-red-500 text-sm">{message}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Chain ID</th>
                <th className="py-3 px-6 text-left">Address</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {merchants.map((merchant) => (
                <tr
                  key={merchant.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {merchant.id}
                  </td>
                  <td className="py-3 px-6 text-left">{merchant.chainId}</td>
                  <td className="py-3 px-6 text-left">{merchant.address}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleEdit(merchant)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(merchant.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <MerchantForm
        merchant={selectedMerchant}
        setMerchants={setMerchants}
        merchants={merchants}
        setMessage={setMessage}
      />
    </div>
  );
};

export default MerchantsPage;
