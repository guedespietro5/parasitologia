import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;

    const token = jwt.sign(
      { id: user.id, email: user.email, roleId: user.roleId },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return { 
      token,
      roleId: user.roleId, 
      userId: user.id,
    };
  }
}
