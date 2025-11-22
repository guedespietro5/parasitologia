import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  async getAll() {
    return prisma.user.findMany();
  }

  async getById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { name: string, email: string, password: string, roleId: number }) {
    return prisma.user.create({ data });
  }

  async update(id: number, data: { name: string, email: string, password: string, roleId: number }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
