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

Os IDs oficiais de produção do **EixoVerde (Android)** já estão configurados:
- **App ID (`AndroidManifest.xml`):** `ca-app-pub-6690812959868851~6422068887`
- **Banner Ad Unit ID (GitHub Actions Secret `VITE_ADMOB_ANDROID_BANNER_ID`):** `ca-app-pub-6690812959868851/5679832857` *(em builds locais sem essa variável, `monetizationBridge.ts` usa automaticamente o ID oficial de teste do Google com `isTesting: true`)*.

> **Regra de proteção da conta AdMob:** nunca clique em anúncios reais ao testar no seu próprio celular; cadastre o aparelho em **AdMob → Configurações → Dispositivos de teste** para exibir anúncios de teste com segurança.

Checklist pós-publicação na Google Play:

1. Acesse [https://admob.google.com](https://admob.google.com) utilizando sua conta única de Publisher Google (`pub-6690812959868851`).
2. Confirme que o arquivo público [`public/app-ads.txt`](../public/app-ads.txt) já está acessível em `https://eixoverde.com/app-ads.txt` e que o site do desenvolvedor na Play Console aponta para `https://eixoverde.com`.
3. Após publicar o app na Google Play, abra **Apps → EixoVerde (Android) → Configurações do app** no AdMob e vincule o pacote `br.com.eixoverde.app` à loja.
4. *(Opcional futuro para iOS)* Cadastre `VITE_ADMOB_IOS_BANNER_ID` nos secrets do GitHub Actions quando publicar na Apple App Store.

> **Importante:** O workflow `.github/workflows/mobile-build.yml` injeta automaticamente `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAPTILER_KEY` e `VITE_ADMOB_ANDROID_BANNER_ID` a partir dos **Repository Secrets** durante o build mobile (`npm run cap:sync`) para gerar o `.aab` pronto para upload no Play Console.

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
