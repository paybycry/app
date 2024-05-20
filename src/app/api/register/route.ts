import sendEmail from "@/utils/sendEmail"; // Utility function to send emails
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const { name, login, email, password } = body;

  if (!name || !login || !email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const confirmationToken = nanoid();

  try {
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "user";

    const user = await prisma.user.create({
      data: {
        name,
        login,
        email,
        password: hashedPassword,
        salt,
        active: false,
        confirmationToken,
        role,
      },
    });

    // Send confirmation email
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/confirm-email?token=${confirmationToken}`;
    await sendEmail(
      email,
      "Confirm your email",
      `Please confirm your email by clicking on the following link: ${confirmationUrl}`
    );

    return NextResponse.json(
      {
        message:
          "User registered. Please check your email to confirm your account.",
      },
      { status: 201 }
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
