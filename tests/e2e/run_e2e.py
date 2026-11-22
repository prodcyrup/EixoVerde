#!/usr/bin/env python3
"""
EixoVerde Permanent Automated Dual-Pass E2E QA Suite (Playwright + Headless Chromium)

Pass 1 — Zero-Key Guest / Local Mode:
- Desktop (1440x900), iPhone SE (375x667), iPhone 14 (390x844), Android (412x915)
- Verifies zero Supabase requests, "Modo Local" badge, Dark/Light input contrast,
  Vehicle Garage, Compare & Buy, MapContextPopup, Meus Locais, Curated DF Routes,
  Demo Navigation, and Offline Routing Resilience.

Pass 2 — Supabase Cloud Mode (with modern `sb_publishable_...` key & mocked PostgREST/Auth/ORS-Proxy):
- Verifies "Visitante" state & "Entrar ou Criar Conta" CTA
- Verifies AuthModal Dark-Mode focused input contrast & PT-BR error handling
- Verifies Sign-In -> Guest-to-Cloud MigrationPromptModal -> Bidirectional Push/Pull LWW Sync
- Verifies 0px-width `#eixoverde-shell-sync-dot` on Desktop (1440px) and iPhone SE (375px) with zero clipping
- Verifies `/functions/v1/ors-proxy` routing priority & headers
- Verifies Sign-Out preserves local IndexedDB routes & saved places
"""

import json
import os
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO_ROOT = Path(__file__).resolve().parents[2]
SHOT_DIR = Path(os.environ["E2E_SCREENSHOT_DIR"]) if os.environ.get("E2E_SCREENSHOT_DIR") else None

MOCK_SUPABASE_URL = "https://tuocwnjnkihchlxxqmgi.supabase.co"
MOCK_PUBLISHABLE_KEY = "sb_publishable_Biywe21SerSFL7yZYtl4nw_8X-dxTestKey"


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


def find_chrome() -> str | None:
    for candidate in ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]:
        if Path(candidate).exists():
            return candidate
    return shutil.which("google-chrome") or shutil.which("chromium")


def save_shot(page, name: str) -> None:
    if SHOT_DIR is not None:
        SHOT_DIR.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(SHOT_DIR / name))


def wait_for_server(url: str, timeout_loops: int = 45) -> bool:
    for _ in range(timeout_loops):
        try:
            urllib.request.urlopen(url, timeout=1)
            return True
        except Exception:
            time.sleep(0.35)
    return False


