import express from 'express';
import { postCreateInstance } from '../controllers/instanceController.js';

const router = express.Router();

router.post('/create', postCreateInstance);

export default router;
