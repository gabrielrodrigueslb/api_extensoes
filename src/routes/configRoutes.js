import express from 'express';
import { postCreateConfig } from '../controllers/configController.js';

const router = express.Router();

router.post('/create', postCreateConfig);
router.get('/list', getListConfigs);

export default router;
