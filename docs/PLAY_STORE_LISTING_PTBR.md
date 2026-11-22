# Kit de Publicação — Google Play Console (PT-BR)

Este documento reúne todos os textos oficiais, URLs verificadas, respostas de Segurança dos Dados (Data Safety), configuração de monetização e comandos de assinatura de chave (`.aab`) prontos para copiar e colar no **Google Play Console** assim que a verificação da conta for aprovada.

---

## 1. Ficha Principal da Loja (Português — Brasil)

### Nome do aplicativo (máx. 30 caracteres — atual: 28)
```text
EixoVerde: Ciclovias e Rotas
```

### Descrição curta (máx. 80 caracteres — atual: 74)
```text
Rotas seguras em ciclovias e bateria real para bikes, e-bikes e patinetes.
```

### Descrição completa (máx. 4000 caracteres)
```text
O EixoVerde é o navegador de micromobilidade urbana feito para quem se desloca de bicicleta, bicicleta elétrica, patinete elétrico ou monociclo nas 27 capitais do Brasil.

Em vez de mandar você para avenidas expressas e subidas que drenam a bateria, o EixoVerde prioriza ciclovias segregadas, ciclofaixas e ruas calmas — calculando tempo real, esforço físico e consumo exato de bateria para o seu veículo.

PRINCIPAIS RECURSOS

• Malha Cicloviária nas 27 Capitais do Brasil
Explore ciclovias segregadas, ciclofaixas, vias de baixa velocidade, bicicletários, oficinas e estações de bikes e patinetes compartilhados com troca rápida entre todas as capitais brasileiras.

• 3 Perfis Inteligentes de Rota
Compare antes de sair as opções Mais Segura (prioridade máxima em ciclovias), Balanceada ou Direta, com pontuação de segurança, altimetria interativa, contagem de travessias arteriais e previsão climática no trajeto.

• Garagem com Telemetria Real de Bateria e Autonomia
Escolha entre veículos populares ou cadastre o seu próprio veículo elétrico ou convencional com potência, bateria (Wh), velocidade e peso do condutor. O EixoVerde estima autonomia de ida e volta considerando relevo, vento e calibração aprendida com seus trajetos reais.

• Navegação 3D Curva a Curva com Voz em Português
Modo de guidão com câmera inclinada em 3D, bússola magnética, alertas falados em PT-BR, aviso de travessias perigosas, recálculo automático ao sair da rota e tela sempre ativa (Wake Lock).

• Modo Livre e Histórico de Trajetos
Grave qualquer deslocamento com auto-pausa inteligente em semáforos, visualize replay com gráfico de velocidade e elevação, transforme trajetos em rotas salvas ou exporte arquivos GPX.

• Alertas Comunitários em Tempo Real
Reporte e confirme buracos, obras, bloqueios, trechos alagados ou pontos sem iluminação diretamente no mapa para ajudar outros ciclistas e condutores.

• Offline-First e Sincronização Opcional na Nuvem
Use sem criar conta com armazenamento local rápido, ou entre gratuitamente para sincronizar rotas, locais favoritos, garagem e histórico entre dispositivos. Baixe o cache offline da sua capital para consultar ciclovias mesmo sem sinal.

EIXOVERDE VIP (OPCIONAL — PAGAMENTO ÚNICO)
A versão gratuita é completa para uso diário. Com o EixoVerde VIP (R$ 9,90 — compra única vitalícia, sem mensalidades), você remove todos os anúncios e desbloqueia veículos personalizados ilimitados, cache offline em todas as 27 capitais e exportação GPX ilimitada.

PRIVACIDADE E TRANSPARÊNCIA (LGPD)
Seus dados pertencem a você. A exclusão permanente da conta e de todos os registros na nuvem pode ser feita em 1 clique dentro do aplicativo ou pela nossa página pública de exclusão.
```

### Notas da versão `1.0.0` (Novidades)
```text
Lançamento oficial do EixoVerde 1.0.0!
• Malha cicloviária e rotas curadas nas 27 capitais do Brasil.
• Navegação 3D curva a curva com voz PT-BR e modo guidão sem anúncios.
• Garagem com estimativa real de bateria e calibração por trajeto.
• Modo Livre com auto-pausa, alertas comunitários e cache offline.
• Sincronização opcional na nuvem e opção EixoVerde VIP vitalício.
```

---

## 2. Classificação, Categoria & Links Oficiais

| Campo no Play Console | Valor Oficial |
| :--- | :--- |
| **Application ID** | `br.com.eixoverde.app` |
| **Tipo** | App |
| **Categoria principal** | Mapas e navegação (`Maps & Navigation`) |
| **Tags sugeridas** | Mapas, Navegação, Ciclismo, Transporte, Mobilidade urbana |
| **Gratuito ou Pago** | Gratuito (com anúncios e compra única no app) |
| **Classificação indicativa** | Livre para todos os públicos |
| **Site oficial** | `https://eixoverde.com` |
| **E-mail de contato** | `contato@eixoverde.com` |
| **Política de Privacidade** | `https://eixoverde.com/privacidade.html` |
| **URL de exclusão de conta** | `https://eixoverde.com/exclusao-conta.html` |
| **Arquivo `app-ads.txt`** | `https://eixoverde.com/app-ads.txt` (`pub-6690812959868851`) |

---

## 3. Monetização (AdMob + Google Play Billing)

