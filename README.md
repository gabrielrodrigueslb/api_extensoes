# License Server Backend

Este é o backend responsável pelo gerenciamento de licenças, instâncias e configurações para extensões de integrações. O sistema utiliza JWT para gerar chaves de licença que podem ser bloqueadas para máquinas específicas (*machine locking*), garantindo controle sobre onde as integrações estão sendo utilizadas.

## 🚀 Tecnologias

  * [Node.js](https://nodejs.org/) (Backend Runtime)
  * [Express](https://expressjs.com/) (Web Framework)
  * [Prisma ORM](https://www.prisma.io/) (Database ORM)
  * [PostgreSQL](https://www.postgresql.org/) (Banco de dados)
  * [JSON Web Token (JWT)](https://jwt.io/) (Geração de chaves de licença segura)

## ⚙️ Pré-requisitos

  * Node.js (versão 18 ou superior recomendada devido ao uso de ES Modules e Prisma 6).
  * PostgreSQL rodando localmente ou em um servidor acessível.

## 🛠️ Instalação e Configuração

1.  **Clone o repositório e instale as dependências:**

    ```bash
    npm install
    ```

2.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto usando o modelo abaixo. Ajuste a `DATABASE_URL` com suas credenciais do Postgres.

    ```env
    PORT=3001
    # Substitua as credenciais abaixo pelas do seu banco PostgreSQL
    DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/NOME_DO_BANCO?schema=public"
    JWT_SECRET="SuaChaveSecretaSuperSeguraParaAssinarOsTokens"
    ```

3.  **Configuração do Banco de Dados (Prisma):**
    Execute as migrações para criar as tabelas (`instancias`, `configs`, `licenses`) no seu banco de dados.

    ```bash
    npx prisma migrate dev --name init
    # Ou se preferir apenas sincronizar sem criar histórico de migração:
    # npx prisma db push
    ```

4.  **Inicie o Servidor:**

    ```bash
    npm start
    ```

    [cite\_start]O servidor iniciará por padrão na porta `3001` (ou a definida no `.env`)[cite: 4].

-----

## 🧠 Fluxo de Funcionamento

O sistema opera em três camadas principais:

1.  **Instância**: Representa um cliente ou uma loja (ex: "Loja do João"). [cite\_start]É identificada unicamente por sua `instance_url`[cite: 2, 4].
2.  **Configuração**: As definições específicas de uma integração para aquela instância. [cite\_start]Exige um JSON contendo ao menos `dbName` e `clientToken`[cite: 7].
3.  **Licença**: Uma chave JWT gerada a partir de uma Instância + Configuração. Esta é a chave que o cliente final usa.
      * [cite\_start]Ao ser usada pela primeira vez, a licença é **ativada** e vinculada ao ID da máquina (`machineId`) que a solicitou[cite: 5].
      * [cite\_start]Tentativas futuras de uso com um `machineId` diferente serão bloqueadas[cite: 5].

-----

## 📚 Documentação da API

### 🏢 Instâncias (`/v1/instance`)

Rotas para gerenciar os clientes/lojas.

#### Criar Nova Instância

Cria um novo registro de cliente no sistema.

  * **URL:** `/v1/instance/create`
  * **Método:** `POST`
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "client_name": "Nome do Cliente",
      "instance_Url": "https://loja-cliente.com.br"
    }
    ```
  * **Resposta de Sucesso (200):**
    ```json
    {
      "status": 200,
      "success": true,
      "instance": { ... },
      "message": "Instância criada com sucesso."
    }
    ```

-----

### ⚙️ Configurações (`/v1/config`)

Rotas para definir parâmetros de integração para uma instância.

#### Criar Configuração

Vincula um JSON de configuração a uma URL de instância existente.

  * **URL:** `/v1/config/create`
  * **Método:** `POST`
  * [cite\_start]**Requisito:** O objeto `config_data` **deve** conter `dbName` e `clientToken`[cite: 7].
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "config_name": "Integração Vendas",
      "instance_url": "https://loja-cliente.com.br",
      "config_data": {
        "dbName": "banco_vendas_cliente",
        "clientToken": "token_interno_do_cliente",
        "outroParametro": "valor opcional"
      }
    }
    ```

-----

### 🔑 Licenças (`/v1/license`)

Rotas para geração, ativação e gerenciamento das chaves de acesso.

#### 1\. Criar Licença (Gerar Chave)

Gera um JWT válido por 1 ano para uma configuração específica.

  * **URL:** `/v1/license/create`
  * **Método:** `POST`
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "instance_url": "https://loja-cliente.com.br",
      "config_id": 1
    }
    ```
  * **Resposta (200):** Retorna o objeto da licença criada, onde o campo `license_key` é o token que deve ser enviado ao cliente.

#### 2\. Ativar Licença (Machine Lock)

Deve ser chamada pela aplicação cliente na primeira execução. Vincula a licença ao hardware atual.

  * **URL:** `/v1/license/activate`
  * **Método:** `POST`
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "licenseKey": "EYJhbVcQiOEZn...",
      "machineId": "ID-UNICO-DA-MAQUINA-CLIENTE"
    }
    ```
  * **Erros Comuns:**
      * [cite\_start]`403`: Licença, instância ou configuração suspensa/inativa[cite: 5].
      * [cite\_start]`409`: Licença já em uso em outro computador[cite: 5].

#### 3\. Gerenciamento de Licenças

| Ação | Método | URL | Corpo (JSON) | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Listar Tudo** | `GET` | `/v1/license/list` | N/A | Retorna todas as licenças cadastradas. |
| **Info da Licença** | `GET` | `/v1/license/info/:key` | N/A | Retorna detalhes de uma licença específica passada na URL. |
| **Desativar** | `POST` | `/v1/license/deactivate`| `{ "license_key": "..." }` | Suspende temporariamente uma licença. |
| **Reativar** | `POST` | `/v1/license/reactivate`| `{ "license_key": "..." }` | Reativa uma licença suspensa. |
| **Deletar** | `DELETE`| `/v1/license/delete/:key` | N/A | Remove permanentemente uma licença do banco. |

> **Nota:** Observe que as rotas de *ativar* usam `licenseKey` (camelCase) no corpo da requisição, enquanto *desativar/reativar* usam `license_key` (snake\_case).

-----

## 🗃️ Estrutura do Banco de Dados

Principais relacionamentos definidos no `schema.prisma`:

  * `instancias` 1 ↔ N `configs` (Uma instância pode ter várias configurações)
  * `configs` 1 ↔ N `licenses` (Uma configuração pode ter várias licenças geradas para ela)
  * `instancias` 1 ↔ N `licenses` (Relacionamento direto para facilitar consultas)
