import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostService {
  async getAll() {
    return prisma.post.findMany();
  }

  async getById(id: number) {
    return prisma.post.findUnique({ where: { id } });
  }

  async create(data: { title: string, content: string, imageUrl: string, authorId: number}) {
    return prisma.post.create({ data });
  }

  async update(id: number, data: { title: string, content: string, imageUrl: string, validated: boolean,  authorId: number}) {
    return prisma.post.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.post.delete({ where: { id } });
  }
}
