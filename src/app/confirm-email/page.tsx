"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ConfirmEmailPage = () => {
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleConfirm = async () => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Invalid confirmation token.");
      return;
    }

    const response = await fetch("/api/confirm-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Email confirmed successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000); // Redirect to login page after 3 seconds
    } else {
      setMessage(data.error || "Email confirmation failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Email Confirmation
        </h2>
        <p className="text-center text-gray-700 mb-4">
          {message || "Click the button below to confirm your email."}
        </p>
        <button
          onClick={handleConfirm}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
