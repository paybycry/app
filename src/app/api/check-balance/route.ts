import chainMapping from "@/utils/chainMapping";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { createPublicClient, formatUnits, http } from "viem";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, merchantId, addressId } = body;

  if (!userId || !merchantId || !addressId) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!user || !merchant || !address) {
      return NextResponse.json(
        { message: "Invalid user, merchant, or address" },
        { status: 404 }
      );
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

    const blockNumber = await client.getBlockNumber();
    const block = await client.getBlock({ blockNumber });

    for (const txHash of block.transactions) {
      const tx = await client.getTransaction({ hash: txHash });

      if (
        tx.from.toLowerCase() === address.signedAddress.toLowerCase() &&
        tx.to?.toLowerCase() === merchant.address.toLowerCase()
      ) {
        const existingTx = await prisma.transaction.findUnique({
          where: { transactionHash: tx.hash },
        });

        if (!existingTx) {
          await prisma.transaction.create({
            data: {
              userId: address.userId,
              merchantId: merchant.id,
              addressId: address.id,
              transactionHash: tx.hash,
              amount: parseFloat(formatUnits(tx.value, 18)),
            },
          });
        }
      }
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
