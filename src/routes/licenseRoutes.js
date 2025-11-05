import express from 'express';
import {
  postActiveLicense,
  postCreateLicense,
  postDeactivateLicense,
  postReactivateLicense,
  getLicenseInfoByKey,
  getListLicenses,
  deleteLicenseByKey,
} from '../controllers/licenseController.js';

const router = express.Router();

// --- ROTAS POST ---
// Ativa uma licença para uma máquina específica
router.post('/activate', postActiveLicense);

// Cria uma nova licença (baseado na instância e config)
router.post('/create', postCreateLicense);

// Desativa uma licença (body: { licenseKey })
router.post('/deactivate', postDeactivateLicense);

// Reativa uma licença (body: { licenseKey })
router.post('/reactivate', postReactivateLicense);

// --- ROTAS GET ---
// Lista todas as licenças do sistema
router.get('/list', getListLicenses);

// Obtém informações de uma licença específica (pela URL)
router.get('/info/:key', getLicenseInfoByKey);

// --- ROTA DELETE ---
// Deleta uma licença permanentemente (pela URL)
router.delete('/delete/:key', deleteLicenseByKey);

export default router;