import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { verifyMessage } from "viem";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { address, message, signature } = await req.json();

  if (!address || !message || !signature) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
    );
  }

  try {
    const isValid = await verifyMessage({ address, message, signature });
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Check if the address already exists
    let userAddress = await prisma.address.findUnique({
      where: { signedAddress: address },
    });

    if (!userAddress) {
      // Find the user to associate with this address
      const user = await prisma.user.findFirst();
      if (!user) {
        return NextResponse.json(
          { message: "No user found to associate with the address" },
          { status: 400 }
        );
      }

      // Create a new address entry
      userAddress = await prisma.address.create({
        data: {
          userId: user.id,
          signedAddress: address,
        },
      });
    } else {
      // Update the existing address entry with the new signature
      await prisma.address.update({
        where: { signedAddress: address },
        data: { signedAddress: address },
      });
    }

    return NextResponse.json(
      { message: "Address verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}
