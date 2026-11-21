# EixoVerde — Navegação & Ciclovias (DF → Brasil)

Aplicativo web progressivo (PWA) de navegação inteligente, planejamento seguro em ciclovias e telemetria personalizada para **patinetes elétricos, e-bikes, bicicletas e micromobilidade**.

## Principais Recursos (Fases 1–4 • Offline-First & Brasília Pro)
- **Mapa Vetorial Único (MapLibre GL JS) + Callout Ancorado ao Pino:** explore, planeje, ajuste waypoints e navegue em 3D sobre o mesmo mapa em tema **Claro**, **Escuro** ou **Satélite**; clique com o botão direito (desktop) ou segure o dedo (mobile) para centralizar o mapa e abrir o balão de ações rápidas (*Salvar* / *Rotas*) ancorado diretamente acima do pino marcado.
- **Malha Cicloviária DF + Trechos Coloridos por Segurança + Estações Tembici & JET:** malha otimizada do CicloMapa DF (-81%), visualização de cada trecho da rota por nível de segurança (*Ciclovia*, *Ciclofaixa*, *Via Calma*, *Via Comum*), camada dedicada com **38 estações reais Bike Brasília (Tembici)** e **16 hubs de patinetes JET** (com rota em 1 toque), além de **Cache Offline DF** em 1 clique.
- **Roteamento Seguro Multi-Perfil + Clima & Vento (Open-Meteo Live):** compare até 3 trajetos (*Mais Segura • Ciclovias*, *Equilibrada*, *Mais Rápida*) com índice de segurança, altimetria interativa, alertas de travessia arterial, temperatura, chance de chuva, física de vento contra/a favor no ETA e na bateria, e avisos de pista molhada para aros pequenos.
- **Comunidade DF & Avaliações 1–5★:** publique suas rotas salvas para outros ciclistas do DF, avalie segurança com notas **1–5★** e tags (*Bom asfalto*, *Iluminada*, *Sombra*, *Paisagem*, *Cruzamento tenso*).
- **Minha Garagem + Calibração Real de Bateria + Comparar & Comprar:** catálogo brasileiro de patinetes elétricos, e-bikes, compartilhados (JET/Tembici), bikes convencionais e e-skates, cadastro personalizado e aprendizado contínuo de eficiência real por veículo após cada pedal.
- **Navegação Handlebar + Gravação GPS & Pedal Livre:** rotação 3D com bússola, voz PT-BR e sinais sonoros, Wake Lock, gravação automática com auto-pausa inteligente em semáforos (`< 2 km/h`), **Pedal Livre** sem rota prévia, modo demonstração e botão **Reportar Perigo** colaborativo com **Supabase Realtime**.
- **Meus Pedais (Histórico, Replay no Mapa & GPX):** estatísticas acumuladas (distância, CO₂ evitado, calorias), replay interativo no mapa com gráfico de velocidade e altitude, promoção para *Rotas Salvas* e exportação GPX 1.1.
- **Contas na Nuvem & Sincronização Offline-First (Opcional — Supabase + PostGIS + Google OAuth):** funciona 100% localmente via IndexedDB no modo Visitante (zero chaves) e ativa automaticamente contas na nuvem (E-mail/Senha, Link Mágico e Google), sincronização multi-dispositivo, alertas comunitários Realtime com PostGIS e proxy seguro do OpenRouteService (`ors-proxy`).
- **Rotas Salvas, GPX/KML & Links Compartilháveis:** importação/exportação GPX/KML, links compartilháveis e persistência local com migração segura para a nuvem.

## Desenvolvimento Local & Verificação

```bash
npm install
npm run dev
```

Scripts de qualidade e build:

```bash
npm run typecheck   # Verificação TypeScript estrita (tsc --noEmit)
npm test            # Testes unitários e de integração (Vitest)
npm run test:e2e    # Suite E2E multi-viewport (Playwright)
npm run build       # Build de produção (tsc -b && vite build)
```

## Chaves de API & Nuvem Supabase (Opcional)

O app funciona **imediatamente sem nenhuma chave** no modo Visitante/Local usando fallback gratuito (**OpenFreeMap** + **BRouter / OSRM** + **IndexedDB**).

Para ativar **Contas na Nuvem, Sincronização Offline-First, PostGIS e Proxy seguro `ors-proxy`**, siga o passo a passo completo em **[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)**.

Variáveis opcionais para `.env.local` (desenvolvimento) ou **Settings → Secrets and variables → Actions → Repository secrets** no GitHub:

- `VITE_SUPABASE_URL` — URL do projeto Supabase (`https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — chave pública do Supabase (aceita tanto **Publishable `sb_publishable_...`** quanto **anon JWT `eyJ...`**)
- `VITE_MAPTILER_KEY` — https://cloud.maptiler.com/ (estilos MapTiler Cloud; em *Allowed HTTP Origins*, use `prodcyrup.github.io` e `localhost`, um por linha)
- `VITE_ORS_KEY` — https://account.heigit.org/ (opcional quando a Edge Function `ors-proxy` mantém `ORS_API_KEY` apenas no servidor)

## Deploy Automático no GitHub Pages

O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) detecta automaticamente o nome do repositório (`/${{ github.event.repository.name }}/`) e publica no GitHub Pages a cada push na branch `main`.
No repositório do GitHub, basta selecionar **Settings → Pages → Build and deployment → Source: GitHub Actions**.
