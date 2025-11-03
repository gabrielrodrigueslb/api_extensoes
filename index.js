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
app.use(cors());
app.use(express.json());

app.use('/v1/license', licenseRoutes);
app.use('/v1/config', configRoutes);
app.use('/v1/instance', instanceRoutes);
app.use('/admin', adminRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});