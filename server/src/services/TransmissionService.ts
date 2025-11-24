import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransmissionService {
  async getAll() {
    return prisma.transmission.findMany();
  }

  async getById(id: number) {
    return prisma.transmission.findUnique({ where: { id } });
  }

  async create(data: { name: string}) {
    return prisma.transmission.create({ data });
  }

  async update(id: number, data: { name: string}) {
    return prisma.transmission.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.transmission.delete({ where: { id } });
  }
}
