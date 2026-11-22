# EixoVerde — Navegação & Ciclovias (DF → Brasil)

Aplicativo web progressivo (PWA) de navegação inteligente, planejamento seguro em ciclovias e telemetria personalizada para **patinetes elétricos, e-bikes, bicicletas e micromobilidade**.

## Principais Recursos (Fases 1–7 • 27 Capitais do Brasil, Web PWA, Google Play & App Store)
- **Expansão Nacional — Todas as 27 Capitais do Brasil (`#eixoverde-city-modal`):** seletor interativo agrupado pelas **5 Regiões do Brasil** (*Centro-Oeste, Sudeste, Sul, Nordeste e Norte*) com detecção 1-toque via GPS, lazy-loading da malha cicloviária oficial do CicloMapa/OSM (`public/data/cities/<slug>-lanes.geojson` & `-pois.geojson`), estações compartilhadas locais e **86 rotas 3D curadas (`[lng, lat, elevation]`)** distribuídas por todas as 27 capitais.
- **Mapa Vetorial Único (MapLibre GL JS) + Callout Ancorado ao Pino:** explore, planeje, ajuste waypoints e navegue em 3D sobre o mesmo mapa em tema **Claro**, **Escuro** ou **Satélite**; clique com o botão direito (desktop) ou segure o dedo (mobile) para centralizar o mapa e abrir o balão de ações rápidas (*Salvar* / *Rotas*) ancorado diretamente acima do pino marcado.
- **Malha Cicloviária Verde-Lima + Trechos Coloridos por Segurança + Estações Compartilhadas:** malha de ciclovias em verde-lima de alto contraste frente à rota ativa, visualização de cada trecho por segurança (*Ciclovia*, *Ciclofaixa*, *Via Calma*, *Via Comum*), camada dedicada de estações compartilhadas (Bike Brasília, Bike Itaú SP/RJ, Bike PE, Bike Salvador, Bike PoA, Bicicletar Fortaleza, hubs JET e sistemas locais) e **Cache Offline por Capital** em 1 clique.
- **Roteamento Seguro Multi-Perfil + Clima & Vento (Open-Meteo Live):** compare até 3 trajetos (*Mais Segura • Ciclovias*, *Equilibrada*, *Mais Rápida*) com índice de segurança, altimetria interativa, alertas de travessia arterial, temperatura, chance de chuva, física de vento contra/a favor no ETA e na bateria, e avisos de pista molhada para aros pequenos.
- **Comunidade & Avaliações Adaptativas 1–5★:** publique rotas salvas e avalie segurança com sugestões inteligentes de tags que variam dinamicamente conforme a nota (5★ só elogios, 4★ positivas + alertas leves, 3★ meio a meio, 2★ mais negativas, 1★ só problemas).
- **Minha Garagem + Calibração Real de Bateria + Comparar & Comprar:** catálogo brasileiro de patinetes elétricos, e-bikes, compartilhados (JET/Tembici), bikes convencionais e e-skates, cadastro personalizado e aprendizado contínuo de eficiência real por veículo após cada trajeto.
- **Navegação Handlebar + Gravação GPS & Modo Livre:** rotação 3D com bússola, voz PT-BR e sinais sonoros, Wake Lock, gravação automática com auto-pausa inteligente em semáforos (`< 2 km/h`), **Modo Livre** multimodal sem rota prévia, modo demonstração e botão **Reportar Perigo** colaborativo com **Supabase Realtime**.
- **Meus Trajetos (Histórico, Replay no Mapa & GPX):** estatísticas acumuladas (distância, CO₂ evitado, calorias), replay interativo no mapa com gráfico de velocidade e altitude, promoção para *Rotas Salvas* e exportação GPX 1.1.
- **Monetização Não Intrusiva & EixoVerde VIP (R$ 9,90 Pagamento Único Vitalício):** banner compacto exibido apenas fora da navegação ativa (Google AdMob no app nativo Android) + desbloqueio **EixoVerde VIP** (`eixoverde_vip_lifetime`) com remoção definitiva de anúncios, cache offline ilimitado nas 27 capitais, garagem personalizada ilimitada e exportação GPX ilimitada (veja **[`docs/MONETIZATION_SETUP.md`](docs/MONETIZATION_SETUP.md)**).
- **Contas na Nuvem & Sincronização Offline-First (Opcional — Supabase + PostGIS + Google OAuth):** funciona 100% localmente via IndexedDB no modo Visitante (zero chaves) e ativa automaticamente contas na nuvem (E-mail/Senha, Link Mágico e Google), sincronização multi-dispositivo, alertas comunitários Realtime com PostGIS e proxy seguro do OpenRouteService (`ors-proxy`).
- **Empacotamento Nativo Android & iOS (`br.com.eixoverde.app`) + Conformidade LGPD / Lojas:** projetos nativos Capacitor configurados (`android/` e `ios/`), pilha inteligente do botão voltar físico do Android, deep-link nativo `br.com.eixoverde.app://auth-callback`, exclusão instantânea de conta in-app (`delete_my_account`), Política de Privacidade & Termos LGPD integrados (`public/privacidade.html` e `public/exclusao-conta.html`) e workflow GitHub Actions gerando `.apk` e `.aab` prontos para instalação/publicação (veja **[`docs/MOBILE_STORES_SETUP.md`](docs/MOBILE_STORES_SETUP.md)**).

