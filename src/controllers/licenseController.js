import {
  activateLicense,
  createLicense,
  deactivateLicense,
  reactivateLicense,
  getLicenseInfo, // Adicionado
  listLicenses, // Adicionado
  deleteLicense,
  unbindLicenseMachine, // Adicionado
} from '../services/licenseService.js';

export const postActiveLicense = async (req, res) => {
  const { licenseKey, machineId } = req.body;

  if (!licenseKey || !machineId)
    return res
      .status(400)
      .json({
        success: false,
        message: 'Chave de licença e ID da máquina são obrigatórios.',
      });

  try {
    const result = await activateLicense(licenseKey, machineId);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};
export const postCreateLicense = async (req, res) => {
  const { instance_url, config_id } = req.body;

  if (!instance_url || !config_id)
    return res
      .status(400)
      .json({
        success: false,
        message: 'Url da instância e a configuração são obrigatórios.',
      });

  try {
    const result = await createLicense(instance_url, config_id);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};

export const postDeactivateLicense = async (req, res) => {
  const { license_key } = req.body;
  if (!license_key)
    return res
      .status(400)
      .json({ success: false, message: 'Chave de licença é obrigatória.' });
  try {
    const result = await deactivateLicense(license_key);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};

export const postReactivateLicense = async (req, res) => {
  const { license_key } = req.body;
  if (!license_key)
    return res
      .status(400)
      .json({ success: false, message: 'Chave de licença é obrigatória.' });
  try {
    const result = await reactivateLicense(license_key);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};

// --- NOVOS HANDLERS ADICIONADOS ---

/**
 * @description Busca informações detalhadas de uma licença específica.
 * @route GET /v1/license/info/:key
 */
export const getLicenseInfoByKey = async (req, res) => {
  const { key } = req.params;
  if (!key)
    return res
      .status(400)
      .json({ success: false, message: 'Chave de licença (key) é obrigatória na URL.' });

  try {
    const result = await getLicenseInfo(key);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};

/**
 * @description Lista todas as licenças no sistema.
 * @route GET /v1/license/list
 */
export const getListLicenses = async (req, res) => {
  try {
    const result = await listLicenses();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};

/**
 * @description Deleta uma licença permanentemente.
 * @route DELETE /v1/license/:key
 */
export const deleteLicenseByKey = async (req, res) => {
  const { key } = req.params;
  if (!key)
    return res
      .status(400)
      .json({ success: false, message: 'Chave de licença (key) é obrigatória na URL.' });

  try {
    const result = await deleteLicense(key);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};

export const postUnbindLicense = async (req, res) => {
  const { license_key } = req.body;
  
  if (!license_key)
    return res.status(400).json({ success: false, message: 'Chave de licença é obrigatória.' });

  try {
    const result = await unbindLicenseMachine(license_key);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};