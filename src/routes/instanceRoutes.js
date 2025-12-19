import express from 'express';
import { getListInstances, postCreateInstance } from '../controllers/instanceController.js';

const router = express.Router();

router.post('/create', postCreateInstance);
router.get('/list', getListInstances);

export default router;
