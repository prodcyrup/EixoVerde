# Guia de Monetização — Google AdMob & EixoVerde VIP (R$ 9,90 Vitalício)

O **EixoVerde** adota um modelo transparente, não intrusivo e 100% compatível com a **Google Play Store**:

- **Versão Gratuita (com Banner Compacto):** todas as funções essenciais — navegação 3D, orientação por voz PT-BR, malha cicloviária das 27 capitais, alertas comunitários, modo livre e busca de endereços — permanecem **100% gratuitas**. Um banner discreto (`~50px`) é exibido **somente** nas telas de busca (*Explorar*) e prévia de rota (*Planejamento*) e **nunca** durante a navegação ativa.
- **EixoVerde VIP (`eixoverde_vip_lifetime` — R$ 9,90, pagamento único vitalício):** remove todos os anúncios para sempre e libera:
  1. **Zero Anúncios** em todos os painéis;
  2. **Cache Offline ilimitado** nas 27 capitais do Brasil (grátis: 1 capital offline por vez);
  3. **Garagem Personalizada ilimitada** (grátis: 1 veículo customizado + todo o catálogo padrão);
  4. **Exportação GPX 1.1 ilimitada** (grátis: até 3 exportações);
  5. **Selo Dourado VIP** na conta e na comunidade.

---

## Parte 1 — Configurar o Google AdMob (Android)

Por segurança, o aplicativo já vem configurado com os **IDs oficiais de teste do Google AdMob** (`ca-app-pub-3940256099942544~3347511713` no `AndroidManifest.xml` e `ca-app-pub-3940256099942544/6300978111` no `monetizationBridge.ts`). Isso impede qualquer bloqueio por cliques inválidos durante o desenvolvimento e testes locais.

Quando sua conta Google Play Developer for aprovada e você quiser ativar anúncios reais:

1. Acesse [https://admob.google.com](https://admob.google.com) com a mesma conta Google do Play Console.
2. Clique em **Apps → Adicionar app**:
   - Plataforma: **Android**
   - O app já está publicado na Google Play? Selecione *Sim* (após publicar) ou *Não* (e vincule depois usando o package ID `br.com.eixoverde.app`).
3. Copie o **ID do App (App ID)** no formato `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`.
4. Atualize a linha `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" ... />` em [`android/app/src/main/AndroidManifest.xml`](../android/app/src/main/AndroidManifest.xml) substituindo o ID de teste pelo seu **App ID de produção**.
5. No painel do AdMob, abra **Blocos de anúncios (Ad units) → Adicionar bloco de anúncios → Banner** (ex.: `EixoVerde Banner Explorar`).
6. Copie o **ID do Bloco de Anúncios (Ad Unit ID)** no formato `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`.
7. Cadastre o segredo no GitHub Actions (**Settings → Secrets and variables → Actions**) ou no `.env.local`:
   - `VITE_ADMOB_ANDROID_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`
   - *(Opcional futuro para iOS)* `VITE_ADMOB_IOS_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWW`

> **Importante:** O workflow `.github/workflows/mobile-build.yml` injeta automaticamente `VITE_ADMOB_ANDROID_BANNER_ID` durante o build mobile (`npm run cap:sync`) para gerar o `.aab` pronto para upload no Play Console.

---

## Parte 2 — Configurar o Produto Único VIP no Google Play Console (R$ 9,90)

1. No **Google Play Console**, abra o app **EixoVerde** (`br.com.eixoverde.app`).
2. No menu lateral, vá em **Monetizar com o Google Play → Produtos → Produtos no app (In-app products)**.
3. Clique em **Criar produto** e preencha exatamente:
   - **ID do produto (SKU):** `eixoverde_vip_lifetime`
   - **Nome:** `EixoVerde VIP Vitalício`
   - **Descrição:** `Pagamento único vitalício: remove todos os anúncios, libera cache offline nas 27 capitais, garagem personalizada ilimitada e exportação GPX ilimitada.`
   - **Preço padrão:** `R$ 9,90` *(preço de lançamento — você pode ajustar no futuro a qualquer momento pelo Play Console)*
4. Salve e clique em **Ativar**.
5. Em **Conteúdo do app → Anúncios**, marque **"Sim, meu app contém anúncios"**.
6. Em **Segurança dos dados (Data Safety)**, certifique-se de declarar os identificadores técnicos do Google AdMob / Google Play Billing conforme descrito na nossa [Política de Privacidade pública](../public/privacidade.html).

---

## Parte 3 — Ativar Sincronização VIP na Nuvem (Supabase)

Para que usuários que desbloquearam o **EixoVerde VIP** mantenham o benefício em todos os seus aparelhos ao fazer login (e possam usar o botão **Restaurar compra**):

1. No painel do Supabase, abra **SQL Editor → New query**.
2. Execute o script idempotente [`supabase/migrations/20261121000005_eixoverde_phase7_vip.sql`](../supabase/migrations/20261121000005_eixoverde_phase7_vip.sql).
3. Esse script adiciona as colunas `is_premium`, `premium_sku`, `premium_platform` e `premium_purchased_at` à tabela `public.profiles` e cria a função RPC segura `public.activate_vip_entitlement(...)`.

---

## Política de Segurança Viária para Anúncios

- **Regra absoluta:** `AdBanner.tsx` e `useAppStore.ts` garantem que `hideNativeAdBanner()` seja chamado sempre que o usuário inicia a navegação guiada (`startNavigation`) ou o **Modo Livre** (`startFreeRide`), e o componente retorna `null` quando `mode === 'navigate'` ou `isPremium === true`.
- Nenhum anúncio intersticial em tela cheia interrompe o trajeto ou bloqueia alertas sonoros de travessia.
