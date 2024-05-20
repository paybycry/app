import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user && user.role === "admin") {
      return true;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error verifying admin:", error.message);
    } else {
      console.error("Error verifying admin:", error);
    }
  }
  return false;
}