| Item | ID / Valor |
| :--- | :--- |
| **AdMob App ID (Android)** | `ca-app-pub-6690812959868851~6422068887` (já em `android/app/src/main/AndroidManifest.xml`) |
| **AdMob Banner Unit ID (Android)** | `ca-app-pub-6690812959868851/5679832857` (já salvo nos Secrets do GitHub) |
| **Produto In-App (Compra Única)** | `eixoverde_vip_lifetime` — **EixoVerde VIP Vitalício** — **R$ 9,90** |
| **Política de Anúncios no App** | Banners compactos apenas na tela Explorar; **zero anúncios** durante navegação ativa e **zero anúncios** para usuários VIP. |

> **Lembrete no Google Play Console:** em **Monetizar → Produtos → Produtos no app**, crie o produto único gerenciado com ID exato `eixoverde_vip_lifetime` no valor de **R$ 9,90** (BRL) e marque **Ativo**.

---

## 4. Formulário de Segurança dos Dados (Data Safety)

Use estas respostas exatas ao preencher **Conteúdo do app → Segurança dos dados**:

1. **O app coleta ou compartilha algum tipo de dado do usuário obrigatório?** → **Sim**
2. **Todos os dados de usuários coletados pelo app são criptografados em trânsito?** → **Sim** (HTTPS/TLS em todas as conexões com Supabase, roteamento, clima e anúncios).
3. **Qual dos seguintes métodos de criação de conta seu app oferece?** → **Nome de usuário, senha e outra autenticação (E-mail/Senha, Link Mágico, Google OAuth)** + uso opcional como visitante sem conta.
4. **Você oferece uma maneira para os usuários solicitarem a exclusão dos dados?** → **Sim** — Exclusão instantânea in-app (**Menu ☰ → Excluir minha conta**) e URL pública `https://eixoverde.com/exclusao-conta.html`.
5. **Tipos de dados coletados:**
   - **Localização (Precisa e Aproximada):** Coletada (não compartilhada com terceiros de venda de dados) • Finalidade: *Funcionalidade do app* (navegação curva a curva, ponto de partida, clima local, detecção de capital) • **Opcional** (o usuário pode usar sem GPS).
   - **Informações pessoais (Nome e Endereço de e-mail):** Coletadas apenas quando o usuário cria conta opcional • Finalidade: *Gerenciamento de conta e sincronização na nuvem* • **Opcional**.
   - **Conteúdo gerado pelo usuário (Rotas, Locais Favoritos, Alertas Comunitários, Avaliações):** Coletado apenas se o usuário publicar na comunidade ou ativar sincronização • Finalidade: *Funcionalidade do app*.
   - **IDs do dispositivo ou outros IDs (Google AdMob):** Coletado e compartilhado com o Google AdMob na versão gratuita • Finalidade: *Publicidade ou marketing, Prevenção de fraudes e conformidade* • Removido para usuários VIP.
6. **O app contém anúncios?** → **Sim** (Google AdMob na versão gratuita).

---

## 5. Gerar Chave de Upload & Habilitar `.aab` Assinado Automático no GitHub Actions

O projeto já está configurado (`android/app/build.gradle` + `.github/workflows/mobile-build.yml`) para compilar e assinar automaticamente o **`app-release.aab`** no GitHub Actions assim que você cadastrar a chave de upload (`.jks`) nos Secrets do repositório — sem precisar instalar o Android Studio.

### Passo 1 — Gerar sua chave de upload (guarde o arquivo `.jks` e as senhas em local seguro!)
```bash
keytool -genkeypair -v \
  -keystore eixoverde-upload.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias eixoverde
```

### Passo 2 — Converter o `.jks` para Base64 e enviar para os Secrets do GitHub
```bash
# Linux / macOS:
base64 -w 0 eixoverde-upload.jks | gh secret set ANDROID_KEYSTORE_BASE64 -R prodcyrup/EixoVerde

# Configure a senha do keystore, o alias e a senha da chave:
gh secret set ANDROID_KEYSTORE_PASSWORD -R prodcyrup/EixoVerde
gh secret set ANDROID_KEY_ALIAS -R prodcyrup/EixoVerde --body "eixoverde"
gh secret set ANDROID_KEY_PASSWORD -R prodcyrup/EixoVerde
```

### Passo 3 — Disparo do build assinado pronto para subir no Play Console
1. Abra **GitHub → Actions → Build EixoVerde Mobile (Android APK & AAB) → Run workflow**.
2. Informe o `version_code` (`1` para o primeiro envio; `2`, `3`... para atualizações futuras).
3. Baixe o artefato **`EixoVerde-Android-Release-AAB`** (`app-release.aab`) e faça upload direto na faixa de **Teste Fechado** ou **Produção** no Google Play Console.

---

## 6. Ativos Gráficos Recomendados para a Ficha da Loja

| Ativo | Dimensões / Formato | Referência no Repositório |
| :--- | :--- | :--- |
| **Ícone do app** | `512 × 512 px` PNG (32-bit) | `public/icons/icon-512.png` |
| **Recursos gráficos (Feature Graphic)** | `1024 × 500 px` PNG/JPEG | Baseado no hero da landing `eixoverde.com` (cor `#0b3d2e` + marca `EixoVerde`) |
| **Capturas de tela (Celular)** | Mín. 2 (ideal 4–6), 9:16 | Tela Explorar 27 capitais, Preview de rota com elevação, Navegação 3D modo guidão, Minha Garagem (bateria) |