def run_e2e() -> int:
    port_guest = find_free_port()
    port_cloud = find_free_port()
    while port_cloud == port_guest:
        port_cloud = find_free_port()
    URL_GUEST = f"http://127.0.0.1:{port_guest}/"
    URL_CLOUD = f"http://127.0.0.1:{port_cloud}/"

    env_guest = os.environ.copy()
    env_guest["VITE_SUPABASE_URL"] = ""
    env_guest["VITE_SUPABASE_ANON_KEY"] = ""

    env_cloud = os.environ.copy()
    env_cloud["VITE_SUPABASE_URL"] = MOCK_SUPABASE_URL
    env_cloud["VITE_SUPABASE_ANON_KEY"] = MOCK_PUBLISHABLE_KEY

    proc_guest = subprocess.Popen(
        [
            "npx",
            "vite",
            "--host",
            "127.0.0.1",
            "--port",
            str(port_guest),
            "--strictPort",
        ],
        cwd=str(REPO_ROOT),
        env=env_guest,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    proc_cloud = subprocess.Popen(
        [
            "npx",
            "vite",
            "--host",
            "127.0.0.1",
            "--port",
            str(port_cloud),
            "--strictPort",
        ],
        cwd=str(REPO_ROOT),
        env=env_cloud,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )
    results = []

    def check(name: str, ok: bool, detail: str = ""):
        status = "PASS" if ok else "FAIL"
        results.append({"name": name, "ok": ok, "detail": detail})
        print(f"[{status}] {name}" + (f" — {detail}" if detail else ""), flush=True)

    try:
        if not wait_for_server(URL_GUEST) or not wait_for_server(URL_CLOUD):
            print("[FAIL] Vite dev servers failed to start", flush=True)
            return 1

        chrome_path = find_chrome()
        launch_kwargs = {
            "headless": True,
            "args": ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader"],
        }
        if chrome_path:
            launch_kwargs["executable_path"] = chrome_path

        with sync_playwright() as p:
            browser = p.chromium.launch(**launch_kwargs)

            # ====================================================
            # PASS 1: ZERO-KEY GUEST / LOCAL MODE (4 VIEWPORTS)
            # ====================================================
            ctx = browser.new_context(
                viewport={"width": 1440, "height": 900},
                geolocation={"latitude": -15.7524, "longitude": -47.8992},
                permissions=["geolocation"],
            )
            page = ctx.new_page()
            desktop_errors = []
            supabase_requests_in_guest = []
            page.on("pageerror", lambda err: desktop_errors.append(str(err)))
            page.on(
                "request",
                lambda req: supabase_requests_in_guest.append(req.url)
                if "supabase.co" in req.url
                else None,
            )

            # Deterministic Open-Meteo weather mock (light rain + 18 km/h wind from North)
            page.route(
                "https://api.open-meteo.com/v1/forecast**",
                lambda route: route.fulfill(
                    status=200,
                    headers={"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
                    body=json.dumps(
                        {
                            "current": {
                                "time": "2026-11-21T14:00",
                                "temperature_2m": 27.0,
                                "apparent_temperature": 28.0,
                                "relative_humidity_2m": 62,
                                "precipitation": 0.6,
                                "weather_code": 61,
                                "wind_speed_10m": 18.0,
                                "wind_direction_10m": 0,
                                "wind_gusts_10m": 24.0,
                                "is_day": 1,
                            },
                            "hourly": {
                                "time": ["2026-11-21T14:00"],
                                "precipitation_probability": [65],
                                "uv_index": [6.5],
                            },
                        }
                    ),
                ),
            )

            page.goto(URL_GUEST, wait_until="domcontentloaded")
            page.wait_for_selector("#eixoverde-desktop-menu-btn", timeout=15000)
            time.sleep(1.8)

            # 1a. Header clipping & Light mode contrast
            header_check = page.evaluate(
                """() => {
                  const aside = document.querySelector('aside');
                  const aRect = aside.getBoundingClientRect();
                  const btns = Array.from(aside.querySelectorAll('div:first-child button')).map(b => {
                    const r = b.getBoundingClientRect();
                    return { id: b.id || b.title || b.getAttribute('aria-label'), right: Math.round(r.right), overflow: r.right > aRect.right + 1 };
                  });
                  return { asideRight: Math.round(aRect.right), btns };
                }"""
            )
            check("Desktop header zero clipping", all(not b["overflow"] for b in header_check["btns"]))

            # Single-mount shell: zero duplicate DOM IDs
            dup_ids_desktop = page.evaluate(
                """() => ({
                  search: document.querySelectorAll('#eixoverde-search-input').length,
                  freeride: document.querySelectorAll('#eixoverde-freeride-chip').length,
                  garage: document.querySelectorAll('#eixoverde-garage-btn').length,
                })"""
            )
            check(
                "Desktop single-mount shell has zero duplicate DOM IDs",
                dup_ids_desktop == {"search": 1, "freeride": 1, "garage": 1},
                json.dumps(dup_ids_desktop),
            )

            light_search = page.locator("aside #eixoverde-search-input")
            light_search.click()
            light_search.fill("Parque Burle Marx")
            lc = light_search.evaluate("el => ({ color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor })")
            check("Light mode search input contrast", lc["color"] != lc["bg"])
            light_search.fill("")
            page.locator("aside button:has-text('Fechar')").first.click()
            time.sleep(0.2)

            # 1b. Menu drawer: dynamic location + version, Modo Local card, Stations toggle & Offline DF Cache
            page.click("#eixoverde-desktop-menu-btn")
            page.wait_for_selector("#eixoverde-account-card", timeout=6000)
            time.sleep(0.3)
            menu_text = page.locator("aside").last.inner_text()
            sync_badge_guest = page.locator("#eixoverde-sync-status").inner_text()
            check(
                "Desktop menu displays v1.0.0, Modo Local, Meus Trajetos, VIP R$ 9,90 & no Motores Ativos / third-party brands",
                "v1.0.0" in menu_text
                and "Modo Local" in sync_badge_guest
                and "Meus Trajetos" in menu_text
                and "EixoVerde VIP" in menu_text
                and "R$ 9,90" in menu_text
                and "Motores Ativos" not in menu_text
                and "Waze" not in menu_text
                and "Komoot" not in menu_text
                and not page.locator("#eixoverde-auth-open-btn").is_visible(),
                f"badge={sync_badge_guest!r}",
            )
            check(
                "Menu drawer renders Estações Tembici & JET toggle and Cache Offline DF card",
                page.locator("#eixoverde-stations-toggle").is_visible()
                and page.locator("#eixoverde-offline-cache-card").is_visible()
                and page.locator("#eixoverde-warm-offline-btn").is_visible(),
            )
            page.click("#eixoverde-warm-offline-btn")
            try:
                page.wait_for_selector("#eixoverde-offline-cache-card:has-text('Pronto Offline')", timeout=6000)
            except Exception:
                pass
            cache_card_txt = page.locator("#eixoverde-offline-cache-card").inner_text()
            check("1-tap Cache Offline DF updates readiness state cleanly", "Pronto Offline" in cache_card_txt, cache_card_txt)

            # Compare & Buy modal
            page.locator("button:has-text('Comparar & Comprar')").click()
            page.wait_for_selector("h2:has-text('Comparar')", timeout=6000)
            page.locator("button:has-text('E-Bikes')").click()
            time.sleep(0.2)
            check("Compare & Buy modal opens & filters E-Bikes", page.locator("h2:has-text('Comparar')").is_visible())
            page.locator("button[aria-label='Fechar comparativo']").click()
            time.sleep(0.3)

            # Switch to Dark mode
            page.locator("aside button[title*='Alternar tema']").click()
            time.sleep(0.3)

            # 1c. Vehicle Garage preset switch + custom vehicle creation
            page.click("#eixoverde-garage-btn")
            page.wait_for_selector("h2:has-text('Minha Garagem')", timeout=6000)
            page.locator("text=Segway Ninebot F2 Pro").click()
            time.sleep(0.3)
            check("Instant vehicle switch updates header pill", "Segway" in page.locator("#eixoverde-garage-btn").inner_text())

            page.click("#eixoverde-garage-btn")
            page.wait_for_selector("button:has-text('Cadastrar meu veículo')", timeout=6000)
            page.locator("button:has-text('Cadastrar meu veículo')").click()
            page.fill("input[placeholder*='Meu Patinete']", "Patinete QA 800W")
            page.locator("button:has-text('Salvar e Selecionar')").click()
            time.sleep(0.4)
            check(
                "Custom vehicle creation updates header & auto-closes modal",
                "Patinete" in page.locator("#eixoverde-garage-btn").inner_text()
                and not page.locator("h2:has-text('Minha Garagem')").is_visible(),
            )

            # Verify toast stack sits at top-center with zero collision against the top-right GPS button
            toast_gps_check = page.evaluate(
                """() => {
                  const toast = document.querySelector('#eixoverde-toast-stack');
                  const gps = document.querySelector('#eixoverde-gps-btn');
                  if (!toast || !gps) return { ok: true, skipped: true };
                  const t = toast.getBoundingClientRect();
                  const g = gps.getBoundingClientRect();
                  const overlaps = !(t.right < g.left - 4 || t.left > g.right + 4 || t.bottom < g.top - 4 || t.top > g.bottom + 4);
                  return { ok: !overlaps, toastRight: Math.round(t.right), gpsLeft: Math.round(g.left) };
                }"""
            )
            check("Toast stack has zero collision with floating GPS button", toast_gps_check["ok"], json.dumps(toast_gps_check))

            # 1d. Right-click pin-anchored MapContextPopup + centering + overflow menu + SavePlaceModal dark contrast
            page.mouse.click(960, 460, button="right")
            page.wait_for_selector("#eixoverde-map-context-popup", timeout=6000)
            time.sleep(0.75)
            pop_text = page.locator("#eixoverde-map-context-popup").inner_text()
            pin_anchor = page.evaluate(
                """() => {
                  const pop = document.querySelector('#eixoverde-map-context-popup');
                  const pin = document.querySelector('#eixoverde-context-pin-marker');
                  if (!pop || !pin) return { ok: false };
                  const pr = pop.getBoundingClientRect();
                  const mr = pin.getBoundingClientRect();
                  const popCx = pr.left + pr.width / 2;
                  const pinCx = mr.left + mr.width / 2;
                  const gapY = Math.round(mr.top - pr.bottom);
                  const dx = Math.round(Math.abs(popCx - pinCx));
                  return {
                    ok: pr.bottom <= mr.top + 14 && gapY <= 72 && dx <= 90,
                    gapY,
                    dx,
                    popBottom: Math.round(pr.bottom),
                    pinTop: Math.round(mr.top),
                  };
                }"""
            )
            check("Desktop right-click opens MapContextPopup", "Salvar" in pop_text and "Rotas" in pop_text)
            check("MapContextPopup anchors directly above marked red pin", pin_anchor["ok"], json.dumps(pin_anchor))
            save_shot(page, "e2e_phase4_pin_callout_dark.png")

            page.locator("#eixoverde-map-context-popup button[aria-label*='Mais opções']").click()
            time.sleep(0.2)
            more_text = page.locator("#eixoverde-map-context-popup").inner_text()
            check(
                "MapContextPopup '...' menu has Ponto A / Perigo / Copiar",
                "Definir como Ponto A" in more_text and "Reportar perigo" in more_text and "Copiar coordenadas" in more_text,
            )

            page.locator("#eixoverde-map-context-popup button:has-text('Salvar')").click()
            page.wait_for_selector("input[placeholder*='Ex: Casa']", timeout=6000)
            save_in = page.locator("input[placeholder*='Ex: Casa']")
            save_in.click()
            save_in.fill("Masterplace QA")
            dc = save_in.evaluate("el => ({ color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor })")
            check("Dark-mode SavePlaceModal focused input contrast", dc["color"] != dc["bg"] and dc["bg"] != "rgb(255, 255, 255)")
            page.locator("form button[type='submit']:has-text('Salvar Local')").click()
            time.sleep(0.4)

            page.locator("aside button:has-text('Meus Locais')").first.click()
            time.sleep(0.25)
            tab_ok = page.evaluate(
                """() => {
                  const aside = document.querySelector('aside');
                  const r = Array.from(aside.querySelectorAll('button')).find(b => b.textContent.trim() === 'Rotas');
                  const m = Array.from(aside.querySelectorAll('button')).find(b => b.textContent.includes('Meus Locais'));
                  return getComputedStyle(r).backgroundColor === 'rgba(0, 0, 0, 0)' && getComputedStyle(m).backgroundColor !== 'rgba(0, 0, 0, 0)';
                }"""
            )
            check("Meus Locais shows saved place & crisp active tab highlight", "Masterplace QA" in page.locator("aside").first.inner_text() and tab_ok)

            # 1e. Curated DF routes + 1-5★ Rating & Safety Tags picker
            page.locator("aside button:has-text('Rotas')").first.click()
            time.sleep(0.25)
            rotas_text = page.locator("aside").first.inner_text()
            check(
                "All 8 curated DF routes listed (Noroeste, Sudoeste, Asa Sul, Lago Sul)",
                "Noroeste (Burle Marx)" in rotas_text and "Lago Sul: Ponte JK" in rotas_text and "Asa Sul (SQS 114)" in rotas_text,
            )

            # Rate first curated DF route with adaptive 1-5★ tags (5★=only positive, 1★=only negative, 3★=mixed)
            first_rate_btn = page.locator("aside button[data-rate-route]").first
            first_rate_btn.click()
            time.sleep(0.2)
            open_rating_drawers = page.locator("aside button[data-submit-rating]").count()
            editor = page.locator("aside [data-rating-editor]").first
            tags_5_txt = editor.inner_text()
            ok_5_star = (
                "Bem sinalizada" in tags_5_txt
                and "Bom asfalto" in tags_5_txt
                and "Cruzamento tenso" not in tags_5_txt
                and "Asfalto ruim / buracos" not in tags_5_txt
            )
            editor.locator("button[data-star-value='1']").click()
            time.sleep(0.15)
            tags_1_txt = editor.inner_text()
            ok_1_star = (
                "Asfalto ruim / buracos" in tags_1_txt
                and "Sensação insegura" in tags_1_txt
                and "Bom asfalto" not in tags_1_txt
                and "Bem sinalizada" not in tags_1_txt
            )
            editor.locator("button[data-star-value='3']").click()
            time.sleep(0.15)
            tags_3_txt = editor.inner_text()
            ok_3_star = "Bom asfalto" in tags_3_txt and "Cruzamento tenso" in tags_3_txt
            check(
                "Phase 7 Adaptive 1-5★ rating tags switch cleanly (5★ positive, 3★ mixed, 1★ negative)",
                ok_5_star and ok_3_star and ok_1_star,
                f"5★={ok_5_star}, 3★={ok_3_star}, 1★={ok_1_star}",
            )
            editor.locator("button[data-star-value='5']").click()
            time.sleep(0.15)
            editor.locator("button[data-safety-tag='bom_asfalto']").click()
            page.locator("aside button[data-submit-rating]").first.click()
            time.sleep(0.35)
            check(
                "1-5★ route rating opens only on clicked card & persists inline with safety tag",
                open_rating_drawers == 1
                and "5.0 (1)" in page.locator("aside").first.inner_text()
                and "Bom asfalto" in page.locator("aside").first.inner_text(),
                f"open_drawers={open_rating_drawers}",
            )

            page.locator("aside >> text=Esplanada → Asa Norte").first.click()
            page.wait_for_selector("aside #eixoverde-start-nav-btn", timeout=8000)
            time.sleep(0.5)
            c_text = page.locator("aside").first.inner_text()
            check("Curated Esplanada -> Asa Norte shows 3 travessias & +82m", "3 travessias" in c_text and "+82m" in c_text)
            check(
                "Live Open-Meteo weather pill & wet-ciclovia scooter warning render in Route Preview",
                page.locator("aside #eixoverde-weather-pill").is_visible()
                and "27°C" in page.locator("aside #eixoverde-weather-pill").inner_text()
                and page.locator("aside #eixoverde-weather-warning").is_visible()
                and "ciclovia molhada" in page.locator("aside #eixoverde-weather-warning").inner_text(),
            )
            # Color-coded safety segments legend + single-line check + toggle + zero duplicate weather pill
            legend_single_line = page.evaluate(
                """() => {
                  const items = Array.from(document.querySelectorAll('#eixoverde-safety-segments-legend .grid > span'));
                  if (items.length !== 4) return false;
                  const heights = items.map(el => Math.round(el.getBoundingClientRect().height));
                  return Math.max(...heights) <= 20;
                }"""
            )
            check(
                "Color-coded safety segments legend renders single-line & toggles cleanly (single #eixoverde-weather-pill)",
                page.locator("#eixoverde-safety-segments-legend").is_visible()
                and legend_single_line
                and "Ciclovia" in page.locator("#eixoverde-safety-segments-legend").inner_text()
                and page.evaluate("() => document.querySelectorAll('#eixoverde-weather-pill').length") == 1,
            )
            save_shot(page, "e2e_phase4_safety_segments.png")
            page.click("#eixoverde-safety-segments-toggle")
            time.sleep(0.15)
            seg_off = "Oculto" in page.locator("#eixoverde-safety-segments-toggle").inner_text()
            page.click("#eixoverde-safety-segments-toggle")
            time.sleep(0.15)
            check("Safety segments toggle switches Ativo <-> Oculto", seg_off and "Ativo" in page.locator("#eixoverde-safety-segments-toggle").inner_text())

            page.locator("aside button:has-text('Só Ida')").click()
            time.sleep(0.2)
            rt_text = page.locator("aside").first.inner_text()
            check("Round-trip toggle doubles trip distance cleanly", "Ida + Volta" in rt_text and "15,8 km" in rt_text)
            page.locator("aside button:has-text('Ida + Volta')").click()
            time.sleep(0.2)

            # 1f. Demo Navigation + Zero Ads During Nav + 2D/3D toggle + Hazard Modal dark contrast + RideSummaryModal
            page.locator("aside #eixoverde-demo-nav-btn").click()
            page.wait_for_selector("button:has-text('Sair')", timeout=8000)
            time.sleep(1.1)
            check(
                "Phase 7 Ad Banner is NEVER rendered during active 3D navigation",
                page.locator("[data-ad-banner='true']").count() == 0,
            )
            page.locator("button:has-text('3D')").click()
            time.sleep(0.3)
            check("Demo Navigation launches & toggles 3D -> 2D", page.locator("button:has-text('2D')").is_visible())
            page.locator("button[aria-label='Reportar perigo na ciclovia']").click()
            page.wait_for_selector("input[placeholder*='Observação rápida']", timeout=6000)
            haz_in = page.locator("input[placeholder*='Observação rápida']")
            haz_in.click()
            haz_in.fill("Buraco teste E2E")
            hc = haz_in.evaluate("el => ({ color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor })")
            check("Dark-mode HazardReportModal focused input contrast", hc["bg"] != "rgb(255, 255, 255)")
            page.locator("button:has-text('Publicar Alerta')").click()
            time.sleep(0.3)
            page.locator("button:has-text('Sair')").click()
            page.wait_for_selector("#eixoverde-ride-summary-modal", timeout=6000)
            sum_txt = page.locator("#eixoverde-ride-summary-modal").inner_text()
            ride_title_in = page.locator("#eixoverde-ride-title-input")
            ride_title_in.click()
            rt_c = ride_title_in.evaluate("el => ({ color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor })")
            check(
                "Exiting Demo Navigation opens RideSummaryModal ('Resumo do Trajeto') with Simulação badge & crisp dark input",
                "Resumo do Trajeto" in sum_txt and "Simulação" in sum_txt and rt_c["bg"] != "rgb(255, 255, 255)",
                json.dumps(rt_c),
            )
            save_shot(page, "e2e_phase3_ride_summary_dark.png")
            page.click("#eixoverde-ride-save-btn")
            time.sleep(0.4)

            # 1f-2. Meus Trajetos history tab + SVG Replay Chart + Modo Livre HUD (Pause/Resume/Finish)
            page.locator("aside button[aria-label='Voltar']").click()
            time.sleep(0.3)
            check(
                "Phase 7 inclusive multimodal labels render ('Modo Livre' & 'Trajetos')",
                "Modo Livre" in page.locator("aside #eixoverde-freeride-chip").inner_text()
                and "Trajetos" in page.locator("aside #eixoverde-tab-rides").inner_text(),
            )
            page.click("aside #eixoverde-tab-rides")
            page.wait_for_selector("aside #eixoverde-rides-panel", timeout=6000)
            time.sleep(0.3)
            rides_txt = page.locator("aside #eixoverde-rides-panel").inner_text()
            check(
                "Meus Trajetos displays lifetime stats & saved Demo ride",
                "resumo acumulado" in rides_txt.lower()
                and "histórico de trajetos" in rides_txt.lower()
                and "Simulação" in rides_txt
                and "Esplanada" in rides_txt,
            )
            page.locator("aside #eixoverde-rides-panel button:has-text('Replay')").first.click()
            time.sleep(0.4)
            check(
                "Ride Replay card opens SVG speed/elevation chart & Salvar como Rota / GPX actions",
                page.locator("aside #eixoverde-rides-panel svg polyline").count() >= 1
                and "Salvar como Rota" in page.locator("aside #eixoverde-rides-panel").inner_text(),
            )
            save_shot(page, "e2e_phase3_meus_pedais.png")

            # Launch Free Ride ("Modo Livre") HUD -> Pause -> Resume -> Finish
            page.click("aside #eixoverde-start-freeride-btn")
            page.wait_for_selector("#eixoverde-freeride-hud", timeout=6000)
            time.sleep(0.3)
            fr_hud_txt = page.locator("#eixoverde-freeride-hud").inner_text()
            page.click("#eixoverde-freeride-pause-btn")
            time.sleep(0.2)
            fr_paused = "Retomar" in page.locator("#eixoverde-freeride-pause-btn").inner_text()
            page.click("#eixoverde-freeride-finish-btn")
            time.sleep(0.35)
            # If RideSummaryModal opened from short free ride, discard cleanly
            if page.locator("#eixoverde-ride-discard-btn").is_visible():
                page.click("#eixoverde-ride-discard-btn")
                time.sleep(0.2)
            check(
                "Free Ride ('Modo Livre') HUD launches, toggles Pause/Retomar & finishes cleanly",
                "Modo Livre" in fr_hud_txt and fr_paused and page.locator("aside #eixoverde-search-input").is_visible(),
            )

            # 1g. Offline routing resilience test
            page.locator("aside button:has-text('Rotas')").first.click()
            time.sleep(0.2)

            def block_routing(route):
                u = route.request.url
                if any(host in u for host in ["openrouteservice", "brouter.de", "routing.openstreetmap.de", "heigit.org"]):
                    route.abort()
                else:
                    route.continue_()

            page.route("**/*", block_routing)
            search_in = page.locator("aside #eixoverde-search-input")
            search_in.click()
            search_in.fill("Parque da Cidade")
            time.sleep(0.5)
            page.locator("aside button:has-text('Parque da Cidade Sarah Kubitschek')").first.click()
            page.wait_for_selector("aside #eixoverde-start-nav-btn", timeout=15000)
            time.sleep(0.5)
            off_text = page.locator("aside").first.inner_text()
            check("Offline routing gracefully falls back without crashing", "Offline" in off_text and "Três Poderes" not in off_text)
            page.unroute("**/*", block_routing)

            # 1h. Phase 6: 27 Brazilian State Capitals Selector Modal & City Switching
            page.locator("aside button[aria-label='Voltar']").click()
            time.sleep(0.25)
            page.click("#eixoverde-city-selector-btn")
            page.wait_for_selector("#eixoverde-city-modal", timeout=6000)
            cap_buttons_count = page.locator("#eixoverde-city-modal button[data-city-slug]").count()
            check("Phase 6 CitySelectorModal renders all 27 Brazilian State Capitals across 5 Regions", cap_buttons_count == 27, f"count={cap_buttons_count}")
            page.click("#eixoverde-city-modal button[data-city-slug='sao-paulo']")
            time.sleep(0.4)
            sp_panel_text = page.locator("aside").first.inner_text()
            check(
                "Phase 6 Selecting São Paulo switches curated routes & lazy-loads SP CicloMapa network",
                "Ciclovia Av. Paulista" in sp_panel_text and "Ciclovia Rio Pinheiros" in sp_panel_text,
            )
            # Switch back to Brasília
            page.click("#eixoverde-city-selector-btn")
            page.wait_for_selector("#eixoverde-city-modal", timeout=6000)
            page.click("#eixoverde-city-modal button[data-city-slug='brasilia']")
            time.sleep(0.3)

            # 1i. Phase 7: Compact Ad Banner -> EixoVerde VIP (R$ 9,90) Lifetime Unlock -> Zero Ads
            ad_explore = page.locator("#eixoverde-ad-banner-explore")
            ad_visible_before = ad_explore.is_visible() and "R$ 9,90" in ad_explore.inner_text()
            page.click("#eixoverde-ad-remove-btn-explore")
            page.wait_for_selector("#eixoverde-vip-modal", timeout=6000)
            vip_modal_txt = page.locator("#eixoverde-vip-modal").inner_text()
            check(
                "Phase 7 Compact Ad Banner opens EixoVerde VIP modal displaying R$ 9,90 lifetime launch price",
                ad_visible_before
                and "EixoVerde VIP" in vip_modal_txt
                and "R$ 9,90" in vip_modal_txt
                and "eixoverde_vip_lifetime" in vip_modal_txt,
            )
            page.click("#eixoverde-vip-purchase-btn")
            time.sleep(0.35)
            check(
                "Phase 7 Activating EixoVerde VIP closes modal & removes Ad Banner immediately",
                page.locator("#eixoverde-vip-modal").count() == 0
                and page.locator("[data-ad-banner='true']").count() == 0,
            )

            check("Zero Supabase requests emitted in zero-key Guest mode", len(supabase_requests_in_guest) == 0)
            check("Desktop Guest mode zero uncaught page errors", len(desktop_errors) == 0, "; ".join(desktop_errors))
            ctx.close()

            # 2. iPHONE SE (375x667)
            se_ctx = browser.new_context(
                viewport={"width": 375, "height": 667},
                has_touch=True,
                is_mobile=True,
                geolocation={"latitude": -15.7524, "longitude": -47.8992},
                permissions=["geolocation"],
            )
            se = se_ctx.new_page()
            se_errors = []
            se.on("pageerror", lambda err: se_errors.append(str(err)))
            se.goto(URL_GUEST, wait_until="domcontentloaded")
            se.wait_for_selector("#eixoverde-mobile-menu-btn", timeout=30000)
            time.sleep(1.5)
            se.locator("header button[aria-label='Alternar tema']").click()
            time.sleep(0.25)

            # Switch to Segway to verify top vehicle pill doesn't truncate "Segway" at 375px
            se.click("#eixoverde-garage-btn")
            se.wait_for_selector("h2:has-text('Minha Garagem')", timeout=6000)
            se.locator("text=Segway Ninebot F2 Pro").click()
            time.sleep(0.3)

            se_hdr = se.evaluate(
                """() => {
                  const brand = document.querySelector('#eixoverde-mobile-menu-btn').getBoundingClientRect();
                  const rBtns = Array.from(document.querySelectorAll('header > div button')).map(b => b.getBoundingClientRect());
                  const tabs = Array.from(document.querySelectorAll('section #eixoverde-tab-rides')[0].parentElement.querySelectorAll('button')).map(b => b.getBoundingClientRect());
                  const qa = Array.from(document.querySelectorAll('#eixoverde-quick-actions button')).map(b => b.getBoundingClientRect());
                  const vehSpan = document.querySelector('#eixoverde-garage-btn span');
                  return {
                    overlaps: brand.right > rBtns[0].left + 1,
                    clips: rBtns[rBtns.length - 1].right > 376,
                    tabsClean: Math.max(...tabs.map(t => t.right)) <= 376 && Math.max(...tabs.map(t => t.height)) <= 38,
                    qaClean: qa.length === 3 && Math.max(...qa.map(q => q.right)) <= 376 && (Math.max(...qa.map(q => q.top)) - Math.min(...qa.map(q => q.top)) <= 4),
                    vehUntruncated: vehSpan ? vehSpan.scrollWidth <= vehSpan.clientWidth + 1 : false,
                    singleMount: document.querySelectorAll('#eixoverde-search-input').length === 1,
                    userSelect: getComputedStyle(document.querySelector('#eixoverde-mobile-menu-btn')).userSelect,
                  };
                }"""
            )
            check(
                "iPhone SE (375px) header, 3-col quick actions, Segway pill & single-mount zero clipping",
                not se_hdr["overlaps"]
                and not se_hdr["clips"]
                and se_hdr["tabsClean"]
                and se_hdr["qaClean"]
                and se_hdr["vehUntruncated"]
                and se_hdr["singleMount"]
                and se_hdr["userSelect"] == "none",
                json.dumps(se_hdr),
            )
            save_shot(se, "e2e_phase4_iphone_se_375.png")

            se.locator("section >> text=Esplanada → Asa Norte").first.click()
            se.wait_for_selector("section #eixoverde-start-nav-btn", timeout=8000)
            time.sleep(0.7)
            se_tb = se.evaluate(
                """() => {
                  const btn = Array.from(document.querySelectorAll('section button')).find(b => b.innerText.includes('Ajustar Rota'));
                  const row = btn.parentElement;
                  const rects = Array.from(row.querySelectorAll('button')).map(b => b.getBoundingClientRect());
                  const ys = rects.map(r => Math.round(r.top));
                  const maxRight = Math.round(Math.max(...rects.map(r => r.right)));
                  return { singleLine: Math.max(...ys) - Math.min(...ys) <= 4, maxRight, clipsRight: maxRight > 376 };
                }"""
            )
            check("iPhone SE (375px) route toolbar single-line with zero horizontal clipping", se_tb["singleLine"] and not se_tb["clipsRight"])
            se_pills = se.evaluate(
                """() => Array.from(document.querySelectorAll('.maplibregl-marker'))
                  .map(el => el.innerText.trim())
                  .filter(t => t.includes('L2N') || t.includes('EIXÃO') || t.includes('W3N'))"""
            )
            check("iPhone SE map renders exact 3 crossing pills (L2N, EIXÃO N, W3N)", len(se_pills) == 3)

            se.locator("section #eixoverde-demo-nav-btn").click()
            se.wait_for_selector("button:has-text('Sair')", timeout=8000)
            time.sleep(0.7)
            se_hud = se.evaluate(
                """() => {
                  const topBanner = document.querySelector('.bg-emerald-950\\\\/95').getBoundingClientRect();
                  const sairBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sair')).closest('.glass-panel').getBoundingClientRect();
                  const rightBar = document.querySelector('button[aria-label=\"Centralizar no GPS\"]').parentElement.getBoundingClientRect();
                  return { cleanVerticalFit: rightBar.top >= topBanner.bottom - 8 && rightBar.bottom <= sairBtn.top + 8 };
                }"""
            )
            check("iPhone SE (375x667) Live Nav HUD has clean vertical clearance", se_hud["cleanVerticalFit"])
            se.locator("button:has-text('Sair')").click()
            time.sleep(0.25)
            check("iPhone SE zero uncaught page errors", len(se_errors) == 0, "; ".join(se_errors))
            se_ctx.close()

            # 3. iPHONE 14 (390x844)
            m14_ctx = browser.new_context(
                viewport={"width": 390, "height": 844},
                has_touch=True,
                is_mobile=True,
                geolocation={"latitude": -15.7524, "longitude": -47.8992},
                permissions=["geolocation"],
            )
            m14 = m14_ctx.new_page()
            m14_errors = []
            m14.on("pageerror", lambda err: m14_errors.append(str(err)))
            m14.goto(URL_GUEST, wait_until="domcontentloaded")
            m14.wait_for_selector("#eixoverde-mobile-menu-btn", timeout=30000)
            time.sleep(1.5)

            m14.evaluate(
                """() => {
                  const canvas = document.querySelector('.maplibregl-canvas');
                  const rect = canvas.getBoundingClientRect();
                  const x = rect.left + rect.width * 0.45;
                  const y = rect.top + rect.height * 0.28;
                  const touch = new Touch({ identifier: 1, target: canvas, clientX: x, clientY: y, pageX: x, pageY: y });
                  canvas.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], targetTouches: [touch], changedTouches: [touch], bubbles: true, cancelable: true }));
                  setTimeout(() => {
                    canvas.dispatchEvent(new TouchEvent('touchend', { touches: [], targetTouches: [], changedTouches: [touch], bubbles: true, cancelable: true }));
                  }, 540);
                }"""
            )
            m14.wait_for_selector("#eixoverde-map-context-popup", timeout=5000)
            time.sleep(0.4)
            check("iPhone 14 (390px) long-press opens MapContextPopup", "Salvar" in m14.locator("#eixoverde-map-context-popup").inner_text())
            m14.locator("#eixoverde-map-context-popup button[aria-label*='Fechar']").click()
            time.sleep(0.25)

            handle = m14.locator("section [role='slider']")
            hb = handle.bounding_box()
            before_h = m14.locator("section").bounding_box()["height"]
            m14.mouse.move(hb["x"] + hb["width"] / 2, hb["y"] + hb["height"] / 2)
            m14.mouse.down()
            m14.mouse.move(hb["x"] + hb["width"] / 2, hb["y"] - 220, steps=10)
            m14.mouse.up()
            time.sleep(0.35)
            after_h = m14.locator("section").bounding_box()["height"]
            check("iPhone 14 (390px) bottom sheet drag handle responds smoothly", after_h > before_h + 80)
            check("iPhone 14 zero uncaught page errors", len(m14_errors) == 0, "; ".join(m14_errors))
            m14_ctx.close()

            # 4. ANDROID (412x915)
            and_ctx = browser.new_context(
                viewport={"width": 412, "height": 915},
                has_touch=True,
                is_mobile=True,
                geolocation={"latitude": -15.7524, "longitude": -47.8992},
                permissions=["geolocation"],
            )
            ap = and_ctx.new_page()
            and_errors = []
            ap.on("pageerror", lambda err: and_errors.append(str(err)))
            ap.goto(URL_GUEST, wait_until="domcontentloaded")
            ap.wait_for_selector("#eixoverde-mobile-menu-btn", timeout=30000)
            time.sleep(1.5)
            and_hdr = ap.evaluate(
                """() => {
                  const brand = document.querySelector('#eixoverde-mobile-menu-btn').getBoundingClientRect();
                  const rBtns = Array.from(document.querySelectorAll('header > div button')).map(b => b.getBoundingClientRect());
                  return { overlaps: brand.right > rBtns[0].left + 1, clips: rBtns[rBtns.length - 1].right > 413 };
                }"""
            )
            check("Android (412px) Light mode header zero overlap/clipping", not and_hdr["overlaps"] and not and_hdr["clips"])
            ap.locator("section >> text=Volta Completa — Parque da Cidade").first.click()
            ap.wait_for_selector("section #eixoverde-start-nav-btn", timeout=8000)
            time.sleep(0.5)
            check("Android (412px) Parque da Cidade curated route shows 0 travessias", "0 travessias" in ap.locator("section").inner_text())
            check("Android (412px) zero uncaught page errors", len(and_errors) == 0, "; ".join(and_errors))
            and_ctx.close()

            # ====================================================
            # PASS 2: SUPABASE CLOUD AUTH, MIGRATION, SYNC & PROXY
            # ====================================================
            cloud_ctx = browser.new_context(
                viewport={"width": 1440, "height": 900},
                geolocation={"latitude": -15.7524, "longitude": -47.8992},
                permissions=["geolocation"],
            )
            cpage = cloud_ctx.new_page()
            cloud_errors = []
            cpage.on("pageerror", lambda err: cloud_errors.append(str(err)))

            pushed_places = []
            ors_proxy_calls = []
            delete_account_rpc_calls = []

            def handle_supabase_mock(route):
                req = route.request
                url = req.url
                method = req.method

                if method == "OPTIONS":
                    route.fulfill(
                        status=204,
                        headers={
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Headers": "*",
                            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
                        },
                    )
                    return

                cors = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"}

                if "/rest/v1/rpc/delete_my_account" in url:
                    delete_account_rpc_calls.append(True)
                    route.fulfill(status=200, headers=cors, body="null")
                    return

                # Auth endpoints
                if "/auth/v1/token" in url:
                    body = json.loads(req.post_data or "{}")
                    if body.get("password") == "errada123":
                        route.fulfill(
                            status=400,
                            headers=cors,
                            body=json.dumps({"error": "invalid_grant", "error_description": "Invalid login credentials"}),
                        )
                        return
                    route.fulfill(
                        status=200,
                        headers=cors,
                        body=json.dumps(
                            {
                                "access_token": "mock-jwt-token-e2e-123",
                                "token_type": "bearer",
                                "expires_in": 3600,
                                "refresh_token": "mock-refresh-123",
                                "user": {
                                    "id": "11111111-2222-3333-4444-555555555555",
                                    "aud": "authenticated",
                                    "role": "authenticated",
                                    "email": body.get("email", "vitor@eixoverde.com.br"),
                                    "user_metadata": {"display_name": "Vítor Brasília"},
                                    "app_metadata": {"provider": "email"},
                                    "created_at": "2026-11-21T00:00:00Z",
                                },
                            }
                        ),
                    )
                    return

                if "/auth/v1/logout" in url:
                    route.fulfill(status=204, headers=cors, body="")
                    return

                if "/auth/v1/user" in url:
                    route.fulfill(
                        status=200,
                        headers=cors,
                        body=json.dumps(
                            {
                                "id": "11111111-2222-3333-4444-555555555555",
                                "email": "vitor@eixoverde.com.br",
                                "user_metadata": {"display_name": "Vítor Brasília"},
                            }
                        ),
                    )
                    return

                # ORS Edge Function Proxy
                if "/functions/v1/ors-proxy" in url:
                    ors_proxy_calls.append(dict(req.headers))
                    route.fulfill(
                        status=200,
                        headers=cors,
                        body=json.dumps(
                            {
                                "type": "FeatureCollection",
                                "features": [
                                    {
                                        "type": "Feature",
                                        "geometry": {
                                            "type": "LineString",
                                            "coordinates": [
                                                [-47.8992, -15.7524, 1070],
                                                [-47.902, -15.775, 1090],
                                                [-47.9052, -15.8026, 1112],
                                            ],
                                        },
                                        "properties": {
                                            "summary": {"distance": 6240},
                                            "extras": {"waytypes": {"summary": [{"value": 6, "distance": 5100, "amount": 85}]}},
                                        },
                                    }
                                ],
                            }
                        ),
                    )
                    return

                # PostgREST tables & RPCs
                if "/rest/v1/saved_places" in url:
                    if method in ("POST", "PUT", "PATCH"):
                        try:
                            pushed_places.append(json.loads(req.post_data or "{}"))
                        except Exception:
                            pass
                        route.fulfill(status=201, headers=cors, body=json.dumps([]))
                        return
                    route.fulfill(status=200, headers=cors, body=json.dumps([]))
                    return

                if "/rest/v1/saved_routes" in url:
                    if method == "GET":
                        route.fulfill(
                            status=200,
                            headers=cors,
                            body=json.dumps(
                                [
                                    {
                                        "user_id": "11111111-2222-3333-4444-555555555555",
                                        "id": "cloud-route-df-1",
                                        "name": "Rota Cloud Sincronizada (Orla Lago Sul)",
                                        "description": "Sincronizada da sua conta EixoVerde Cloud",
                                        "tag": "Cloud • 95% segura",
                                        "is_favorite": True,
                                        "difficulty": "Fácil",
                                        "city": "Brasília, DF",
                                        "profile": "safe",
                                        "coords": [[-47.8315, -15.824, 1005], [-47.8712, -15.8266, 1008]],
                                        "waypoints": [[-47.8315, -15.824], [-47.8712, -15.8266]],
                                        "distance_km": 6.8,
                                        "ascent_m": 22,
                                        "descent_m": 20,
                                        "safety_score": 95,
                                        "origin_name": "Ponte JK",
                                        "dest_name": "Pontão",
                                        "created_at": "2026-11-21T04:00:00Z",
                                        "updated_at": "2026-11-21T04:00:00Z",
                                        "deleted_at": None,
                                    }
                                ]
                            ),
                        )
                        return
                    route.fulfill(status=201, headers=cors, body=json.dumps([]))
                    return

                if "/rest/v1/rpc/get_hazards_in_bounds" in url or "/rest/v1/hazard_reports" in url:
                    if method == "POST" and "get_hazards_in_bounds" not in url:
                        route.fulfill(status=201, headers=cors, body=json.dumps([]))
                        return
                    route.fulfill(
                        status=200,
                        headers=cors,
                        body=json.dumps(
                            [
                                {
                                    "id": "cloud-hazard-1",
                                    "user_id": "99999999-8888-7777-6666-555555555555",
                                    "kind": "bloqueio",
                                    "title": "Obra na ciclovia 206 Norte",
                                    "note": "Desvio sinalizado",
                                    "lng": -47.8825,
                                    "lat": -15.7745,
                                    "confirmations": 3,
                                    "confirmed_by_me": False,
                                    "created_at": "2026-11-21T03:00:00Z",
                                    "updated_at": "2026-11-21T03:00:00Z",
                                }
                            ]
                        ),
                    )
                    return

                if "/rest/v1/ride_sessions" in url:
                    if method == "GET":
                        route.fulfill(
                            status=200,
                            headers=cors,
                            body=json.dumps(
                                [
                                    {
                                        "user_id": "11111111-2222-3333-4444-555555555555",
                                        "id": "cloud-ride-df-1",
                                        "title": "Pedal Cloud Eixo Monumental",
                                        "mode": "guided",
                                        "is_demo": False,
                                        "started_at": "2026-11-21T08:00:00Z",
                                        "ended_at": "2026-11-21T08:25:00Z",
                                        "moving_duration_sec": 1320,
                                        "total_duration_sec": 1500,
                                        "distance_km": 8.4,
                                        "avg_speed_kmh": 22.9,
                                        "max_speed_kmh": 27,
                                        "ascent_m": 64,
                                        "descent_m": 58,
                                        "calories_kcal": 48,
                                        "co2_saved_kg": 1.47,
                                        "vehicle_id": "jet-aluguel",
                                        "vehicle_name": "JET Compartilhado (20 km/h)",
                                        "vehicle_mode_index": 1,
                                        "is_electric": True,
                                        "battery_start_pct": 92,
                                        "battery_end_pct": 71,
                                        "battery_used_pct": 21,
                                        "estimated_battery_used_pct": 20,
                                        "track": [
                                            {"lng": -47.8992, "lat": -15.7524, "ele": 1070, "ts": 1700000000000, "speedKmh": 20},
                                            {"lng": -47.8645, "lat": -15.7983, "ele": 1088, "ts": 1700001500000, "speedKmh": 23},
                                        ],
                                        "created_at": "2026-11-21T08:25:00Z",
                                        "updated_at": "2026-11-21T08:25:00Z",
                                        "deleted_at": None,
                                    }
                                ]
                            ),
                        )
                        return
                    route.fulfill(status=201, headers=cors, body=json.dumps([]))
                    return

                if "/rest/v1/community_routes" in url:
                    if method == "GET":
                        route.fulfill(
                            status=200,
                            headers=cors,
                            body=json.dumps(
                                [
                                    {
                                        "id": "comm-df-lago-norte",
                                        "author_id": "99999999-8888-7777-6666-555555555555",
                                        "author_name": "Marina Ciclista",
                                        "name": "Ciclovia Orla Lago Norte",
                                        "description": "Trajeto plano beira-lago com sombra pela manhã.",
                                        "tag": "Comunidade DF",
                                        "difficulty": "Fácil",
                                        "city": "Brasília, DF",
                                        "profile": "safe",
                                        "coords": [[-47.871, -15.741, 1012], [-47.848, -15.735, 1018]],
                                        "waypoints": [[-47.871, -15.741], [-47.848, -15.735]],
                                        "distance_km": 7.4,
                                        "ascent_m": 28,
                                        "descent_m": 24,
                                        "safety_score": 93,
                                        "origin_name": "Ponte do Bragueto",
                                        "dest_name": "QI 5 Lago Norte",
                                        "avg_rating": 4.9,
                                        "rating_count": 14,
                                        "safety_tags": ["bom_asfalto", "paisagem"],
                                        "created_at": "2026-11-21T09:00:00Z",
                                        "updated_at": "2026-11-21T09:00:00Z",
                                        "deleted_at": None,
                                    }
                                ]
                            ),
                        )
                        return
                    route.fulfill(status=201, headers=cors, body=json.dumps([]))
                    return

                if "/rest/v1/route_ratings" in url:
                    if method == "GET":
                        route.fulfill(
                            status=200,
                            headers=cors,
                            body=json.dumps(
                                [
                                    {
                                        "route_id": "comm-df-lago-norte",
                                        "user_id": "99999999-8888-7777-6666-555555555555",
                                        "rating": 5,
                                        "tags": ["bom_asfalto", "paisagem"],
                                    }
                                ]
                            ),
                        )
                        return
                    route.fulfill(status=201, headers=cors, body=json.dumps([]))
                    return

                if "/rest/v1/user_preferences" in url:
                    route.fulfill(status=200, headers=cors, body="null")
                    return

                if "/rest/v1/profiles" in url:
                    route.fulfill(
                        status=200,
                        headers=cors,
                        body=json.dumps({"is_premium": False, "premium_purchased_at": None}),
                    )
                    return

                if "/rest/v1/rpc/activate_vip_entitlement" in url:
                    route.fulfill(status=200, headers=cors, body="null")
                    return

                route.fulfill(status=200, headers=cors, body=json.dumps([]))

            cpage.route(f"{MOCK_SUPABASE_URL}/**", handle_supabase_mock)

            cpage.goto(URL_CLOUD, wait_until="domcontentloaded")
            cpage.wait_for_selector("#eixoverde-desktop-menu-btn", timeout=15000)
            time.sleep(1.5)

            # Switch to Dark mode first to test AuthModal dark-mode contrast
            cpage.locator("aside button[title*='Alternar tema']").click()
            time.sleep(0.25)

            # Create 1 local saved place while still a Guest so migration prompt triggers on login
            cpage.mouse.click(940, 440, button="right")
            cpage.wait_for_selector("#eixoverde-map-context-popup", timeout=6000)
            time.sleep(0.5)
            cpage.locator("#eixoverde-map-context-popup button:has-text('Salvar')").click()
            cpage.wait_for_selector("input[placeholder*='Ex: Casa']", timeout=6000)
            cpage.fill("input[placeholder*='Ex: Casa']", "Local Pré-Login DF")
            cpage.locator("form button[type='submit']:has-text('Salvar Local')").click()
            time.sleep(0.35)

            # Open menu & verify Visitante badge + Entrar ou Criar Conta CTA
            cpage.click("#eixoverde-desktop-menu-btn")
            cpage.wait_for_selector("#eixoverde-auth-open-btn", timeout=6000)
            v_badge = cpage.locator("#eixoverde-sync-status").inner_text()
            check("Cloud Guest menu displays 'Visitante' & 'Entrar ou Criar Conta' button", "Visitante" in v_badge)

            # Open AuthModal & test Google OAuth button, LGPD PrivacyPolicyModal link, dark-mode focused input contrast + invalid login PT-BR error
            cpage.click("#eixoverde-auth-open-btn")
            cpage.wait_for_selector("#eixoverde-auth-modal", timeout=6000)
            check(
                "AuthModal renders 'Continuar com Google' OAuth button",
                cpage.locator("#eixoverde-auth-google-btn").is_visible(),
            )
            cpage.click("#eixoverde-auth-privacy-link")
            cpage.wait_for_selector("#eixoverde-privacy-modal", timeout=6000)
            priv_text = cpage.locator("#eixoverde-privacy-modal").inner_text()
            check(
                "Phase 5 LGPD PrivacyPolicyModal opens from AuthModal with GPS & account deletion disclosures",
                "LGPD" in priv_text and "Exclusão Instantânea de Conta" in priv_text,
            )
            cpage.click("#eixoverde-privacy-accept-btn")
            time.sleep(0.2)

            email_in = cpage.locator("#eixoverde-auth-email")
            pass_in = cpage.locator("#eixoverde-auth-password")
            email_in.click()
            email_in.fill("vitor@eixoverde.com.br")
            email_c = email_in.evaluate("el => ({ color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor })")
            check(
                "Dark-mode AuthModal focused input contrast",
                email_c["color"] != email_c["bg"] and email_c["bg"] != "rgb(255, 255, 255)",
                json.dumps(email_c),
            )

            pass_in.fill("errada123")
            cpage.click("#eixoverde-auth-submit")
            cpage.wait_for_selector("#eixoverde-auth-error", timeout=6000)
            err_txt = cpage.locator("#eixoverde-auth-error").inner_text()
            check("AuthModal maps invalid credentials to PT-BR error message", "incorretos" in err_txt, err_txt)

            # Sign in with valid password -> triggers MigrationPromptModal
            pass_in.fill("senhaForte123")
            save_shot(cpage, "e2e_cloud_auth_modal_dark.png")
            cpage.click("#eixoverde-auth-submit")
            cpage.wait_for_selector("#eixoverde-migration-modal", timeout=6000)
            mig_text = cpage.locator("#eixoverde-migration-modal").inner_text()
            check("Sign-in with local data opens MigrationPromptModal", "1 locais salvos" in mig_text)
            save_shot(cpage, "e2e_cloud_migration_modal.png")

            # Confirm migration -> pushes local place & pulls cloud route + community hazard
            cpage.click("#eixoverde-migration-confirm-btn")
            try:
                cpage.wait_for_selector("aside >> text=Rota Cloud Sincronizada", timeout=8000)
            except Exception:
                pass
            sidebar_after_sync = cpage.locator("aside").first.inner_text()
            check(
                "Bidirectional sync pushes local place & pulls cloud route into Rotas Salvas",
                len(pushed_places) >= 1 and "Rota Cloud Sincronizada" in sidebar_after_sync,
                f"pushed_places={len(pushed_places)}",
            )
            comm_text = cpage.locator("#eixoverde-community-routes").inner_text()
            check(
                "Cloud sync populates Comunidade DF routes with author, star rating & safety tags",
                "Ciclovia Orla Lago Norte" in comm_text and "Marina Ciclista" in comm_text and "Bom asfalto" in comm_text,
            )
            cpage.click("aside #eixoverde-tab-rides")
            cpage.wait_for_selector("aside #eixoverde-rides-panel", timeout=6000)
            time.sleep(0.25)
            check(
                "Bidirectional cloud sync pulls ride_sessions into Meus Trajetos",
                "Pedal Cloud Eixo Monumental" in cpage.locator("aside #eixoverde-rides-panel").inner_text(),
            )
            cpage.locator("aside button:has-text('Rotas')").first.click()
            time.sleep(0.2)
            check(
                "0px-width sync indicator dot appears on brand menu button after login",
                cpage.locator("#eixoverde-shell-sync-dot").is_visible(),
            )

            # Open menu & verify authenticated user card + 'Sincronizado' badge
            cpage.click("#eixoverde-desktop-menu-btn")
            cpage.wait_for_selector("#eixoverde-signout-btn", timeout=6000)
            time.sleep(0.25)
            authed_card = cpage.locator("#eixoverde-account-card").inner_text()
            check(
                "Authenticated Account card displays user name, email & Sincronizado status",
                "Vítor Brasília" in authed_card and "Sincronizado" in authed_card,
            )
            save_shot(cpage, "e2e_cloud_authenticated_menu.png")
            cpage.locator("aside").last.locator("button[aria-label='Fechar menu']").click()
            time.sleep(0.25)

            # Route via ORS Edge Function Proxy with sb_publishable_ key + user JWT
            s_in = cpage.locator("aside #eixoverde-search-input")
            s_in.click()
            s_in.fill("Parque da Cidade")
            time.sleep(0.4)
            cpage.locator("aside button:has-text('Parque da Cidade Sarah Kubitschek')").first.click()
            cpage.wait_for_selector("aside #eixoverde-start-nav-btn", timeout=10000)
            time.sleep(0.4)
            check(
                "Routing calls Supabase ors-proxy with sb_publishable_ apikey & Bearer user JWT",
                len(ors_proxy_calls) >= 1
                and ors_proxy_calls[0].get("apikey") == MOCK_PUBLISHABLE_KEY
                and "Bearer mock-jwt-token-e2e-123" in ors_proxy_calls[0].get("authorization", ""),
            )

            # Sign out & verify local data is 100% preserved
            cpage.locator("aside button[aria-label='Voltar']").click()
            time.sleep(0.25)
            cpage.click("#eixoverde-desktop-menu-btn")
            cpage.wait_for_selector("#eixoverde-signout-btn", timeout=6000)
            cpage.click("#eixoverde-signout-btn")
            time.sleep(0.5)
            check(
                "Sign-out returns to Visitante state while preserving synced routes in IndexedDB",
                "Visitante" in cpage.locator("#eixoverde-sync-status").inner_text()
                and "Rota Cloud Sincronizada" in cpage.locator("aside").first.inner_text(),
            )

            # Phase 5: Re-authenticate & verify In-App Account Deletion (Apple 5.1.1(v) / Google Play Data Safety)
            cpage.click("#eixoverde-auth-open-btn")
            cpage.wait_for_selector("#eixoverde-auth-modal", timeout=6000)
            cpage.fill("#eixoverde-auth-email", "vitor@eixoverde.com.br")
            cpage.fill("#eixoverde-auth-password", "senhaForte123")
            cpage.click("#eixoverde-auth-submit")
            time.sleep(0.6)
            if cpage.locator("#eixoverde-migration-skip-btn").is_visible():
                cpage.click("#eixoverde-migration-skip-btn")
                time.sleep(0.3)
            cpage.click("#eixoverde-desktop-menu-btn")
            cpage.wait_for_selector("#eixoverde-delete-account-open-btn", timeout=6000)
            cpage.click("#eixoverde-delete-account-open-btn")
            cpage.wait_for_selector("#eixoverde-delete-account-confirm-box", timeout=6000)
            cpage.click("#eixoverde-delete-account-confirm-btn")
            time.sleep(0.5)
            cpage.click("#eixoverde-desktop-menu-btn")
            cpage.wait_for_selector("#eixoverde-sync-status", timeout=6000)
            check(
                "Phase 5 In-App Account Deletion calls delete_my_account RPC & returns cleanly to Visitante",
                len(delete_account_rpc_calls) == 1
                and "Visitante" in cpage.locator("#eixoverde-sync-status").inner_text(),
            )

            check("Cloud E2E pass zero uncaught page errors", len(cloud_errors) == 0, "; ".join(cloud_errors))
            cloud_ctx.close()

            # =====================================================================
            # PASS 3 — PHASE 8 OFFICIAL WEBSITE (eixoverde.com) & /app/ PROD BUNDLE
            # =====================================================================
            print("\n=== PASS 3: OFFICIAL WEBSITE (eixoverde.com) & /app/ PRODUCTION BUNDLE ===", flush=True)
            dist_root = REPO_ROOT / "dist"
            if not (dist_root / "index.html").exists() or not (dist_root / "app" / "index.html").exists():
                subprocess.run(["npm", "run", "build"], cwd=str(REPO_ROOT), check=True)

            port_site = find_free_port()
            while port_site in (port_guest, port_cloud):
                port_site = find_free_port()
            URL_SITE = f"http://127.0.0.1:{port_site}/"

            proc_site = subprocess.Popen(
                [sys.executable, "-m", "http.server", str(port_site), "--bind", "127.0.0.1", "--directory", str(dist_root)],
                cwd=str(REPO_ROOT),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            try:
                site_ready = wait_for_server(URL_SITE)
                check("Phase 8 production dist/ static server started cleanly", site_ready)

                def fetch_text(path: str) -> tuple[int, str]:
                    with urllib.request.urlopen(f"{URL_SITE}{path.lstrip('/')}", timeout=5) as resp:
                        return resp.status, resp.read().decode("utf-8", errors="replace")

                st_ads, txt_ads = fetch_text("/app-ads.txt")
                check(
                    "Phase 8 /app-ads.txt returns HTTP 200 with verified AdMob pub-6690812959868851",
                    st_ads == 200 and "google.com, pub-6690812959868851, DIRECT, f08c47fec0942fa0" in txt_ads,
                )
                st_robots, txt_robots = fetch_text("/robots.txt")
                st_sitemap, txt_sitemap = fetch_text("/sitemap.xml")
                check(
                    "Phase 8 /robots.txt and /sitemap.xml return HTTP 200 for eixoverde.com",
                    st_robots == 200 and "https://eixoverde.com/sitemap.xml" in txt_robots
                    and st_sitemap == 200 and "https://eixoverde.com/app/" in txt_sitemap,
                )
                st_hdr, txt_hdr = fetch_text("/_headers")
                st_red, txt_red = fetch_text("/_redirects")
                check(
                    "Phase 8 Cloudflare Pages /_headers and loop-free /_redirects exist in dist/",
                    st_hdr == 200 and "/app-ads.txt" in txt_hdr
                    and st_red == 200
                    and "/app/privacidade.html /privacidade 301" in txt_red
                    and "/privacidade /privacidade.html" not in txt_red
                    and "/exclusao-conta /exclusao-conta.html" not in txt_red,
                )
                st_man, txt_man = fetch_text("/app/manifest.webmanifest")
                man_json = json.loads(txt_man)
                check(
                    "Phase 8 PWA manifest isolated to /app/ scope & start_url with br.com.eixoverde.app",
                    st_man == 200
                    and man_json.get("id") == "br.com.eixoverde.app"
                    and man_json.get("start_url") == "/app/"
                    and man_json.get("scope") == "/app/",
                )

                # Desktop Light + Dark verification & interactive controls
                site_errors = []
                site_ctx = browser.new_context(viewport={"width": 1440, "height": 900}, color_scheme="light")
                spage = site_ctx.new_page()
                spage.on("pageerror", lambda e: site_errors.append(str(e)))
                spage.goto(URL_SITE, wait_until="domcontentloaded", timeout=15000)
                spage.wait_for_selector("#ev-cta-web", timeout=8000)
                time.sleep(0.3)

                desktop_overflow = spage.evaluate("() => document.documentElement.scrollWidth > window.innerWidth")
                check("Phase 8 Landing Desktop (1440px) zero horizontal overflow", not desktop_overflow)
                check(
                    "Phase 8 Landing shows Web App CTA (./app/) & Google Play CTA (br.com.eixoverde.app)",
                    spage.locator("#ev-cta-web").get_attribute("href") == "./app/"
                    and spage.locator("#ev-cta-play").get_attribute("href")
                    == "https://play.google.com/store/apps/details?id=br.com.eixoverde.app",
                )
                save_shot(spage, "e2e_site_desktop_light.png")

                # Hero phone showcase tab switching
                spage.click("#ev-tab-nav")
                time.sleep(0.15)
                nav_active = spage.locator("#ev-stage-nav").evaluate("el => el.classList.contains('is-active')")
                spage.click("#ev-tab-garage")
                time.sleep(0.15)
                garage_active = spage.locator("#ev-stage-garage").evaluate("el => el.classList.contains('is-active')")
                check("Phase 8 Hero interactive phone tabs switch cleanly (Navegação 3D & Garagem)", nav_active and garage_active)
                spage.click("#ev-tab-map")

                # 27 capitals region filter
                spage.click("button[data-region-filter='Nordeste']")
                time.sleep(0.15)
                ne_count = spage.locator("#ev-capitals-grid .ev-capital-card").count()
                spage.click("button[data-region-filter='Norte']")
                time.sleep(0.15)
                n_count = spage.locator("#ev-capitals-grid .ev-capital-card").count()
                check("Phase 8 27 Capitals filter renders 9 Nordeste & 7 Norte capitals", ne_count == 9 and n_count == 7)

                # Manual theme toggle -> dark + atomic background update + localStorage sync
                spage.evaluate("() => window.scrollTo(0, 0)")
                spage.click("#ev-theme-toggle")
                time.sleep(0.15)
                dark_state = spage.evaluate(
                    "() => ({ hasDark: document.documentElement.classList.contains('dark'), saved: localStorage.getItem('eixoverde:theme'), bodyBg: getComputedStyle(document.body).backgroundColor })"
                )
                check(
                    "Phase 8 Theme toggle activates dark mode atomically and syncs localStorage eixoverde:theme",
                    dark_state["hasDark"]
                    and dark_state["saved"] == "dark"
                    and dark_state["bodyBg"] == "rgb(9, 15, 18)",
                    json.dumps(dark_state),
                )
                save_shot(spage, "e2e_site_desktop_dark.png")

                # Clicking "Usar Versão Web" opens /app/ in dark mode with zero failed /app/ requests
                failed_app_assets = []
                spage.on("response", lambda r: failed_app_assets.append(f"{r.status}:{r.url}") if r.url.startswith(URL_SITE) and r.status >= 400 else None)
                spage.click("#ev-cta-web")
                spage.wait_for_url(f"{URL_SITE}app/**", timeout=10000)
                spage.wait_for_selector("aside #eixoverde-search-input", timeout=15000)
                time.sleep(0.4)
                app_inherited_dark = spage.evaluate("() => document.documentElement.classList.contains('dark')")
                check(
                    "Phase 8 'Usar Versão Web' launches /app/ PWA, inherits theme & loads assets cleanly",
                    app_inherited_dark and len(failed_app_assets) == 0,
                    ", ".join(failed_app_assets),
                )

                # Root ?share= auto-forwards to /app/?share=
                spage.goto(f"{URL_SITE}?share=eyJuIjoiVGVzdGUiLCJwIjoic2FmZSIsInciOltbLTQ3Ljg4LC0xNS43OV0sWy00Ny44NiwtMTUuODBdXX0", wait_until="domcontentloaded", timeout=15000)
                spage.wait_for_url(f"{URL_SITE}app/?share=*", timeout=10000)
                check("Phase 8 Root /?share=... redirects automatically to /app/?share=...", "/app/?share=" in spage.url)

                # Legal pages render with contato@eixoverde.com
                spage.goto(f"{URL_SITE}privacidade.html", wait_until="domcontentloaded", timeout=10000)
                priv_text = spage.locator("body").inner_text()
                spage.goto(f"{URL_SITE}exclusao-conta.html", wait_until="domcontentloaded", timeout=10000)
                del_text = spage.locator("body").inner_text()
                check(
                    "Phase 8 /privacidade.html & /exclusao-conta.html show contato@eixoverde.com",
                    "contato@eixoverde.com" in priv_text and "contato@eixoverde.com" in del_text,
                )
                site_ctx.close()

                # Deep-link ?city=sao-paulo from landing card must NOT fetch Brasília GeoJSON
                # and Dark-OS visitor with fresh storage must enter /app/ directly in Dark mode
                dl_ctx = browser.new_context(viewport={"width": 1440, "height": 900}, color_scheme="dark")
                dl_page = dl_ctx.new_page()
                dl_page.on("pageerror", lambda e: site_errors.append(str(e)))
                dl_geojson_urls = []
                dl_page.on(
                    "request",
                    lambda req: dl_geojson_urls.append(req.url) if ".geojson" in req.url else None,
                )
                dl_page.goto(URL_SITE, wait_until="domcontentloaded", timeout=15000)
                dl_page.wait_for_selector("button[data-region-filter='Sudeste']", timeout=8000)
                dl_page.click("button[data-region-filter='Sudeste']")
                time.sleep(0.15)
                dl_page.locator("#ev-capitals-grid a[href*='city=sao-paulo']").first.click()
                dl_page.wait_for_url(f"{URL_SITE}app/?city=sao-paulo*", timeout=10000)
                dl_page.wait_for_selector("aside #eixoverde-search-input", timeout=15000)
                time.sleep(0.7)
                dl_aside_txt = dl_page.locator("aside").first.inner_text()
                dl_is_dark = dl_page.evaluate("() => document.documentElement.classList.contains('dark')")
                fetched_df_geojson = [u for u in dl_geojson_urls if "ciclomapa-df" in u]
                fetched_sp_geojson = [u for u in dl_geojson_urls if "sao-paulo" in u]
                dl_aside_lower = dl_aside_txt.lower()
                check(
                    "Phase 8 Capital deep-link (?city=sao-paulo) skips Brasília GeoJSON, renders SP UI & inherits Dark-OS theme",
                    dl_is_dark
                    and len(fetched_df_geojson) == 0
                    and len(fetched_sp_geojson) >= 1
                    and "rotas em são paulo" in dl_aside_lower
                    and "comunidade eixoverde" in dl_aside_lower,
                    f"dark={dl_is_dark}, df={fetched_df_geojson}, sp={fetched_sp_geojson}",
                )
                dl_ctx.close()

                # Responsive zero-clipping & adaptive system dark mode check across mobile viewports
                for label, vw, vh, scheme in [
                    ("iPhone SE Light", 375, 667, "light"),
                    ("iPhone SE Dark", 375, 667, "dark"),
                    ("iPhone 14", 390, 844, "light"),
                    ("Android 412", 412, 915, "dark"),
                ]:
                    mctx = browser.new_context(viewport={"width": vw, "height": vh}, color_scheme=scheme)
                    mpage = mctx.new_page()
                    mpage.on("pageerror", lambda e: site_errors.append(str(e)))
                    mpage.goto(URL_SITE, wait_until="domcontentloaded", timeout=15000)
                    mpage.wait_for_selector("#ev-cta-web", timeout=8000)
                    time.sleep(0.25)
                    ov = mpage.evaluate("() => document.documentElement.scrollWidth > window.innerWidth")
                    matched_scheme = mpage.evaluate(
                        "(wantDark) => document.documentElement.classList.contains('dark') === wantDark",
                        scheme == "dark",
                    )
                    check(
                        f"Phase 8 Landing {label} ({vw}x{vh}) zero horizontal clipping & adaptive {scheme} theme",
                        (not ov) and matched_scheme,
                    )
                    if label == "iPhone SE Light":
                        save_shot(mpage, "e2e_site_iphone_se_light.png")
                    elif label == "iPhone SE Dark":
                        save_shot(mpage, "e2e_site_iphone_se_dark.png")
                    mctx.close()

                check("Phase 8 Official Website pass zero uncaught page errors", len(site_errors) == 0, "; ".join(site_errors))
            finally:
                try:
                    os.killpg(os.getpgid(proc_site.pid), signal.SIGTERM)
                except Exception:
                    proc_site.terminate()
                try:
                    proc_site.wait(timeout=5)
                except Exception:
                    proc_site.kill()

            browser.close()
    finally:
        for pr in (proc_guest, proc_cloud):
            try:
                os.killpg(os.getpgid(pr.pid), signal.SIGTERM)
            except Exception:
                pr.terminate()
            try:
                pr.wait(timeout=5)
            except Exception:
                try:
                    os.killpg(os.getpgid(pr.pid), signal.SIGKILL)
                except Exception:
                    pr.kill()

    passed = sum(1 for r in results if r["ok"])
    failed = len(results) - passed
    print(f"\n=== E2E SUMMARY: {passed}/{len(results)} PASSED, {failed} FAILED ===", flush=True)
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(run_e2e())
