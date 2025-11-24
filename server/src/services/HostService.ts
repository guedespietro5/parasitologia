import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HostService {
  async getAll() {
    return prisma.host.findMany();
  }

  async getById(id: number) {
    return prisma.host.findUnique({ where: { id } });
  }

  async create(data: { name: string}) {
    return prisma.host.create({ data });
  }

  async update(id: number, data: { name: string}) {
    return prisma.host.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.host.delete({ where: { id } });
  }
}
