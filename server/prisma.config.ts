import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    // URL do banco usada nas migrations
    url: process.env.DATABASE_URL!,
  },
});
