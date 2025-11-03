import prisma from '../prismaClient.js';

export const createConfig = async (config_name, instance_url, config_data) => {
  const instancia = await prisma.instancias.findUnique({
    where: { instance_url: instance_url },
  });

  if (!instancia) throw { status: 404, message: 'Instância não existente.' };

  if (!config_data.dbName || !config_data.clientToken) {
    throw {
      status: 400,
      message: 'Config data inválido. É necessário dbName e clientToken.',
    };
  }

  const newConfig = await prisma.configs.create({
    data: {
      config_name,
      config_data: config_data, // direto, sem chaves extras
      is_active: true,
      instance_id: instancia.id,
      created_at: new Date(),
    },
  });
  if (!config_data.dbName || !config_data.clientToken) {
    throw {
      status: 400,
      message: 'Config data inválido. É necessário dbName e clientToken.',
    };
  }

  if (!newConfig)
    throw { status: 400, message: 'Falha ao criar nova configuração.' };

  return {
    success: true,
    config: newConfig,
    message: 'Configuração criada com sucesso!',
  };
};

export const 