import { verifyAdmin } from "@/utils/verifyAdmin";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { chainId, address } = body;
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  console.log(authHeader);

  if (!chainId || !address || !token) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const isAdmin = await verifyAdmin(token);
  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const merchant = await prisma.merchant.create({
      data: {
        chainId: Number(chainId),
        address,
      },
    });

    return NextResponse.json({ merchant }, { status: 201 });
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
