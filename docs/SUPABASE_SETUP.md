# Guia de Configuração — Supabase Cloud, PostGIS & Proxy ORS (Fase 2)

O **EixoVerde** funciona **100% offline no modo Visitante (Local / IndexedDB)** sem nenhuma chave configurada. Quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão vazias, nenhuma chamada de nuvem é disparada e todas as rotas, locais, veículos personalizados e alertas continuam salvos localmente no dispositivo.

Siga este guia rápido (cerca de 5 minutos) para ativar **Contas na Nuvem**, **Sincronização Offline-First multi-dispositivo**, **Alertas Comunitários com PostGIS** e o **Proxy seguro do OpenRouteService (`ors-proxy`)**.

---

## Passo 1 — Criar Projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard) e clique em **New project**.
2. Escolha um nome (ex.: `eixoverde`), defina uma senha forte para o banco e selecione a região recomendada:
   - **South America (São Paulo) — `sa-east-1`** (menor latência no Brasil).
3. Aguarde a inicialização do projeto (~1–2 minutos).

---

## Passo 2 — Executar a Migração SQL (PostGIS + RLS + RPCs)

1. No painel do Supabase, abra **SQL Editor** → **New query**.
2. Copie todo o conteúdo do arquivo [`supabase/migrations/20261121000001_eixoverde_phase2.sql`](../supabase/migrations/20261121000001_eixoverde_phase2.sql) e cole no editor.
3. Clique em **Run**.
4. *(Fase 3 — Histórico de Trajetos na Nuvem)* Repita os passos 1–3 com o arquivo [`supabase/migrations/20261121000002_eixoverde_phase3_rides.sql`](../supabase/migrations/20261121000002_eixoverde_phase3_rides.sql) para sincronizar o histórico **Meus Trajetos** (`ride_sessions` com PostGIS `LineString` + RLS privado). Caso ainda não tenha rodado esta migração, o app salva seus trajetos normalmente em IndexedDB e sincroniza automaticamente assim que a tabela existir.
5. *(Fase 4 — Comunidade DF, Avaliações 1–5★ & Alertas Realtime)* Repita os passos 1–3 com o arquivo [`supabase/migrations/20261121000003_eixoverde_phase4_community.sql`](../supabase/migrations/20261121000003_eixoverde_phase4_community.sql) para habilitar **Rotas da Comunidade DF** (`community_routes` com PostGIS `LineString` + leitura pública / escrita do autor), **Avaliações 1–5★ com tags de segurança** (`route_ratings` + trigger de média automática) e **Supabase Realtime** em `hazard_reports`.
6. *(Fase 5 — Exclusão de Conta In-App para Google Play Store & Apple App Store)* Repita os passos 1–3 com o arquivo [`supabase/migrations/20261121000004_eixoverde_phase5_account_delete.sql`](../supabase/migrations/20261121000004_eixoverde_phase5_account_delete.sql) para criar a função RPC `public.delete_my_account()` (`SECURITY DEFINER`), permitindo que usuários autenticados excluam permanentemente sua conta e dados na nuvem diretamente dentro do aplicativo.
7. *(Fase 7 — EixoVerde VIP Vitalício na Nuvem)* Repita os passos 1–3 com o arquivo [`supabase/migrations/20261121000005_eixoverde_phase7_vip.sql`](../supabase/migrations/20261121000005_eixoverde_phase7_vip.sql) para adicionar as colunas `is_premium` / `premium_sku` em `public.profiles` e criar a função RPC `public.activate_vip_entitlement(...)`, sincronizando compras VIP entre aparelhos.

O script é **100% idempotente** (pode ser executado novamente sem erro) e cria automaticamente:
- Extensão **PostGIS** no schema `extensions` (compatível com Supabase Cloud).
- Tabelas com **Row Level Security (RLS)** habilitado: `profiles`, `saved_routes`, `saved_places`, `custom_vehicles`, `hazard_reports`, `hazard_confirmations`, `ride_sessions`, `community_routes`, `route_ratings` e `user_preferences`.
- Triggers automáticos de geometria (`LineString` e `Point` SRID 4326), contagem de confirmações de alertas, média de avaliações da comunidade e criação de perfil no cadastro.
- Funções espaciais RPC `get_hazards_in_bounds(...)` (com índice GIST), `confirm_hazard(...)`, `delete_my_account()` e `activate_vip_entitlement(...)`.
- Publicação `supabase_realtime` para atualizações ao vivo de `hazard_reports`.

---

## Passo 3 — Configurar URLs de Autenticação (Magic Link, OAuth & Deep-Link Mobile)

No painel do Supabase, vá em **Authentication → URL Configuration**:

- **Site URL**:
  ```text
  https://eixoverde.com/app/
  ```
- **Redirect URLs** (adicione todas abaixo para Web `eixoverde.com` + Apps Nativos Android/iOS):
  ```text
  https://eixoverde.com/app/
  https://eixoverde.com/app/**
  https://eixoverde.com/
  https://prodcyrup.github.io/EixoVerde/**
  http://localhost:5173/**
  http://127.0.0.1:5173/**
  br.com.eixoverde.app://auth-callback
  capacitor://localhost
  http://localhost
  https://localhost
  ```

