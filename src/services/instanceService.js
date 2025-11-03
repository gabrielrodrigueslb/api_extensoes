import prisma from '../prismaClient.js';

export const createInstance = async (client_name, instance_Url) => {
  // Verifica se já existe
  const existingInstance = await prisma.instancias.findUnique({
    where: { instance_url: instance_Url },
  });

  if (existingInstance) {
    throw { status: 409, message: 'Instância com esta URL já existe.' };
  }

  // Cria nova instância
  const newInstance = await prisma.instancias.create({
    data: {
      client_name,
      instance_url: instance_Url,
      is_active: true,
    },
  });

  return {
    status: 200,
    success: true,
    instance: newInstance,
    message: 'Instância criada com sucesso.',
  };
};
