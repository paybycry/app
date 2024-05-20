"use client";

import React, { useEffect, useState } from "react";

export interface Merchant {
  id: number;
  chainId: number;
  address: string;
}

export interface MerchantFormProps {
  merchant?: Merchant | null;
  setMerchants: React.Dispatch<React.SetStateAction<Merchant[]>>;
  merchants: Merchant[];
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

const MerchantForm: React.FC<MerchantFormProps> = ({
  merchant,
  setMerchants,
  merchants,
  setMessage,
}) => {
  const [chainId, setChainId] = useState<number>(merchant?.chainId || 0);
  const [address, setAddress] = useState<string>(merchant?.address || "");

  useEffect(() => {
    if (merchant) {
      setChainId(merchant.chainId);
      setAddress(merchant.address);
    } else {
      setChainId(0);
      setAddress("");
    }
  }, [merchant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = merchant ? `/api/merchants/update` : `/api/merchants/add`;
    const method = merchant ? "PUT" : "POST";
    const body = JSON.stringify({ id: merchant?.id, chainId, address });

    const token = localStorage.getItem("token"); // Retrieve the token from localStorage

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(
        merchant
          ? "Merchant updated successfully"
          : "Merchant added successfully"
      );
      if (merchant) {
        setMerchants(
          merchants.map((m) =>
            m.id === merchant.id
              ? {
                  ...m,
                  chainId: data.merchant.chainId,
                  address: data.merchant.address,
                }
              : m
          )
        );
      } else {
        setMerchants([...merchants, data.merchant]);
        setChainId(0); // Reset form fields after adding a new merchant
        setAddress("");
      }
    } else {
      setMessage(data.error || "Failed to save merchant");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {merchant ? "Update Merchant" : "Add Merchant"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="chainId"
          >
            Chain ID
          </label>
          <input
            id="chainId"
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={chainId}
            onChange={(e) => setChainId(Number(e.target.value))}
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="address"
          >
            Address
          </label>
          <input
            id="address"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {merchant ? "Update Merchant" : "Add Merchant"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MerchantForm;