Clique em **Save**.

### (Opcional) Ativar Login com Google ("Continuar com Google")
1. No [Google Cloud Console — Credentials](https://console.cloud.google.com/apis/credentials), clique em **Create Credentials → OAuth client ID** (tipo **Web application**).
2. Em **Authorized JavaScript origins**, adicione:
   - `https://eixoverde.com`
   - `https://prodcyrup.github.io`
   - `https://<seu-project-ref>.supabase.co`
3. Em **Authorized redirect URIs**, cole a **Callback URL (for OAuth)** exibida no painel do Supabase em **Authentication → Providers → Google** (formato `https://<seu-project-ref>.supabase.co/auth/v1/callback`).
4. Copie o **Client ID** e o **Client Secret** gerados pelo Google, cole em **Authentication → Providers → Google** no Supabase, ative **Enable Sign in with Google** e clique em **Save**.

---

## Passo 4 — Copiar URL e Chave Pública do Projeto

No painel do Supabase, abra **Project Settings → API** (ou **API Keys**):

1. **`VITE_SUPABASE_URL`**: copie a **Project URL** (ex.: `https://<seu-project-ref>.supabase.co`).
2. **`VITE_SUPABASE_ANON_KEY`**: copie a chave pública do projeto.
   - O EixoVerde aceita **tanto a nova chave Publishable (`sb_publishable_...`) quanto a chave legada `anon` JWT (`eyJ...`)** de forma nativa.

> **Atenção de Segurança:** **NUNCA** utilize a chave `service_role` ou `sb_secret_...` em variáveis `VITE_*` ou secrets do frontend. Use exclusivamente a chave pública (`sb_publishable_...` ou `anon`).

---

## Passo 5 — Publicar a Edge Function `ors-proxy` (Chave ORS 100% no Servidor)

A função [`supabase/functions/ors-proxy/index.ts`](../supabase/functions/ors-proxy/index.ts) protege sua chave da API do OpenRouteService (HeiGIT) no servidor, aplica validação estrita de perfis/coordenadas e limita requisições por usuário/IP.

Execute os comandos abaixo na raiz do repositório:

```bash
npx supabase login
npx supabase link --project-ref <SEU_PROJECT_REF>
npx supabase secrets set ORS_API_KEY=<SUA_CHAVE_HEIGIT_ORS>
npx supabase functions deploy ors-proxy --no-verify-jwt
```

> **Por que `--no-verify-jwt` (e `verify_jwt = false` em `supabase/config.toml`)?**
> Permite que o `ors-proxy` aceite chamadas tanto com chaves modernas `sb_publishable_...` quanto no modo Visitante e com usuários autenticados, enquanto sua `ORS_API_KEY` permanece 100% oculta no servidor e protegida por rate-limit.

---

## Passo 6 — Adicionar os 2 Secrets no GitHub Actions

Acesse **Settings → Secrets and variables → Actions** do repositório:
`https://github.com/prodcyrup/EixoVerde/settings/secrets/actions`

Clique em **New repository secret** e cadastre:

| Secret | Valor | Obrigatório? |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://<seu-project-ref>.supabase.co` | Sim (para Fase 2) |
| `VITE_SUPABASE_ANON_KEY` | Chave `sb_publishable_...` **ou** `anon` JWT (`eyJ...`) | Sim (para Fase 2) |
| `VITE_MAPTILER_KEY` | Chave do MapTiler Cloud (estilos Light/Dark/Satélite) | Opcional |
| `VITE_ORS_KEY` | Chave direta OpenRouteService (pode ser removida após ativar o `ors-proxy`) | Opcional |
| `VITE_ADMOB_ANDROID_BANNER_ID` | ID do bloco de anúncio Banner do Google AdMob Android | Opcional (Fase 7) |

---

## Passo 7 — Publicar & Verificar no GitHub Pages

1. No GitHub, abra **Actions → Deploy EixoVerde to GitHub Pages** e clique em **Run workflow** (ou faça um novo push na branch `main`).
2. Aguarde a conclusão do deploy e abra [https://prodcyrup.github.io/EixoVerde/](https://prodcyrup.github.io/EixoVerde/).
3. Abra o menu lateral (**☰**) e verifique:
   - O card de **Conta & Sincronização** exibe o botão **Entrar ou Criar Conta** (e, após login, o status de sincronização em nuvem).
   - O card **EixoVerde VIP** permite ativar e restaurar o benefício vitalício sincronizado com a conta.

### Desenvolvimento Local (`.env.local`)

Para testar localmente com `npm run dev`, crie um arquivo `.env.local` na raiz do projeto (ignorado pelo Git):

```env
VITE_SUPABASE_URL=https://<seu-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
# Opcional:
# VITE_MAPTILER_KEY=
```
