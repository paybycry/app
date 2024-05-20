const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Generate a salt for the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("test", salt);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      login: "test",
      email: "test@example.com",
      password: hashedPassword,
      salt: salt,
      active: true,
      role: "USER",
    },
  });

  // Create a test merchant
  const merchant = await prisma.merchant.create({
    data: {
      chainId: 1,
      address: "0x1234567890abcdef1234567890abcdef12345678",
    },
  });

  // Create a test address
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      signedAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdef",
    },
  });

  console.log("Added test records:", { user, merchant, address });

  const userId = 1; // Ensure this user ID exists in your User table
  const merchantId = 1; // Ensure this merchant ID exists in your Merchant table
  const addressId = 1; // Ensure this address ID exists in your Address table
  const amount = 100.0; // Ensure the amount is a float
  const transactionHash = "0x1234567890abcdef"; // Example transaction hash

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      merchantId,
      addressId,
      amount,
      transactionHash,
    },
  });

  console.log("Added transaction:", transaction);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
