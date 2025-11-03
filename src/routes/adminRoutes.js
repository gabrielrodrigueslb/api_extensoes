import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

router.post('/instancia/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean')
    return res.status(400).json({ message: 'Body deve conter "is_active": true/false' });

  try {
    const updated = await prisma.instancia.update({
      where: { id: Number(id) },
      data: { is_active }
    });
    res.status(200).json({ message: `Instância ${id} ${is_active ? 'ATIVADA' : 'DESATIVADA'}.`, data: updated });
  } catch {
    res.status(404).json({ message: 'Instância não encontrada.' });
  }
});

router.post('/config/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean')
    return res.status(400).json({ message: 'Body deve conter "is_active": true/false' });

  try {
    const updated = await prisma.config.update({
      where: { id: Number(id) },
      data: { is_active }
    });
    res.status(200).json({ message: `Config ${id} ${is_active ? 'ATIVADA' : 'DESATIVADA'}.`, data: updated });
  } catch {
    res.status(404).json({ message: 'Configuração não encontrada.' });
  }
});

router.post('/license/:key/status', async (req, res) => {
  const { key } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean')
    return res.status(400).json({ message: 'Body deve conter "is_active": true/false' });

  try {
    const updated = await prisma.license.update({
      where: { license_key: key },
      data: { is_active }
    });
    res.status(200).json({ message: `Licença ${key} ${is_active ? 'ATIVADA' : 'DESATIVADA'}.`, data: updated });
  } catch {
    res.status(404).json({ message: 'Licença não encontrada.' });
  }
});

export default router;
