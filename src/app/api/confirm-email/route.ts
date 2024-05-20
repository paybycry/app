import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { confirmationToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        active: true,
        confirmationToken: null,
      },
    });

    return NextResponse.json(
      { message: "Email confirmed. You can now log in." },
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
