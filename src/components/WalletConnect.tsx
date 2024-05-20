"use client";

import { config } from "@/lib/config";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";

const WalletConnect = () => {
  const { connect } = useConnect({
    config,
  });
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [message, setMessage] = useState(
    "Please sign this message to verify your address."
  );
  const [signature, setSignature] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );

  const handleConnect = async () => {
    try {
      connect({ connector: injected() });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleSignMessage = async () => {
    try {
      const signature = await signMessageAsync({ message });
      setSignature(signature);
      await verifySignature(address!, message, signature);
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  const verifySignature = async (
    address: string,
    message: string,
    signature: string
  ) => {
    try {
      const response = await fetch("/api/connect-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, message, signature }),
      });

      const data = await response.json();
      if (response.ok) {
        setVerificationStatus("Address verified successfully.");
      } else {
        setVerificationStatus("Verification failed.");
      }
    } catch (error) {
      console.error("Error verifying signature:", error);
      setVerificationStatus("Verification failed.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Wallet Connect</h2>
      {isConnected ? (
        <>
          <p>
            <strong>Connected Address:</strong> {address}
          </p>
          <button
            onClick={handleSignMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
          >
            Sign Message
          </button>
          {signature && (
            <div>
              <p>
                <strong>Signature:</strong> {signature}
              </p>
              <p>
                <strong>Status:</strong> {verificationStatus}
              </p>
            </div>
          )}
          <button
            onClick={() => disconnect()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={() => handleConnect()}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
