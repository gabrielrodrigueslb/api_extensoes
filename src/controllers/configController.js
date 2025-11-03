import { createConfig } from '../services/configService.js';

export const postCreateConfig = async (req, res) => {
  const { config_name, instance_url, config_data } = req.body;

  if (!config_name || !instance_url || !config_data)
    return res.status(400).json({
      success: false,
      message:
        'O config_name, instanceUrl, config_data são obrigatórios, verifique se todos estão presentes.',
    });

  try {
    const result = await createConfig(config_name, instance_url, config_data);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};
