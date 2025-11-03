import { activateLicense, createLicense } from '../services/licenseService.js';

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
