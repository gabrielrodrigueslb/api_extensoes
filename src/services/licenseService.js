import prisma from '../prismaClient.js';
import jwt from 'jsonwebtoken';

export const activateLicense = async (licenseKey, machineId) => {
  const license = await prisma.licenses.findUnique({
    where: { license_key: licenseKey },
    include: {
      configs: {
        include: { instancias: true }, // lembre que no schema atual é 'instancias'
      },
    },
  });

  if (!license) throw { status: 404, message: 'Chave de licença inválida.' };
  if (!license.configs.instancias || !license.configs.instancias.is_active)
    throw { status: 403, message: 'O acesso para esta empresa foi suspenso.' };
  if (!license.configs.is_active)
    throw { status: 403, message: 'O acesso para esta loja foi suspenso.' };
  if (!license.is_active)
    throw { status: 403, message: 'Esta licença foi desativada.' };

  const { dbName, clientToken } = license.configs.config_data;
  const finalConfig = {
    instanceUrl: license.configs.instancias.instance_url,
    dbName,
    clientToken,
  };

  if (!license.activated_machine_id) {
    await prisma.licenses.update({
      where: { license_key: licenseKey },
      data: { activated_machine_id: machineId },
    });
    return { success: true, configs: finalConfig };
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

export const deactivateLicense = async (licenseKey) => {
  const license = await prisma.licenses.findUnique({
    where: { license_key: licenseKey },
  });
  if (!license) throw { status: 404, message: 'Chave de licença inválida.' };

  await prisma.licenses.update({
    where: { license_key: licenseKey },
    data: { is_active: false },
  });
  return {
    success: true,
    message: 'Licença desativada com sucesso.',
  };
}

export const reactivateLicense = async (licenseKey) => {
  const license = await prisma.licenses.findUnique({
    where: { license_key: licenseKey },
  });
  if (!license) throw { status: 404, message: 'Chave de licença inválida.' }; 
  await prisma.licenses.update({
    where: { license_key: licenseKey },
    data: { is_active: true },
  });
  return {
    success: true,
    message: 'Licença reativada com sucesso.',
  };
}

export const getLicenseInfo = async (licenseKey) => {
  const license = await prisma.licenses.findUnique({
    where: { license_key: licenseKey },
    include: {
      configs: {
        include: { instancias: true },
      },
    },
  });
  if (!license) throw { status: 404, message: 'Chave de licença inválida.' };
  return {
    success: true,
    license: license,
  };
};

export const listLicenses = async () => {
  const licenses = await prisma.licenses.findMany({
    include: {
      configs: {
        include: { instancias: true },
      },  
    },
  });
  return {
    licenses: licenses,
  };
}

export const deleteLicense = async (licenseKey) => {
  const license = await prisma.licenses.findUnique({
    where: { license_key: licenseKey },
  });
  if (!license) throw { status: 404, message: 'Chave de licença inválida.' };
  await prisma.licenses.delete({
    where: { license_key: licenseKey },
  });
  return {
    success: true,
    message: 'Licença deletada com sucesso.',
  };
}

export const unbindLicenseMachine = async (licenseKey) => {
  const license = await prisma.licenses.findUnique({
    where: { license_key: licenseKey },
  });

  if (!license) throw { status: 404, message: 'Licença não encontrada.' };

  await prisma.licenses.update({
    where: { license_key: licenseKey },
    data: { activated_machine_id: null }, // Limpa o vínculo
  });

  return {
    success: true,
    message: 'Vínculo de máquina removido com sucesso.',
  };
};