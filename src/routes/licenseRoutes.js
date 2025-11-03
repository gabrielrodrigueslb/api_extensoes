import express from 'express';
import { postActiveLicense, postCreateLicense } from '../controllers/licenseController.js';

const router = express.Router();

router.post('/activate', postActiveLicense);
router.post('/create', postCreateLicense);

export default router;
