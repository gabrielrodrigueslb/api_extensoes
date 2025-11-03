// prismaClient.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log('✅ Prisma conectado ao banco!'))
  .catch((err) => console.error('Erro ao conectar ao banco via Prisma:', err));

export default prisma;
