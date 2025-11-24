import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostService {
  async getAll() {
    const posts = await prisma.post.findMany({
      include: {
        parasiteAgent: { select: { name: true } },
        host: { select: { name: true } },
        transmission: { select: { name: true } },
        author: { select: { name: true } }
      }
    });
  
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      validated: post.validated,
      attachments: post.attachments, // Adicionar attachments
  
      author: post.author?.name,
      parasiteAgent: post.parasiteAgent?.name,
      host: post.host?.name,
      transmission: post.transmission?.name
    }));
  }
  
  async getPendingPosts() {
    const posts = await prisma.post.findMany({
      where: { validated: false },
      include: {
        parasiteAgent: { select: { name: true } },
        host: { select: { name: true } },
        transmission: { select: { name: true } },
        author: { select: { name: true } }
      }
    });
  
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      validated: post.validated,
      attachments: post.attachments, // Adicionar attachments
  
      author: post.author?.name,
      parasiteAgent: post.parasiteAgent?.name,
      host: post.host?.name,
      transmission: post.transmission?.name
    }));
  }
  
  
  async getById(id: number) {
    return prisma.post.findUnique({ where: { id } });
  }

  async getByAuthorId(authorId: number) {
    const posts = await prisma.post.findMany({
      where: { authorId },
      include: {
        parasiteAgent: { select: { name: true } },
        host: { select: { name: true } },
        transmission: { select: { name: true } },
        author: { select: { name: true } }
      }
    });
  
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      validated: post.validated,
      attachments: post.attachments, // Adicionar attachments
  
      author: post.author?.name,
      parasiteAgent: post.parasiteAgent?.name,
      host: post.host?.name,
      transmission: post.transmission?.name
    }));
  }
  

  async create(data: { 
    title: string, 
    content: string, 
    imageUrl: string, 
    authorId: number, 
    parasiteAgentId: number, 
    hostId: number, 
    transmissionId: number,
    attachments?: string // Adicionar attachments como opcional
  }) {
    return prisma.post.create({ data });
  }

  async updateValidate(id: number, data: { validated: boolean}) {
    return prisma.post.update({
      where: { id },
      data,
    });
  }
  
  async update(id: number, data: { 
    title: string, 
    content: string, 
    imageUrl: string, 
    validated: boolean,  
    authorId: number, 
    parasiteAgentId: number, 
    hostId: number, 
    transmissionId: number,
    attachments?: string // Adicionar attachments como opcional
  }) {
    return prisma.post.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.post.delete({ where: { id } });
  }
}