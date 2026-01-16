import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import licenseRoutes from './src/routes/licenseRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import configRoutes from './src/routes/configRoutes.js';
import instanceRoutes from './src/routes/instanceRoutes.js';

dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
const allowedOrigins = [
  'http://localhost:5173', // front dev
  'http://localhost:3000',
  'https://unico-integra.vercel.app' // produção
];

app.use(cors({
  origin:"*",
 /*  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como Postman ou Apps Mobile)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS deste site não permite acesso desta origem.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }, */
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));
app.use(express.json());

app.use('/v1/license', licenseRoutes);
app.use('/v1/config', configRoutes);
app.use('/v1/instance', instanceRoutes);
app.use('/admin', adminRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});