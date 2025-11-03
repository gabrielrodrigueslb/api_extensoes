import express from 'express';
import { postCreateConfig } from '../controllers/configController.js';

const router = express.Router();

router.post('/create', postCreateConfig);

export default router;
