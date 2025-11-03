import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ROTA DE ATIVAÇÃO DE LICENÇA
 * [POST] /v1/activate
 */
app.post('/v1/activate', async (req, res) => {
  const { licenseKey, machineId } = req.body;

  if (!licenseKey || !machineId) {
    return res.status(400).json({ 
      success: false, 
      message: "Chave de licença (licenseKey) e ID da máquina (machineId) são obrigatórios." 
    });
  }

  try {
    // 1. JOIN triplo para buscar os dados de todas as tabelas
    const queryText = `
      SELECT 
        L.license_key, L.activated_machine_id, L.is_active AS license_ativa,
        C.config_data, C.is_active AS config_ativa,
        I.instance_url, I.is_active AS instancia_ativa -- *** MUDANÇA AQUI ***
      FROM licenses L
      JOIN configs C ON L.config_id = C.id
      JOIN instancias I ON C.instancia_id = I.id
      WHERE L.license_key = $1
    `;
    
    const { rows } = await db.query(queryText, [licenseKey]);

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Chave de licença inválida." 
      });
    }

    const license = rows[0];

    // 2. Verificações de acesso (3 níveis)
    if (!license.instancia_ativa) {
      return res.status(403).json({ 
        success: false, 
        message: "O acesso para esta empresa foi suspenso." 
      });
    }
    if (!license.config_ativa) {
      return res.status(403).json({ 
        success: false, 
        message: "O acesso para esta loja/banco de dados foi suspenso." 
      });
    }
    if (!license.license_ativa) {
      return res.status(403).json({ 
        success: false, 
        message: "Esta chave de licença foi desativada." 
      });
    }

    // *** MUDANÇA APLICADA AQUI ***
    // 3. Monta o objeto de configuração final para a extensão
    const configParcial = license.config_data; // Vem do JSON: { dbName, clientToken }
    const finalConfig = {
      instanceUrl: license.instance_url, // Vem da tabela 'instancias'
      dbName: configParcial.dbName,
      clientToken: configParcial.clientToken
    };

    // 4. Lógica de ativação da máquina
    if (license.activated_machine_id === null) {
      // Primeira ativação
      const updateQuery = 'UPDATE licenses SET activated_machine_id = $1 WHERE license_key = $2';
      await db.query(updateQuery, [machineId, licenseKey]);
      
      console.log(`Licença ${licenseKey} ativada pela primeira vez na máquina ${machineId}`);
      return res.status(200).json({
        success: true,
        config: finalConfig // Retorna o objeto montado
      });

    } else if (license.activated_machine_id === machineId) {
      // Re-validação da mesma máquina
      console.log(`Licença ${licenseKey} re-validada para a máquina ${machineId}`);
      return res.status(200).json({
        success: true,
        config: finalConfig // Retorna o objeto montado
      });

    } else {
      // Licença em uso por outra máquina
      console.warn(`Tentativa de ativação da licença ${licenseKey} na máquina ${machineId}, mas já está em uso pela máquina ${license.activated_machine_id}`);
      return res.status(409).json({ 
        success: false,
        message: "Esta licença já está em uso em outro computador."
      });
    }

  } catch (err) {
    console.error('Erro na consulta ao banco de dados:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor.'
    });
  }
});

// --- ROTAS DE ADMIN ---
// (Não precisam de nenhuma alteração, continuam funcionando)

/**
 * [ADMIN] Ativa/Inativa uma INSTÂNCIA INTEIRA (Empresa)
 * [POST] /admin/instancia/:id/status
 */
app.post('/admin/instancia/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') return res.status(400).json({ message: 'Body deve conter "is_active": true/false' });
  try {
    const { rows } = await db.query('UPDATE instancias SET is_active = $1 WHERE id = $2 RETURNING *', [is_active, id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Instância não encontrada.' });
    res.status(200).json({ message: `Instância ${id} ${is_active ? 'ATIVADA' : 'DESATIVADA'}.`, data: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar instância.', error: err.message });
  }
});

/**
 * [ADMIN] Ativa/Inativa uma CONFIG (Loja / Banco de Dados)
 * [POST] /admin/config/:id/status
 */
app.post('/admin/config/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') return res.status(400).json({ message: 'Body deve conter "is_active": true/false' });
  try {
    const { rows } = await db.query('UPDATE configs SET is_active = $1 WHERE id = $2 RETURNING *', [is_active, id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Configuração não encontrada.' });
    res.status(200).json({ message: `Config ${id} ${is_active ? 'ATIVADA' : 'DESATIVADA'}.`, data: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar config.', error: err.message });
  }
});

/**
 * [ADMIN] Ativa/Inativa uma LICENÇA (Chave / Máquina)
 * [POST] /admin/license/:key/status
 */
app.post('/admin/license/:key/status', async (req, res) => {
  const { key } = req.params;
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') return res.status(400).json({ message: 'Body deve conter "is_active": true/false' });
  try {
    const { rows } = await db.query('UPDATE licenses SET is_active = $1 WHERE license_key = $2 RETURNING *', [is_active, key]);
    if (rows.length === 0) return res.status(404).json({ message: 'Licença não encontrada.' });
    res.status(200).json({ message: `Licença ${key} ${is_active ? 'ATIVADA' : 'DESATIVADA'}.`, data: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar licença.', error: err.message });
  }
});


// Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de Licenças rodando na porta ${PORT}`);
});