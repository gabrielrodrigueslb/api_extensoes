import prisma from '../prismaClient.js';
import jwt from 'jsonwebtoken';

export const activateLicense = async (licenseKey, machineId) => {
  const license = await prisma.licenses.findUnique({
    where: { license_key: licenseKey },
    include: {
      config: {
        include: { instancias: true }, // lembre que no schema atual é 'instancias'
      },
    },
  });

  if (!license) throw { status: 404, message: 'Chave de licença inválida.' };
  if (!license.config.instancias || !license.config.instancias.is_active)
    throw { status: 403, message: 'O acesso para esta empresa foi suspenso.' };
  if (!license.config.is_active)
    throw { status: 403, message: 'O acesso para esta loja foi suspenso.' };
  if (!license.is_active)
    throw { status: 403, message: 'Esta licença foi desativada.' };

  const { dbName, clientToken } = license.config.config_data;
  const finalConfig = {
    instanceUrl: license.config.instancias.instance_url,
    dbName,
    clientToken,
  };

  if (!license.activated_machine_id) {
    await prisma.licenses.update({
      where: { license_key: licenseKey },
      data: { activated_machine_id: machineId },
    });
    return { success: true, config: finalConfig };
  }

  if (license.activated_machine_id === machineId)
    return { success: true, config: finalConfig };

  throw {
    status: 409,
    message: 'Esta licença já está em uso em outro computador.',
  };
};

export const createLicense = async (instance_url, config_id) => {
  const instancia = await prisma.instancias.findUnique({
    where: { instance_url: instance_url },
  });
  if (!instancia) throw { status: 404, message: 'Instância não existente.' };

  const config = await prisma.configs.findUnique({
    where: { id: config_id },
  });
  if (!config) throw { status: 404, message: 'Configuração não existente.' };

  const SECRET_KEY = process.env.JWT_SECRET;

  const licenseData = {
    instanceUrl: instance_url,
    configId: config_id,
    timestamp: Date.now(),
  };

  const token = jwt.sign(licenseData, SECRET_KEY, { expiresIn: '1y' });

  const newLicense = await prisma.licenses.create({
    data: {
      license_key: token,
      is_active: true,
      config_id: config.id,
      created_at: new Date(),
      instance_id: instancia.id,
    },
  });

  return {
    success: true,
    config: newLicense,
    message: 'Licença criada com sucesso!',
  };
};
