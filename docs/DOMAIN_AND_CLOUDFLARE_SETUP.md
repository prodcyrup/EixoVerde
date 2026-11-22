# Guia de Domínio, Cloudflare Pages & Prontidão de Loja — `eixoverde.com` (Fase 8)

O **EixoVerde** publica um único build unificado (`npm run build` → `dist/`) otimizado para **Cloudflare Pages** no domínio oficial **`https://eixoverde.com`**:

| Rota Pública | Conteúdo |
| :--- | :--- |
| **`https://eixoverde.com/`** | Site oficial & Landing Page (`site/index.html`, tema adaptativo Claro/Escuro sincronizado com o app) |
| **`https://eixoverde.com/app/`** | Web PWA completo (MapLibre GL JS, 27 capitais, Service Worker isolado em `scope: '/app/'`) |
| **`https://eixoverde.com/privacidade.html`** | Política de Privacidade & Termos de Uso (LGPD) |
| **`https://eixoverde.com/exclusao-conta.html`** | Página pública de Exclusão de Conta e Dados (Google Play Data Safety) |
| **`https://eixoverde.com/app-ads.txt`** | Verificação oficial do Google AdMob (`pub-6690812959868851`) |
| **`https://eixoverde.com/robots.txt`** & **`/sitemap.xml`** | Indexação SEO |

> Links compartilháveis na raiz (`https://eixoverde.com/?share=...`, `?city=curitiba` ou retornos OAuth) redirecionam automaticamente para `https://eixoverde.com/app/...` preservando os parâmetros.

---

## 1. Publicar `eixoverde.com` no Cloudflare Pages (~2 minutos)

1. No painel da **Cloudflare**, acesse **Workers & Pages → Create → Pages → Connect to Git**.
2. Selecione o repositório **`prodcyrup/EixoVerde`** (branch de produção: `main`).
3. Configure o build exatamente assim:
   - **Framework preset:** `None` (ou `Vite`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Em **Environment variables (Production e Preview)**, adicione as chaves públicas já usadas no projeto:
   - `NODE_VERSION` = `22`
   - `VITE_SUPABASE_URL` = `https://tuocwnjnkihchlxxqmgi.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = *(sua chave pública `sb_publishable_...`)*
   - `VITE_MAPTILER_KEY` = *(sua chave MapTiler Cloud)*
5. Clique em **Save and Deploy**.
6. Após o primeiro deploy concluir, abra a aba **Custom domains** do projeto Pages e adicione:
   - `eixoverde.com`
   - `www.eixoverde.com` *(o arquivo `public/_redirects` redireciona automaticamente `www.eixoverde.com/*` → `https://eixoverde.com/*` com HTTP 301)*

> Os cabeçalhos de segurança (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), cache otimizado de GeoJSON/assets e `Content-Type: text/plain` para `/app-ads.txt` já são aplicados automaticamente via [`public/_headers`](../public/_headers).

---

## 2. E-mail Oficial (`contato@eixoverde.com`) via Cloudflare Email Routing

1. No painel da **Cloudflare** → **Email → Email Routing**, confirme que o roteamento está **Ativo** (registros `MX`, `DKIM` e `SPF` da Cloudflare).
2. Em **Destination addresses**, adicione o Gmail de destino (ex.: `prodcyrup@gmail.com`) e clique no link de verificação enviado para a caixa de entrada.
3. Em **Routing rules → Custom addresses → Create address**, crie:
   - **Custom address:** `contato@eixoverde.com`
   - **Action:** `Send to an email` → selecione o Gmail verificado.

---

## 3. Atualizar URLs no Supabase Auth (`tuocwnjnkihchlxxqmgi`)

No **Supabase Dashboard** → **Authentication → URL Configuration**:

- **Site URL:**
  ```text
  https://eixoverde.com/app/
  ```
- **Redirect URLs** (mantenha todas abaixo para Web + App Nativo Android/iOS + Desenvolvimento):
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

---

## 4. Atualizar Origens Autorizadas no Google Cloud Console (OAuth) & MapTiler

### Google Cloud Console (OAuth Client ID — Web application)
Em **APIs & Services → Credentials → OAuth 2.0 Client IDs**:
- Em **Authorized JavaScript origins**, adicione:
  ```text
  https://eixoverde.com
  ```
- Em **Authorized redirect URIs**, mantenha a callback do Supabase:
  ```text
  https://tuocwnjnkihchlxxqmgi.supabase.co/auth/v1/callback
  ```

### MapTiler Cloud (Estilos Claro/Escuro/Satélite)
Em [https://cloud.maptiler.com/](https://cloud.maptiler.com/) → **Account → Keys → Allowed HTTP Origins**, adicione (uma por linha):
```text
eixoverde.com
*.pages.dev
prodcyrup.github.io
localhost
```

---

## 5. URLs Finais para Google Play Console & Google AdMob

Quando a verificação da conta Google Play Console finalizar, preencha os campos oficiais com o seu domínio próprio:

| Campo na Loja / AdMob | URL / Valor Oficial |
| :--- | :--- |
| **Site do aplicativo (Developer Website)** | `https://eixoverde.com` |
| **E-mail de suporte / contato** | `contato@eixoverde.com` |
| **Política de Privacidade (LGPD)** | `https://eixoverde.com/privacidade.html` |
| **URL de Exclusão de Conta (Data Safety)** | `https://eixoverde.com/exclusao-conta.html` |
| **Verificação `app-ads.txt` (Google AdMob)** | `https://eixoverde.com/app-ads.txt` (`pub-6690812959868851`) |
| **Package ID (Android)** | `br.com.eixoverde.app` |
| **SKU Vitalício (In-app product)** | `eixoverde_vip_lifetime` (`R$ 9,90`) |
