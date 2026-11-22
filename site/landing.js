(() => {
  const THEME_STORAGE_KEY = 'eixoverde:theme';

  // === 1. Adaptive System Theme + Manual Toggle (Synced with /app/) ===
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById('ev-theme-toggle');
  const systemDarkQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-pressed', String(isDark));
      themeToggleBtn.setAttribute(
        'aria-label',
        isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'
      );
      themeToggleBtn.title = isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro';
    }
  }

  function getStoredTheme() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch {
      return null;
    }
  }

  const initialTheme = getStoredTheme() ?? (systemDarkQuery?.matches ? 'dark' : 'light');
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      root.classList.add('ev-no-trans');
      applyTheme(next);
      void root.offsetWidth;
      requestAnimationFrame(() => root.classList.remove('ev-no-trans'));
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore private browsing storage restriction
      }
    });
  }

  if (systemDarkQuery && typeof systemDarkQuery.addEventListener === 'function') {
    systemDarkQuery.addEventListener('change', (evt) => {
      // Only auto-switch when user has not manually overridden theme
      if (!getStoredTheme()) {
        applyTheme(evt.matches ? 'dark' : 'light');
      }
    });
  }

  // === 2. Interactive Hero Phone Stage Tabs ===
  const stageTabs = Array.from(document.querySelectorAll('[data-stage-tab]'));
  const stagePanels = Array.from(document.querySelectorAll('[data-stage-panel]'));

  function activateStage(key) {
    stageTabs.forEach((tab) => {
      const active = tab.getAttribute('data-stage-tab') === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    stagePanels.forEach((panel) => {
      const active = panel.getAttribute('data-stage-panel') === key;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
  }

  stageTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-stage-tab');
      if (key) activateStage(key);
    });
    tab.addEventListener('keydown', (evt) => {
      if (evt.key !== 'ArrowRight' && evt.key !== 'ArrowLeft') return;
      evt.preventDefault();
      const nextIdx = (idx + (evt.key === 'ArrowRight' ? 1 : -1) + stageTabs.length) % stageTabs.length;
      const nextTab = stageTabs[nextIdx];
      const key = nextTab?.getAttribute('data-stage-tab');
      if (key) {
        activateStage(key);
        nextTab.focus();
      }
    });
  });

  // === 3. Interactive 27 Brazilian Capitals Explorer ===
  const CAPITALS = [
    { slug: 'brasilia', name: 'Brasília', uf: 'DF', region: 'Centro-Oeste', km: 690, share: 'Bike Brasília & JET', featured: true },
    { slug: 'goiania', name: 'Goiânia', uf: 'GO', region: 'Centro-Oeste', km: 127, share: 'GynDebike' },
    { slug: 'campo-grande', name: 'Campo Grande', uf: 'MS', region: 'Centro-Oeste', km: 126, share: 'Ciclovias Morena' },
    { slug: 'cuiaba', name: 'Cuiabá', uf: 'MT', region: 'Centro-Oeste', km: 153, share: 'Ciclovias Cuiabá' },
    { slug: 'sao-paulo', name: 'São Paulo', uf: 'SP', region: 'Sudeste', km: 815, share: 'Bike Itaú (Tembici)', featured: true },
    { slug: 'rio-de-janeiro', name: 'Rio de Janeiro', uf: 'RJ', region: 'Sudeste', km: 401, share: 'Bike Itaú (Tembici)', featured: true },
    { slug: 'belo-horizonte', name: 'Belo Horizonte', uf: 'MG', region: 'Sudeste', km: 141, share: 'Ciclovias BH', featured: true },
    { slug: 'vitoria', name: 'Vitória', uf: 'ES', region: 'Sudeste', km: 54, share: 'Bike Vitória' },
    { slug: 'curitiba', name: 'Curitiba', uf: 'PR', region: 'Sul', km: 247, share: 'Bike Curitiba', featured: true },
    { slug: 'florianopolis', name: 'Florianópolis', uf: 'SC', region: 'Sul', km: 143, share: 'Floripa Bike' },
    { slug: 'porto-alegre', name: 'Porto Alegre', uf: 'RS', region: 'Sul', km: 89, share: 'Bike PoA (Tembici)', featured: true },
    { slug: 'fortaleza', name: 'Fortaleza', uf: 'CE', region: 'Nordeste', km: 482, share: 'Bicicletar Fortaleza', featured: true },
    { slug: 'salvador', name: 'Salvador', uf: 'BA', region: 'Nordeste', km: 236, share: 'Bike Salvador (Tembici)', featured: true },
    { slug: 'recife', name: 'Recife', uf: 'PE', region: 'Nordeste', km: 194, share: 'Bike PE (Tembici)' },
    { slug: 'aracaju', name: 'Aracaju', uf: 'SE', region: 'Nordeste', km: 104, share: 'CajuBike' },
    { slug: 'joao-pessoa', name: 'João Pessoa', uf: 'PB', region: 'Nordeste', km: 102, share: 'Ciclovias Jampa' },
    { slug: 'maceio', name: 'Maceió', uf: 'AL', region: 'Nordeste', km: 101, share: 'Ciclovias Maceió' },
    { slug: 'teresina', name: 'Teresina', uf: 'PI', region: 'Nordeste', km: 86, share: 'Ciclovias Teresina' },
    { slug: 'natal', name: 'Natal', uf: 'RN', region: 'Nordeste', km: 75, share: 'Ciclovias Natal' },
    { slug: 'sao-luis', name: 'São Luís', uf: 'MA', region: 'Nordeste', km: 47, share: 'Ciclovias Ilha do Amor' },
    { slug: 'belem', name: 'Belém', uf: 'PA', region: 'Norte', km: 177, share: 'Bike Belém', featured: true },
    { slug: 'palmas', name: 'Palmas', uf: 'TO', region: 'Norte', km: 61, share: 'Ciclovias Palmas' },
    { slug: 'boa-vista', name: 'Boa Vista', uf: 'RR', region: 'Norte', km: 42, share: 'Ciclovias Boa Vista' },
    { slug: 'rio-branco', name: 'Rio Branco', uf: 'AC', region: 'Norte', km: 30, share: 'Ciclovias Rio Branco' },
    { slug: 'manaus', name: 'Manaus', uf: 'AM', region: 'Norte', km: 18, share: 'Ciclovias Manaus' },
    { slug: 'porto-velho', name: 'Porto Velho', uf: 'RO', region: 'Norte', km: 16, share: 'Ciclovias Madeira' },
    { slug: 'macapa', name: 'Macapá', uf: 'AP', region: 'Norte', km: 16, share: 'Ciclovias Meio do Mundo' },
  ];

  const capitalsGrid = document.getElementById('ev-capitals-grid');
  const regionButtons = Array.from(document.querySelectorAll('[data-region-filter]'));

  function renderCapitals(region) {
    if (!capitalsGrid) return;
    const list =
      region === 'Destaques'
        ? CAPITALS.filter((c) => c.featured)
        : CAPITALS.filter((c) => c.region === region);

    capitalsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    list.forEach((cap) => {
      const link = document.createElement('a');
      link.className = 'ev-capital-card';
      link.href = `./app/?city=${encodeURIComponent(cap.slug)}`;
      link.setAttribute('aria-label', `Abrir mapa de ${cap.name}, ${cap.uf} no EixoVerde Web`);

      const info = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'ev-capital-name';
      title.textContent = `${cap.name}, ${cap.uf}`;

      const sub = document.createElement('div');
      sub.className = 'ev-capital-share';
      sub.textContent = cap.share;

      info.appendChild(title);
      info.appendChild(sub);

      const kmBadge = document.createElement('span');
      kmBadge.className = 'ev-capital-km';
      kmBadge.textContent = `${cap.km} km`;

      link.appendChild(info);
      link.appendChild(kmBadge);
      fragment.appendChild(link);
    });

    capitalsGrid.appendChild(fragment);
  }

  regionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const region = btn.getAttribute('data-region-filter') || 'Destaques';
      regionButtons.forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      renderCapitals(region);
    });
  });

  renderCapitals('Destaques');
})();
