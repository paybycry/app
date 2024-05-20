"use client";

import WalletConnect from "@/components/WalletConnect";
import { apiRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  userId: number;
  merchantId: number;
  addressId: number;
  amount: number;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  login: string;
  email: string;
}

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await apiRequest("/api/user");
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setTransactions(data.transactions);
        const totalBalance = data.transactions.reduce(
          (acc: number, transaction: Transaction) => acc + transaction.amount,
          0
        );
        setBalance(totalBalance);
      } else {
        setMessage(data.error || "Failed to fetch user data");
        if (response.status === 401) {
          router.push("/login");
        }
      }
    };

    fetchUserData();
  }, [router]);

  const handleCheckBalance = async () => {
    const response = await apiRequest("/api/user/check-balance", {
      method: "POST",
    });
    const data = await response.json();

    if (response.ok) {
      setMessage("Balance checked successfully");
      const totalBalance = data.transactions.reduce(
        (acc: number, transaction: Transaction) => acc + transaction.amount,
        0
      );
      setBalance(totalBalance);
    } else {
      setMessage(data.error || "Failed to check balance");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          User Dashboard
        </h2>
        {message && <p className="mb-4 text-red-500 text-sm">{message}</p>}
        {user && (
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">User Information</h3>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Login:</strong> {user.login}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Balance:</strong> {balance}
            </p>
            <button
              onClick={handleCheckBalance}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
            >
              Check Balance
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <h3 className="text-xl font-bold mb-2">Transaction History</h3>
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Merchant ID</th>
                <th className="py-3 px-6 text-left">Address ID</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Created At</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">{transaction.id}</td>
                  <td className="py-3 px-6 text-left">
                    {transaction.merchantId}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {transaction.addressId}
                  </td>
                  <td className="py-3 px-6 text-left">{transaction.amount}</td>
                  <td className="py-3 px-6 text-left">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <WalletConnect />
      </div>
    </div>
  );
};

export default DashboardPage;
