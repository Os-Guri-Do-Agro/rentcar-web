# 🚀 Guia Definitivo de Integração Frontend - JL Rent Car

Fala dev front-end! Este documento consolida **TODAS** as novas funcionalidades, rotas e payloads que entregamos no back-end (desde o banner do blog até as mensagens parametrizadas e logs do WhatsApp). Siga este guia para plugar a UI.

---

## 1. Módulo de Blog / Artigos

O blog agora suporta uma imagem de capa/banner separada do conteúdo padrão.

- **Ao criar/editar artigo:** Envie o arquivo da imagem (multipart) ou a URL no campo `banner_url` na requisição de criação/atualização de postagem (`/blog`).
- Isso permite que o layout do card no front tenha uma foto de alta qualidade destacada.

---

## 2. Fluxo de Cadastro e Confirmação de E-mail

O registro de usuário agora conta com um bloqueio rígido e seguro baseando-se na confirmação de e-mail.

- **Cadastro Normal (`POST /auth/register`):** O usuário será criado, mas iniciará com a conta **inativa**. Um e-mail será disparado pelo Supabase com o link/token de confirmação.
- **Tela de Confirmação:** Caso o link do e-mail caia no seu front (ex: `/auth/confirm`), você deve pegar o hash/token da URL e bater na rota:
  - **`POST /auth/confirmar-email`**
  - **Body:** `{ "token_hash": "string_do_token_aqui" }`
  - **Sucesso:** Redirecione o usuário para o `/login` com um toast de sucesso.
- **Login Não-Confirmado:**
  - Se um usuário tentar fazer login sem ter validado o e-mail, o endpoint `POST /auth/login` retornará um erro `400 Bad Request` com a mensagem: _"Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada."_
- **Reenviar E-mail de Confirmação:**
  - **`POST /auth/reenviar-confirmacao`**
  - **Body:** `{ "email": "email_do_usuario" }`

---

## 3. Reservas para Visitantes (Guest) & Vínculo Mágico

Usuários agora podem alugar carros sem possuir uma conta de login prévia.

- **Nova Rota Exclusiva:** **`POST /reservas/guest`**
  - **Payload Obrigatório (JSON):** Os dados normais da reserva (`carro_id`, `data_retirada`, etc) **+** os dados do cliente soltos na raiz:
    - `"cliente_nome": "João"`
    - `"cliente_email": "joao@email.com"`
    - `"cliente_telefone": "11999999999"`
    - `"cliente_cnh": "123456789"`
- **Novos Campos Obrigatórios Globais:** Em TODAS as rotas de criar reserva (logado ou guest), agora você deve enviar **`hora_retirada`** e **`hora_devolucao`** (como strings literais, ex: `"14:00"`). Isso mata de vez qualquer bug de Fuso Horário UTC.
- 🪄 **Vínculo Mágico (Automático):** Quando um cliente que fez reservas como "Visitante" (Guest) for criar seu cadastro real ou entrar pela primeira vez, o servidor **automaticamente** vai transferir todas as reservas antigas para o `usuario_id` dele, desde que o e-mail do cadastro seja idêntico ao `cliente_email` usado na reserva. Você do front não precisa fazer nada!

---

## 4. Gestão de Templates de E-mail / WhatsApp (Painel Admin)

_ATENÇÃO ADMIN: Aqui está o controle total sobre os textos e mensagens que o cliente recebe!_

O administrador pode gerenciar **todos** os corpos de e-mail e texto direto pelas rotas HTTP abaixo. Os textos formatados nestes endpoints ditam o que é enviado para o E-mail de E-mail o sistema loga no WhatsApp.

- **`GET /email-templates`**: Lista todos os templates criados no banco.
- **`GET /email-templates/:tipo`**: Exibe um template específico.
- **`PUT /email-templates/:tipo`**: Cria ou Edita um template.
  - **Payload:**
    ```json
    {
      "assunto": "Sua Reserva foi Avaliada e Aceita!",
      "corpo": "<h2>Olá, {{nome_cliente}}!</h2><p>Sua reserva do <strong>{{nome_carro}}</strong> foi aprovada. Atente-se ao horário: <strong>{{hora_retirada}}</strong></p>"
    }
    ```

### Chaves de Templates Esperadas pelo Back-end (`:tipo`)

Sua interface deve permitir o Admin editar as seguintes chaves (`tipo`):

1. `reserva_criada`
2. `reserva_aceita`
3. `reserva_confirmada`
4. `reserva_cancelada`
5. `reserva_rejeitada`
6. `envio_documentos`

### Variáveis Dinâmicas Disponíveis

O Admin pode escrever o texto e colocar chaves entre chaves duplas `{{ }}` que o back-end vai injetar os valores reais no momento do disparo:

- `{{nome_cliente}}`
- `{{nome_carro}}`
- `{{data_retirada}}` e `{{hora_retirada}}`
- `{{data_devolucao}}` e `{{hora_devolucao}}`
- `{{valor_total}}`

---

## 5. Gatilhos Automáticos (E-mail & WhatsApp)

Ao mudar o status da reserva no admin, o backend aciona as notificações em cadeia de E-mail E WhatsApp!

- **Aprovar Reserva:** `PATCH /reservas/:id/status` com `{"status": "aceita"}`
  - Dispara E-mail / WhatsApp alertando os novos horários aceitos.
- **Confirmar Reserva:** `POST /reservas/:id/confirm`
- **Rejeitar Reserva:** `POST /reservas/:id/reject`
  - Enviar Body com `{"motivo": "Veículo não disponível"}` para injetar no texto de cancelamento do cliente.
- **Cancelamento pelo User:** `PATCH /reservas/:id/cancel`

---

## 6. Upload de Fotos (Ilimitadas) e Documentos

Existem limites e tratativas para mídias fotográficas na vistoria vs documentos restritos:

### Fotos de Retirada/Devolução (S/ Limite)

- **Rota:** `POST /reservas/:id/fotos?tipo=retirada` (ou `tipo=devolucao`)
- **Tipo:** `multipart/form-data`
- Pode encher de PDF e Imagem. Não há limite em quantidade.
- **Listar Fotos:** `GET /reservas/:id/fotos` traz a galeria do álbum.

### O "Botão Send" (Confirmar Envio De Documentos por Email)

Após o cliente ou admin anexarem seus 3 documentos de contrato:

- **`POST /reservas/:id/confirmar-envio`**
- **O que faz:** Varre o banco em `reserva_documentos`, capta todos os anexos, cria um pacote Base64 e **atira** no e-mail do cliente a cópia digital da assinatura usando o template `envio_documentos`. Ao final, seta na reserva que os documentos foram despachados.

---

## 7. Configurações Dinâmicas (Admin Configs)

Chega de reiniciar container ou derrubar o servidor para atualizar token ou zap!

Caso você tenha uma tela de Configurações no Painel:
Esses valores são baseados na tabela `admin_configs`. Você deve utilizar o seu endpoint de CRUD de configurações para editar as chaves:

- **`telefone_conexao`**: Nome da instância do Evolution API para disparar as mensagens automáticas. (Trocando essa chave pelo DB, novas leituras do WhatsApp instantaneamente passam a usar a sessão nova).
- **`numero_whatsapp_admin`**: O número de telefone do Dono/Admin que receberá alerta de "Nova Reserva Efetuada! Valor X".
- **`api_key_email`**: A secret Key do SendGrid gerada no dashboard online.
- **`email_admin`**: E-mail remetente (ex: contato@jlrentcar.com) autenticado no SendGrid.
