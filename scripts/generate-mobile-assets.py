#!/usr/bin/env python3
"""
Generates high-resolution PNG store icons & splash screens for EixoVerde:
- public/icons/icon-1024.png (1024x1024 — Apple App Store & Google Play Store master icon, opaque no alpha)
- public/icons/icon-512.png (512x512 — PWA & Play Store high-res icon)
- public/icons/icon-192.png (192x192 — PWA standard icon)
- public/icons/apple-touch-icon.png (180x180 — iOS Home Screen icon)
- public/icons/icon-foreground.png (1024x1024 — Android Adaptive Icon foreground with transparent background)
- public/icons/splash-1280.png (1280x1280 — Native Splash Screen)
"""

import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO_ROOT = Path(__file__).resolve().parents[1]
ICONS_DIR = REPO_ROOT / "public" / "icons"

FULL_BLD_SVG = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <linearGradient id="arrow" x1="140" y1="380" x2="372" y2="124" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6ee7b7" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)" />
  <path
    d="M116 352C168 352 190 256 256 256C322 256 344 160 396 160"
    stroke="#34d399"
    stroke-width="26"
    stroke-linecap="round"
    stroke-opacity="0.35"
  />
  <path
    d="M256 96L366 368L256 312L146 368L256 96Z"
    fill="url(#arrow)"
    stroke="#022c22"
    stroke-width="10"
    stroke-linejoin="round"
  />
  <circle cx="256" cy="242" r="22" fill="#059669" />
</svg>
"""

ROUNDED_SVG = FULL_BLD_SVG.replace('<rect width="512" height="512" fill="url(#bg)" />', '<rect width="512" height="512" rx="112" fill="url(#bg)" />')

FOREGROUND_ONLY_SVG = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="arrow" x1="140" y1="380" x2="372" y2="124" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6ee7b7" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
  </defs>
  <g transform="translate(64, 64) scale(0.75)">
    <path
      d="M116 352C168 352 190 256 256 256C322 256 344 160 396 160"
      stroke="#34d399"
      stroke-width="26"
      stroke-linecap="round"
      stroke-opacity="0.45"
    />
    <path
      d="M256 96L366 368L256 312L146 368L256 96Z"
      fill="url(#arrow)"
      stroke="#022c22"
      stroke-width="10"
      stroke-linejoin="round"
    />
    <circle cx="256" cy="242" r="22" fill="#059669" />
  </g>
</svg>
"""


def find_chrome() -> str | None:
    for candidate in ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]:
        if Path(candidate).exists():
            return candidate
    return shutil.which("google-chrome") or shutil.which("chromium")


