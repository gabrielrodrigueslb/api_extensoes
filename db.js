import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('connect', () => {
  console.log('Conectado ao banco de dados PostgreSQL!');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente do pool', err);
  process.exit(-1);
});

// Exportamos uma função de query para usar em nossas rotas
export default {
  query: (text, params) => pool.query(text, params),
};