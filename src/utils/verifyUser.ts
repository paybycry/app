import jwt from "jsonwebtoken";

export function verifyUser(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
