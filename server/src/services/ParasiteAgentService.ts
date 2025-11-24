import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ParasiteAgentService {
  async getAll() {
    return prisma.parasiteAgent.findMany();
  }

  async getById(id: number) {
    return prisma.parasiteAgent.findUnique({ where: { id } });
  }

  async create(data: { name: string}) {
    return prisma.parasiteAgent.create({ data });
  }

  async update(id: number, data: { name: string}) {
    return prisma.parasiteAgent.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.parasiteAgent.delete({ where: { id } });
  }
}
