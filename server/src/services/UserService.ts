import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class UserService {
  async getAll() {
    return prisma.user.findMany();
  }

  async getById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { name: string; email: string; password: string; roleId: number }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async update(
    id: number,
    data: { name?: string; email?: string; password?: string; roleId?: number }
  ) {
    let updatedData = { ...data };

    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.update({
      where: { id },
      data: updatedData,
    });
  }

  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
