import { createInstance, getAllInstances } from '../services/instanceService.js';

export const postCreateInstance = async (req, res) => {
  const { client_name, instance_url } = req.body;

  if (!client_name || !instance_url)
    return res.status(400).json({
      success: false,
      message:
        'O nome do cliente e a URL da instância são obrigatórios, verifique se todos estão corretos.',
    });

  try {
    const result = await createInstance(client_name, instance_url);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erro interno no servidor.',
    });
  }
};

export const getListInstances = async (req, res) => {
  try {
    const result = await getAllInstances();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