## Desenvolvimento Local & Verificação

```bash
npm install
npm run dev
```

Scripts de qualidade, build web e empacotamento mobile:

```bash
npm run typecheck   # Verificação TypeScript estrita (tsc --noEmit)
npm test            # Testes unitários e de integração (Vitest)
npm run test:e2e    # Suite E2E multi-viewport (Playwright)
npm run build       # Build de produção Web / GitHub Pages (tsc -b && vite build)
npm run cap:sync    # Build mobile (VITE_BASE_PATH=./) + sincronização Android & iOS
npm run cap:android # Abre o projeto nativo no Android Studio
npm run cap:ios     # Abre o projeto nativo no Xcode (macOS)
```

## Chaves de API & Nuvem Supabase (Opcional)

O app funciona **imediatamente sem nenhuma chave** no modo Visitante/Local usando fallback gratuito (**OpenFreeMap** + **BRouter / OSRM** + **IndexedDB**).

Para ativar **Contas na Nuvem, Sincronização Offline-First, PostGIS e Proxy seguro `ors-proxy`**, siga o passo a passo completo em **[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)**. Para publicar ou gerar pacotes Android (`.apk` / `.aab`) e iOS (`.ipa`), consulte **[`docs/MOBILE_STORES_SETUP.md`](docs/MOBILE_STORES_SETUP.md)** e **[`docs/MONETIZATION_SETUP.md`](docs/MONETIZATION_SETUP.md)**.

Variáveis opcionais para `.env.local` (desenvolvimento) ou **Settings → Secrets and variables → Actions → Repository secrets** no GitHub:

- `VITE_SUPABASE_URL` — URL do projeto Supabase (`https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — chave pública do Supabase (aceita tanto **Publishable `sb_publishable_...`** quanto **anon JWT `eyJ...`**)
- `VITE_MAPTILER_KEY` — https://cloud.maptiler.com/ (estilos MapTiler Cloud; em *Allowed HTTP Origins*, use `prodcyrup.github.io` e `localhost`, um por linha)
- `VITE_ORS_KEY` — https://account.heigit.org/ (opcional quando a Edge Function `ors-proxy` mantém `ORS_API_KEY` apenas no servidor)
- `VITE_ADMOB_ANDROID_BANNER_ID` — ID do bloco de anúncio Banner do Google AdMob (usa ID de teste oficial do Google quando omitido)

## Deploy Automático no GitHub Pages & Build Mobile Android

- O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publica automaticamente no GitHub Pages a cada push na branch `main`.
- O workflow [`.github/workflows/mobile-build.yml`](.github/workflows/mobile-build.yml) compila automaticamente os pacotes Android (`EixoVerde-Android-Debug-APK` e `EixoVerde-Android-Release-AAB`) na aba **Actions** do GitHub.
