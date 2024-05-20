import chainMapping from "@/utils/chainMapping";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import { createPublicClient, formatUnits, http } from "viem";

const prisma = new PrismaClient();

async function checkTransactions() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Find addresses added in the last hour
  const addresses = await prisma.address.findMany({
    where: {
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  for (const address of addresses) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: address.userId },
    });

    if (!merchant) continue;

    const chain = chainMapping[merchant.chainId];
    if (!chain) continue;

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
  }
}

// Schedule the cron job to run every minute
cron.schedule("* * * * *", () => {
  console.log("Checking for new transactions...");
  checkTransactions();
});