def main() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    chrome_path = find_chrome()
    launch_kwargs = {"headless": True, "args": ["--no-sandbox"]}
    if chrome_path:
        launch_kwargs["executable_path"] = chrome_path

    with sync_playwright() as p:
        browser = p.chromium.launch(**launch_kwargs)
        page = browser.new_page()

        def render_svg(svg_markup: str, size: int, out_path: Path, transparent: bool = False) -> None:
            page.set_viewport_size({"width": size, "height": size})
            bg = "transparent" if transparent else "#042f2e"
            html = f"<!DOCTYPE html><html><body style='margin:0;padding:0;width:{size}px;height:{size}px;overflow:hidden;background:{bg}'>{svg_markup}</body></html>"
            page.set_content(html)
            page.screenshot(path=str(out_path), omit_background=transparent)
            print(f"Generated {out_path.relative_to(REPO_ROOT)} ({size}x{size})")

        # 1024x1024 opaque square master icon (required by Apple App Store & Google Play Console)
        render_svg(FULL_BLD_SVG, 1024, ICONS_DIR / "icon-1024.png", transparent=False)
        # 512x512 & 192x192 PWA icons
        render_svg(ROUNDED_SVG, 512, ICONS_DIR / "icon-512.png", transparent=True)
        render_svg(ROUNDED_SVG, 192, ICONS_DIR / "icon-192.png", transparent=True)
        # 180x180 Apple Touch Icon (opaque)
        render_svg(FULL_BLD_SVG, 180, ICONS_DIR / "apple-touch-icon.png", transparent=False)
        # 432x432 Android Adaptive Icon Foreground
        render_svg(FOREGROUND_ONLY_SVG, 432, ICONS_DIR / "icon-foreground.png", transparent=True)

        # 1280x1280 Native Splash Screen
        splash_size = 1280
        page.set_viewport_size({"width": splash_size, "height": splash_size})
        splash_html = f"""<!DOCTYPE html>
        <html>
          <body style="margin:0;width:{splash_size}px;height:{splash_size}px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(145deg,#064e3b 0%,#042f2e 55%,#022c22 100%);font-family:sans-serif;color:#ffffff">
            <div style="width:240px;height:240px;border-radius:56px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.45)">
              {FULL_BLD_SVG}
            </div>
            <div style="margin-top:28px;font-size:44px;font-weight:800;letter-spacing:-0.02em">EixoVerde</div>
            <div style="margin-top:8px;font-size:20px;font-weight:600;color:#6ee7b7">Ciclovias &amp; Mobilidade • Brasil</div>
          </body>
        </html>"""
        page.set_content(splash_html)
        page.screenshot(path=str(ICONS_DIR / "splash-1280.png"), omit_background=False)
        print("Generated public/icons/splash-1280.png (1280x1280)")

        # Populate Android mipmap-* and splash screens if android/ exists
        android_res = REPO_ROOT / "android" / "app" / "src" / "main" / "res"
        if android_res.exists():
            densities = {
                "mipmap-mdpi": (48, 108),
                "mipmap-hdpi": (72, 162),
                "mipmap-xhdpi": (96, 216),
                "mipmap-xxhdpi": (144, 324),
                "mipmap-xxxhdpi": (192, 432),
            }
            for folder, (icon_px, fg_px) in densities.items():
                dest = android_res / folder
                dest.mkdir(parents=True, exist_ok=True)
                render_svg(ROUNDED_SVG, icon_px, dest / "ic_launcher.png", transparent=True)
                render_svg(ROUNDED_SVG, icon_px, dest / "ic_launcher_round.png", transparent=True)
                render_svg(FOREGROUND_ONLY_SVG, fg_px, dest / "ic_launcher_foreground.png", transparent=True)

            for splash_file in android_res.glob("drawable*/splash.png"):
                shutil.copy2(ICONS_DIR / "splash-1280.png", splash_file)
            print("Populated Android mipmap launcher icons & drawable splash screens")

        # Populate iOS AppIcon & Splash if ios/ exists
        ios_assets = REPO_ROOT / "ios" / "App" / "App" / "Assets.xcassets"
        if ios_assets.exists():
            ios_icon = ios_assets / "AppIcon.appiconset" / "AppIcon-512@2x.png"
            if ios_icon.parent.exists():
                shutil.copy2(ICONS_DIR / "icon-1024.png", ios_icon)
            for ios_splash in (ios_assets / "Splash.imageset").glob("splash-*.png"):
                shutil.copy2(ICONS_DIR / "splash-1280.png", ios_splash)
            print("Populated iOS AppIcon (1024x1024) & Splash.imageset")

        # 1024x500 Google Play Store Feature Graphic
        page.set_viewport_size({"width": 1024, "height": 500})
        feature_html = f"""<!DOCTYPE html>
        <html>
          <body style="margin:0;width:1024px;height:500px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;padding:0 68px;box-sizing:border-box;background:radial-gradient(circle at 82% 24%, rgba(132,204,22,0.28) 0%, rgba(16,185,129,0.12) 38%, transparent 65%), linear-gradient(135deg,#022c22 0%,#064e3b 52%,#0f172a 100%);font-family:'Plus Jakarta Sans','Inter',sans-serif;color:#ffffff">
            <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.22;pointer-events:none" viewBox="0 0 1024 500" fill="none">
              <path d="M-40 420 C 180 390, 290 220, 520 240 C 750 260, 820 90, 1080 110" stroke="#84cc16" stroke-width="10" stroke-linecap="round"/>
              <path d="M-20 460 C 210 420, 340 280, 580 300 C 800 320, 880 160, 1080 190" stroke="#10b981" stroke-width="6" stroke-dasharray="14 12" stroke-linecap="round"/>
              <circle cx="520" cy="240" r="10" fill="#84cc16" />
              <circle cx="845" cy="135" r="10" fill="#34d399" />
            </svg>
            <div style="position:relative;z-index:2;max-width:610px">
              <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(132,204,22,0.18);border:1px solid rgba(132,204,22,0.45);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:800;letter-spacing:0.04em;color:#bef264;text-transform:uppercase">
                27 Capitais do Brasil • Offline-First
              </div>
              <div style="margin-top:16px;font-size:66px;font-weight:800;letter-spacing:-0.03em;line-height:1.02">EixoVerde</div>
              <div style="margin-top:12px;font-size:23px;font-weight:600;color:#d1fae5;line-height:1.35">
                Ciclovias, Rotas Seguras &amp; Mobilidade Elétrica para Patinetes, E-Bikes e Bicicletas
              </div>
              <div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap;font-size:14px;font-weight:700;color:#ecfdf5">
                <span style="background:rgba(255,255,255,0.12);padding:7px 14px;border-radius:999px">🗺️ Malha CicloMapa</span>
                <span style="background:rgba(255,255,255,0.12);padding:7px 14px;border-radius:999px">⚡ Autonomia Real</span>
                <span style="background:rgba(255,255,255,0.12);padding:7px 14px;border-radius:999px">🧭 Navegação 3D + Voz</span>
              </div>
            </div>
            <div style="position:relative;z-index:2;width:236px;height:236px;border-radius:56px;overflow:hidden;box-shadow:0 28px 70px rgba(0,0,0,0.52);border:3px solid rgba(110,231,183,0.35)">
              {FULL_BLD_SVG}
            </div>
          </body>
        </html>"""
        page.set_content(feature_html)
        page.screenshot(path=str(ICONS_DIR / "feature-graphic-1024x500.png"), omit_background=False)
        print("Generated public/icons/feature-graphic-1024x500.png (1024x500)")

        browser.close()


if __name__ == "__main__":
    main()
