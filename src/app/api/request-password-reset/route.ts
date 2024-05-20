import sendEmail from "@/utils/sendEmail"; // Utility function to send emails
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ message: "Missing email" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "Email not found" }, { status: 404 });
    }

    const resetToken = nanoid();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/recovery?token=${resetToken}`;
    await sendEmail(
      email,
      "Reset your password",
      `Click the link to reset your password: ${resetUrl}`
    );

    return NextResponse.json(
      { message: "Password reset email sent" },
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
