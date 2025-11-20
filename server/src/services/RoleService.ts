import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoleService {
  async getAll() {
    return prisma.role.findMany();
  }

  async getById(id: number) {
    return prisma.role.findUnique({ where: { id } });
  }

  async create(data: { name: string }) {
    return prisma.role.create({ data });
  }

  async update(id: number, data: { name: string }) {
    return prisma.role.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.role.delete({ where: { id } });
  }
}
