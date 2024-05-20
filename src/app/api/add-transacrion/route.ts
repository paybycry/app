import wss from "@/server/webSocketServer";
import chainMapping from "@/utils/chainMapping";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { createPublicClient, formatUnits, http } from "viem";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { merchantId, addressId, transactionHash } = body;

  if (!merchantId || !addressId || !transactionHash) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!merchant || !address) {
      return NextResponse.json(
        { message: "Invalid merchant or address" },
        { status: 404 }
      );
    }

    const txHash = await prisma.transaction.findUnique({
      where: { transactionHash },
    });

    if (txHash) {
      return NextResponse.json(
        { message: "Transaction already processed" },
        { status: 404 }
      );
    } else {
      await prisma.transaction.create({
        data: {
          userId: address.userId,
          merchantId: merchant.id,
          addressId: address.id,
          transactionHash,
        },
      });
    }

    const chain = chainMapping[merchant.chainId];
    if (!chain) {
      return NextResponse.json(
        { message: "Unsupported chain" },
        { status: 400 }
      );
    }

    const client = createPublicClient({
      chain,
      transport: http(),
    });

    const checkTransactionStatus = async () => {
      const tx = await client.getTransaction({ hash: transactionHash });

      if (tx) {
        const amount = parseFloat(formatUnits(tx.value, 18));

        if (
          tx.from.toLowerCase() === address.signedAddress.toLowerCase() &&
          tx.to?.toLowerCase() === merchant.address.toLowerCase() &&
          amount > 0
        ) {
          await prisma.transaction.update({
            where: { transactionHash },
            data: {
              amount,
            },
          });

          // Send notification to user via WebSocket
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  message: "Transaction successful",
                  transactionHash,
                  amount,
                })
              );
            }
          });

          return true; // Transaction was successful
        }
      }

      return false; // Transaction not yet successful
    };

    const interval = 10000; // 10 seconds
    const maxChecks = 60; // 10 minutes / 10 seconds

    for (let i = 0; i < maxChecks; i++) {
      const success = await checkTransactionStatus();
      if (success) break;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    return NextResponse.json(
      { message: "Balance check complete" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
