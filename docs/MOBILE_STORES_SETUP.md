# Guia de Publicação Mobile — Google Play Store (Android) & Apple App Store (iOS)

O **EixoVerde** (`br.com.eixoverde.app`) utiliza **Capacitor** sobre o bundle unificado React 19 + MapLibre GL + Supabase Cloud + IndexedDB Offline-First, gerando pacotes nativos para **Android (`.apk` / `.aab`)** e **iOS (Xcode / `.ipa`)** com conformidade integral às políticas das lojas.

---

## 1. Identificadores & Esquema de Deep-Link Nativo

| Parâmetro | Valor Configurado |
| :--- | :--- |
| **Application ID / Bundle ID** | `br.com.eixoverde.app` |
| **Nome do Aplicativo** | `EixoVerde` |
| **Esquema Customizado (OAuth / Magic Link)** | `br.com.eixoverde.app://auth-callback` |
| **Configuração Principal** | `capacitor.config.ts` |
| **Ponte Nativa & Hardware Back** | `src/mobile/nativeBridge.ts` |

### Configuração Obrigatória no Supabase Dashboard (Redirect URLs)
Para que o login com Google, Link Mágico e Recuperação de Senha retornem automaticamente para dentro do aplicativo Android/iOS instalado:
1. Abra o painel do projeto no **Supabase Dashboard** → **Authentication** → **URL Configuration**.
2. Em **Redirect URLs**, adicione:
   ```text
   br.com.eixoverde.app://auth-callback
   capacitor://localhost
   http://localhost
   https://localhost
   ```
3. No **SQL Editor** do Supabase, execute a migration idempotente da Fase 5 para habilitar a exclusão instantânea de conta dentro do app (`public.delete_my_account()`):
   - Arquivo: `supabase/migrations/20261121000004_eixoverde_phase5_account_delete.sql`

---

## 2. Comandos de Build & Sincronização Local

```bash
# 1. Compilar bundle web otimizado para empacotamento nativo (VITE_BASE_PATH=./) e sincronizar Android + iOS
npm run cap:sync

# 2. Abrir o projeto Android no Android Studio (Windows / macOS / Linux)
npm run cap:android

# 3. Abrir o projeto iOS no Xcode (macOS)
npm run cap:ios

# 4. Regerar ícones de alta resolução (1024x1024, 512x512, 192x192, apple-touch-icon, splash)
npm run assets:mobile
```

---

## 3. Download Direto do `.apk` / `.aab` via GitHub Actions (Sem Android Studio)

O workflow `.github/workflows/mobile-build.yml` (**Build EixoVerde Mobile (Android APK & AAB)**) compila automaticamente o aplicativo Android na nuvem:
1. Acesse a aba **Actions** do repositório no GitHub → **Build EixoVerde Mobile (Android APK & AAB)**.
2. Baixe o artefato **`EixoVerde-Android-Debug-APK`** para instalar e testar diretamente em qualquer celular Android (`app-debug.apk`).
3. Para publicação no **Google Play Console**, utilize o artefato **`EixoVerde-Android-Release-AAB`** assinado com sua chave de upload (`keystore`).

### Assinatura do `.aab` para Google Play Store
Para assinar localmente um bundle de produção para a Google Play Store:
```bash
keytool -genkey -v -keystore eixoverde-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias eixoverde
```
Abra a pasta `android/` no Android Studio → **Build** → **Generate Signed Bundle / APK** → **Android App Bundle (`.aab`)** e selecione o arquivo `.jks`.

---

## 4. Checklist de Conformidade das Lojas (Já Implementado no App)

1. **Exclusão de Conta In-App (Apple Guideline 5.1.1(v) & Google Play User Data Policy):**
   - Acessível em **Menu lateral (☰) → Cartão da Conta → Excluir minha conta e dados na nuvem** (`#eixoverde-delete-account-open-btn`).
   - Chama a RPC `public.delete_my_account()` (`SECURITY DEFINER`) que remove o registro em `auth.users` e apaga em cascata (`ON DELETE CASCADE`) perfil, veículos, locais, rotas, pedais e avaliações na nuvem, além de oferecer opção para limpar os dados locais do aparelho.
2. **Política de Privacidade & Termos de Uso LGPD Integrados (`#eixoverde-privacy-modal`):**
   - Acessível tanto antes do login no rodapé do modal de autenticação (`#eixoverde-auth-privacy-link`) quanto no menu principal (`#eixoverde-privacy-open-btn`).
3. **Permissões de Localização em Português (PT-BR):**
   - **Android (`android/app/src/main/AndroidManifest.xml`):** `ACCESS_COARSE_LOCATION` e `ACCESS_FINE_LOCATION`.
   - **iOS (`ios/App/App/Info.plist`):** `NSLocationWhenInUseUsageDescription` e `NSLocationAlwaysAndWhenInUseUsageDescription` com justificativa clara do uso para ciclovias, alertas de obstáculos e telemetria de pedal.
4. **Botão Voltar Físico do Android (Hardware Back Stack):**
   - Gerenciado por `handleHardwareBackButton()` em `src/store/useAppStore.ts`, fechando modais, gavetas ou saindo da navegação curva a curva em ordem de prioridade antes de minimizar o app.
