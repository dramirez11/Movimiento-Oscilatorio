/**
 * Orquestador Principal del Cuaderno Digital de Física III
 * Modo Doble Página (Libro Abierto: Izquierda y Derecha)
 * Autor: David Alejandro Ramirez Bolaños
 */

document.addEventListener('DOMContentLoaded', () => {
  const totalPages = 13;
  const totalSpreads = 7; // Spread 0 (Portada), Spread 1 (2-3), Spread 2 (4-5), Spread 3 (6-7), Spread 4 (8-9), Spread 5 (10-11), Spread 6 (12-13)

  const pageShortTitles = [
    "Portada Oficial",
    "Índice General",
    "Mapa Mental",
    "Línea de Tiempo",
    "Conceptos y SI",
    "Demostraciones",
    "Plano GeoGebra",
    "Simuladores M.A.S.",
    "Problemas Resueltos",
    "Taller Interactivo",
    "Glosario Científico",
    "Referencias APA 7",
    "Contraportada"
  ];

  function checkDefaultSpreadMode() {
    const isPortrait = window.innerHeight > window.innerWidth;
    return window.innerWidth >= 960 && !isPortrait;
  }

  let isSpreadMode = checkDefaultSpreadMode();
  let currentSpread = 0; // 0 = Portada, 1 = 2-3, 2 = 4-5, etc.
  let currentPageSingle = 1; // Para cuando esté en modo página simple

  const audio = new PageTurnAudio();
  let ggbEngine = null;
  let massSpringSim = null;
  let phasorSim = null;
  let mindMapEngine = null;
  let exerciseEngine = null;

  // Elementos UI
  const wrapper = document.getElementById('notebookWrapper');
  const btnPrev = document.getElementById('btnPrevPage');
  const btnNext = document.getElementById('btnNextPage');
  const btnHome = document.getElementById('btnHome');
  const pageDropdown = document.getElementById('pageSelect');
  const pageCounterText = document.getElementById('pageCounterText');
  const btnSound = document.getElementById('btnToggleSound');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnToggleSpread = document.getElementById('btnToggleSpreadMode');
  const lblSpreadMode = document.getElementById('lblSpreadMode');

  // Listado de pliegos y títulos
  const spreadDefinitions = [
    { spread: 0, pages: [1], label: "Portada Oficial" },
    { spread: 1, pages: [2, 3], label: "Págs. 2-3: Índice y Mapa Mental" },
    { spread: 2, pages: [4, 5], label: "Págs. 4-5: Historia, Conceptos y Unidades SI" },
    { spread: 3, pages: [6, 7], label: "Págs. 6-7: Demostraciones y Plano GeoGebra" },
    { spread: 4, pages: [8, 9], label: "Págs. 8-9: Simulaciones y Problemas Resueltos" },
    { spread: 5, pages: [10, 11], label: "Págs. 10-11: Taller Interactivo y Glosario" },
    { spread: 6, pages: [12, 13], label: "Págs. 12-13: Referencias APA 7 y Contraportada" }
  ];

  function populateDropdown() {
    if (!pageDropdown) return;
    pageDropdown.innerHTML = '';

    if (isSpreadMode) {
      spreadDefinitions.forEach(def => {
        const opt = document.createElement('option');
        opt.value = def.spread;
        opt.textContent = def.label;
        pageDropdown.appendChild(opt);
      });
      pageDropdown.value = currentSpread;
    } else {
      for (let i = 1; i <= totalPages; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Pág. ${i}: ${pageShortTitles[i - 1] || ''}`;
        pageDropdown.appendChild(opt);
      }
      pageDropdown.value = currentPageSingle;
    }
  }

  pageDropdown?.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    if (isSpreadMode) {
      goToSpread(val);
    } else {
      goToPageSingle(val);
    }
  });

  // Navegación en Modo Doble Página (Libro Abierto)
  function goToSpread(spreadIdx) {
    if (spreadIdx < 0 || spreadIdx >= totalSpreads) return;
    audio.play();

    const isForward = spreadIdx >= currentSpread;
    const animClass = isForward ? 'page-anim-forward' : 'page-anim-backward';
    currentSpread = spreadIdx;

    // Desactivar todas las páginas y limpiar clases de animación previas
    document.querySelectorAll('.notebook-page').forEach(page => {
      page.classList.remove('active', 'page-left', 'page-right', 'page-anim-forward', 'page-anim-backward', 'page-anim-single-forward', 'page-anim-single-backward');
    });

    if (spreadIdx === 0) {
      // Portada (Página 1 centrada)
      wrapper?.classList.add('is-cover');
      const page1 = document.querySelector('.notebook-page[data-page="1"]');
      if (page1) {
        page1.classList.add('active', isForward ? 'page-anim-single-forward' : 'page-anim-single-backward');
      }

      if (pageCounterText) pageCounterText.textContent = "Portada (Pág. 1)";
      onPageActivated(1);
    } else {
      wrapper?.classList.remove('is-cover');
      const leftPageNum = spreadIdx * 2;
      const rightPageNum = spreadIdx * 2 + 1;

      const leftPage = document.querySelector(`.notebook-page[data-page="${leftPageNum}"]`);
      const rightPage = document.querySelector(`.notebook-page[data-page="${rightPageNum}"]`);

      if (leftPage) {
        leftPage.classList.add('active', 'page-left', animClass);
        onPageActivated(leftPageNum);
      }
      if (rightPage) {
        rightPage.classList.add('active', 'page-right', animClass);
        onPageActivated(rightPageNum);
      }

      if (pageCounterText) {
        pageCounterText.textContent = `Págs. ${leftPageNum} - ${rightPageNum} de ${totalPages}`;
      }
    }

    if (btnPrev) btnPrev.disabled = (currentSpread === 0);
    if (btnNext) btnNext.disabled = (currentSpread === totalSpreads - 1);
    if (pageDropdown) pageDropdown.value = currentSpread;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Navegación en Modo Página Simple (Pantallas estrechas o selección manual)
  function goToPageSingle(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    audio.play();

    const isForward = pageNum >= currentPageSingle;
    const animClass = isForward ? 'page-anim-single-forward' : 'page-anim-single-backward';
    currentPageSingle = pageNum;
    wrapper?.classList.add('is-cover'); // Sin lomo central cuando es página simple

    document.querySelectorAll('.notebook-page').forEach(page => {
      page.classList.remove('active', 'page-left', 'page-right', 'page-anim-forward', 'page-anim-backward', 'page-anim-single-forward', 'page-anim-single-backward');
    });

    const target = document.querySelector(`.notebook-page[data-page="${pageNum}"]`);
    if (target) {
      target.classList.add('active', animClass);
      onPageActivated(pageNum);
    }

    if (btnPrev) btnPrev.disabled = (currentPageSingle === 1);
    if (btnNext) btnNext.disabled = (currentPageSingle === totalPages);
    if (pageDropdown) pageDropdown.value = currentPageSingle;
    if (pageCounterText) pageCounterText.textContent = `Pág. ${currentPageSingle} de ${totalPages}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Ir a página específica respetando el modo actual
  function navigateToPage(pageNum) {
    if (isSpreadMode) {
      if (pageNum === 1) goToSpread(0);
      else {
        const spread = Math.floor(pageNum / 2);
        goToSpread(spread);
      }
    } else {
      goToPageSingle(pageNum);
    }
  }

  function next() {
    if (isSpreadMode) {
      if (currentSpread < totalSpreads - 1) goToSpread(currentSpread + 1);
    } else {
      if (currentPageSingle < totalPages) goToPageSingle(currentPageSingle + 1);
    }
  }

  function prev() {
    if (isSpreadMode) {
      if (currentSpread > 0) goToSpread(currentSpread - 1);
    } else {
      if (currentPageSingle > 1) goToPageSingle(currentPageSingle - 1);
    }
  }

  // Inicialización de componentes bajo demanda según las páginas visibles
  function onPageActivated(pageNum) {
    if (window.renderMathInElement) {
      const activeEl = document.querySelector(`.notebook-page[data-page="${pageNum}"]`);
      if (activeEl) {
        window.renderMathInElement(activeEl, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      }
    }

    // Página 3: Mapa Mental
    if (pageNum === 3 && !mindMapEngine) {
      mindMapEngine = new InteractiveMindMap('mindmapContainer');
    }

    // Página 7: Motor GeoGebra
    if (pageNum === 7) {
      setTimeout(() => {
        if (!ggbEngine) {
          initGeoGebra();
        } else {
          ggbEngine.initDPI();
          ggbEngine.render();
        }
      }, 50);
    }

    // Página 8: Simuladores
    if (pageNum === 8) {
      setTimeout(() => {
        if (!massSpringSim) {
          massSpringSim = new MassSpringSimulator('simMassSpringCanvas');
          initSimControls();
        } else {
          massSpringSim.initDPI();
        }
        if (!phasorSim) {
          phasorSim = new PhasorSimulator('simPhasorCanvas');
        } else {
          phasorSim.initDPI();
        }
      }, 50);
    }

    // Página 10: Taller Interactivo
    if (pageNum === 10 && !exerciseEngine) {
      exerciseEngine = new ExerciseEngine();
    }
  }

  function initGeoGebra() {
    ggbEngine = new GeoGebraPlane('ggbCanvas', {
      A: 2.0,
      omega: 1.5,
      phi: 0.0
    });

    document.getElementById('ggbToolPan')?.addEventListener('click', (e) => {
      setActiveToolBtn(e.currentTarget);
      ggbEngine.setTool('pan');
    });

    document.getElementById('ggbToolSelect')?.addEventListener('click', (e) => {
      setActiveToolBtn(e.currentTarget);
      ggbEngine.setTool('select');
    });

    document.getElementById('ggbZoomIn')?.addEventListener('click', () => ggbEngine.zoom(1.2));
    document.getElementById('ggbZoomOut')?.addEventListener('click', () => ggbEngine.zoom(0.83));
    document.getElementById('ggbResetView')?.addEventListener('click', () => ggbEngine.resetView());

    const sliderA = document.getElementById('ggbSliderA');
    const valA = document.getElementById('ggbValA');
    sliderA?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      ggbEngine.A = val;
      if (valA) valA.textContent = `${val.toFixed(1)} m`;
    });

    const sliderW = document.getElementById('ggbSliderW');
    const valW = document.getElementById('ggbValW');
    sliderW?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      ggbEngine.omega = val;
      if (valW) valW.textContent = `${val.toFixed(1)} rad/s`;
    });

    const sliderPhi = document.getElementById('ggbSliderPhi');
    const valPhi = document.getElementById('ggbValPhi');
    sliderPhi?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      ggbEngine.phi = val;
      if (valPhi) valPhi.textContent = `${val.toFixed(2)} rad`;
    });

    document.getElementById('chkCurveX')?.addEventListener('change', (e) => ggbEngine.showX = e.target.checked);
    document.getElementById('chkCurveV')?.addEventListener('change', (e) => ggbEngine.showV = e.target.checked);
    document.getElementById('chkCurveA')?.addEventListener('change', (e) => ggbEngine.showA = e.target.checked);

    const btnPalette = document.getElementById('ggbBtnPalette');
    const modalPalette = document.getElementById('ggbPaletteModal');
    btnPalette?.addEventListener('click', () => modalPalette?.classList.toggle('open'));

    document.addEventListener('click', (e) => {
      if (modalPalette && modalPalette.classList.contains('open')) {
        if (!modalPalette.contains(e.target) && e.target !== btnPalette && !btnPalette.contains(e.target)) {
          modalPalette.classList.remove('open');
        }
      }
    });

    document.querySelectorAll('.color-swatch-x').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        document.querySelectorAll('.color-swatch-x').forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        ggbEngine.styles.colorX = e.target.dataset.color;
      });
    });

    document.getElementById('ggbStrokeWidth')?.addEventListener('input', (e) => {
      ggbEngine.styles.lineWidth = parseFloat(e.target.value);
    });

    document.getElementById('ggbLineStyle')?.addEventListener('change', (e) => {
      const style = e.target.value;
      if (style === 'dashed') ggbEngine.styles.lineDash = [6, 4];
      else if (style === 'dotted') ggbEngine.styles.lineDash = [2, 3];
      else ggbEngine.styles.lineDash = [];
    });
  }

  function setActiveToolBtn(button) {
    document.querySelectorAll('.ggb-btn-tool').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }

  function initSimControls() {
    const btnPlay = document.getElementById('btnSimPlay');
    btnPlay?.addEventListener('click', () => {
      if (!massSpringSim) return;
      massSpringSim.isPlaying = !massSpringSim.isPlaying;
      btnPlay.innerHTML = massSpringSim.isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    });

    const btnReset = document.getElementById('btnSimReset');
    btnReset?.addEventListener('click', () => {
      if (massSpringSim) massSpringSim.time = 0;
    });

    document.getElementById('simSliderM')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (massSpringSim) massSpringSim.m = val;
      const lbl = document.getElementById('simValM');
      if (lbl) lbl.textContent = `${val.toFixed(1)} kg`;
    });

    document.getElementById('simSliderK')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (massSpringSim) massSpringSim.k = val;
      const lbl = document.getElementById('simValK');
      if (lbl) lbl.textContent = `${val.toFixed(0)} N/m`;
    });

    document.getElementById('simSliderA')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (massSpringSim) massSpringSim.A = val;
      const lbl = document.getElementById('simValA');
      if (lbl) lbl.textContent = `${val.toFixed(1)} m`;
    });
  }

  // Filtrado del Glosario (Página 11)
  const glossaryInput = document.getElementById('glossarySearch');
  glossaryInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.glossary-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(term) ? 'block' : 'none';
    });
  });

  // Botón para alternar entre Doble Página y Página Simple
  btnToggleSpread?.addEventListener('click', () => {
    isSpreadMode = !isSpreadMode;
    btnToggleSpread.innerHTML = isSpreadMode ? 
      '<i class="fa-solid fa-book-open"></i> <span id="lblSpreadMode">Doble Página</span>' : 
      '<i class="fa-solid fa-file"></i> <span id="lblSpreadMode">Página Simple</span>';

    populateDropdown();
    if (isSpreadMode) {
      goToSpread(currentSpread);
    } else {
      goToPageSingle(currentSpread === 0 ? 1 : currentSpread * 2);
    }
  });

  // =========================================================================
  // SISTEMA DE VENTANA MODAL COLAPSABLE GRANDE PARA GRÁFICAS INTERACTIVAS
  // =========================================================================
  const graphicModal = document.getElementById('graphicModal');
  const modalDialog = document.getElementById('modalDialog');
  const modalGraphicTitle = document.getElementById('modalGraphicTitle');
  const modalIcon = document.getElementById('modalIcon');
  const modalBadgeMode = document.getElementById('modalBadgeMode');
  const btnModalCollapse = document.getElementById('btnModalCollapse');
  const btnModalCollapseIcon = document.getElementById('btnModalCollapseIcon');
  const btnModalClose = document.getElementById('btnModalClose');
  const btnModalCloseFooter = document.getElementById('btnModalCloseFooter');

  let activeModalView = null; // 'geogebra', 'simulator', 'phasor', 'mindmap'
  let isModalCollapsed = false;

  let modalGgbEngine = null;
  let modalMassSpringSim = null;
  let modalPhasorSim = null;
  let modalMindMapEngine = null;

  function openGraphicModal(viewType) {
    if (!graphicModal || !modalDialog) return;
    activeModalView = viewType;

    // Ocultar todas las vistas del modal
    document.querySelectorAll('.modal-view-panel').forEach(panel => panel.style.display = 'none');

    // Descolapsar si estaba minimizado
    isModalCollapsed = false;
    modalDialog.classList.remove('is-collapsed');
    graphicModal.classList.remove('is-collapsed-parent');
    if (btnModalCollapseIcon) {
      btnModalCollapseIcon.className = 'fa-solid fa-window-minimize';
    }
    if (modalBadgeMode) {
      modalBadgeMode.textContent = 'VENTANA EXPANDIDA';
    }

    graphicModal.classList.add('open');

    if (viewType === 'geogebra') {
      if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-chart-line" style="color:#38bdf8;"></i>';
      if (modalGraphicTitle) modalGraphicTitle.textContent = 'Plano Cartesiano GeoGebra (Modo Expandido)';
      const p = document.getElementById('modalViewGeoGebra');
      if (p) p.style.display = 'flex';

      setTimeout(() => {
        if (!modalGgbEngine) {
          initModalGeoGebra();
        } else {
          if (ggbEngine) {
            modalGgbEngine.A = ggbEngine.A;
            modalGgbEngine.omega = ggbEngine.omega;
            modalGgbEngine.phi = ggbEngine.phi;
            modalGgbEngine.showX = ggbEngine.showX;
            modalGgbEngine.showV = ggbEngine.showV;
            modalGgbEngine.showA = ggbEngine.showA;
            modalGgbEngine.styles = Object.assign({}, ggbEngine.styles);
            syncModalGgbSliders();
          }
          modalGgbEngine.initDPI();
          modalGgbEngine.render();
        }
      }, 60);

    } else if (viewType === 'simulator') {
      if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-arrows-left-right" style="color:#0284c7;"></i>';
      if (modalGraphicTitle) modalGraphicTitle.textContent = 'Laboratorio Dinámico: Oscilador Masa-Resorte (Alta Definición)';
      const p = document.getElementById('modalViewSim');
      if (p) p.style.display = 'flex';

      setTimeout(() => {
        if (!modalMassSpringSim) {
          initModalSimControls();
        } else {
          if (massSpringSim) {
            modalMassSpringSim.m = massSpringSim.m;
            modalMassSpringSim.k = massSpringSim.k;
            modalMassSpringSim.A = massSpringSim.A;
            syncModalSimSliders();
          }
          modalMassSpringSim.initDPI();
        }
      }, 60);

    } else if (viewType === 'phasor') {
      if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-circle-notch" style="color:#6366f1;"></i>';
      if (modalGraphicTitle) modalGraphicTitle.textContent = 'Fasor Rotatorio y Onda Sinusoidal (Modo Expandido)';
      const p = document.getElementById('modalViewPhasor');
      if (p) p.style.display = 'flex';

      setTimeout(() => {
        if (!modalPhasorSim) {
          modalPhasorSim = new PhasorSimulator('modalSimPhasorCanvas');
        } else {
          modalPhasorSim.initDPI();
        }
      }, 60);

    } else if (viewType === 'mindmap') {
      if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-network-wired" style="color:#10b981;"></i>';
      if (modalGraphicTitle) modalGraphicTitle.textContent = 'Mapa Mental: Universo Oscilatorio (Vista Panorámica)';
      const p = document.getElementById('modalViewMindmap');
      if (p) p.style.display = 'flex';

      setTimeout(() => {
        if (!modalMindMapEngine) {
          modalMindMapEngine = new InteractiveMindMap('modalMindmapContainer');
        }
      }, 60);
    }
  }

  function closeGraphicModal() {
    if (!graphicModal || !modalDialog) return;
    graphicModal.classList.remove('open', 'is-collapsed-parent');
    modalDialog.classList.remove('is-collapsed');
    isModalCollapsed = false;
    activeModalView = null;
  }

  function toggleCollapseModal() {
    if (!graphicModal || !modalDialog) return;
    isModalCollapsed = !isModalCollapsed;

    if (isModalCollapsed) {
      modalDialog.classList.add('is-collapsed');
      graphicModal.classList.add('is-collapsed-parent');
      if (btnModalCollapseIcon) {
        btnModalCollapseIcon.className = 'fa-solid fa-window-maximize';
      }
      if (modalBadgeMode) {
        modalBadgeMode.textContent = 'MINIMIZADO (CLIC PARA EXPANDIR)';
      }
    } else {
      modalDialog.classList.remove('is-collapsed');
      graphicModal.classList.remove('is-collapsed-parent');
      if (btnModalCollapseIcon) {
        btnModalCollapseIcon.className = 'fa-solid fa-window-minimize';
      }
      if (modalBadgeMode) {
        modalBadgeMode.textContent = 'VENTANA EXPANDIDA';
      }
      setTimeout(() => {
        if (activeModalView === 'geogebra' && modalGgbEngine) {
          modalGgbEngine.initDPI();
          modalGgbEngine.render();
        } else if (activeModalView === 'simulator' && modalMassSpringSim) {
          modalMassSpringSim.initDPI();
        } else if (activeModalView === 'phasor' && modalPhasorSim) {
          modalPhasorSim.initDPI();
        }
      }, 100);
    }
  }

  function initModalGeoGebra() {
    modalGgbEngine = new GeoGebraPlane('modalGgbCanvas', {
      A: ggbEngine ? ggbEngine.A : 2.0,
      omega: ggbEngine ? ggbEngine.omega : 1.5,
      phi: ggbEngine ? ggbEngine.phi : 0.0
    });

    document.getElementById('modalGgbToolPan')?.addEventListener('click', (e) => {
      document.querySelectorAll('#modalViewGeoGebra .ggb-btn-tool').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      modalGgbEngine.setTool('pan');
    });

    document.getElementById('modalGgbToolSelect')?.addEventListener('click', (e) => {
      document.querySelectorAll('#modalViewGeoGebra .ggb-btn-tool').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      modalGgbEngine.setTool('select');
    });

    document.getElementById('modalGgbZoomIn')?.addEventListener('click', () => modalGgbEngine.zoom(1.2));
    document.getElementById('modalGgbZoomOut')?.addEventListener('click', () => modalGgbEngine.zoom(0.83));
    document.getElementById('modalGgbResetView')?.addEventListener('click', () => modalGgbEngine.resetView());

    const sliderA = document.getElementById('modalGgbSliderA');
    const valA = document.getElementById('modalGgbValA');
    sliderA?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      modalGgbEngine.A = val;
      if (ggbEngine) ggbEngine.A = val;
      const mainSliderA = document.getElementById('ggbSliderA');
      if (mainSliderA) mainSliderA.value = val;
      const mainValA = document.getElementById('ggbValA');
      if (mainValA) mainValA.textContent = `${val.toFixed(1)} m`;
      if (valA) valA.textContent = `${val.toFixed(1)} m`;
    });

    const sliderW = document.getElementById('modalGgbSliderW');
    const valW = document.getElementById('modalGgbValW');
    sliderW?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      modalGgbEngine.omega = val;
      if (ggbEngine) ggbEngine.omega = val;
      const mainSliderW = document.getElementById('ggbSliderW');
      if (mainSliderW) mainSliderW.value = val;
      const mainValW = document.getElementById('ggbValW');
      if (mainValW) mainValW.textContent = `${val.toFixed(1)} rad/s`;
      if (valW) valW.textContent = `${val.toFixed(1)} rad/s`;
    });

    const sliderPhi = document.getElementById('modalGgbSliderPhi');
    const valPhi = document.getElementById('modalGgbValPhi');
    sliderPhi?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      modalGgbEngine.phi = val;
      if (ggbEngine) ggbEngine.phi = val;
      const mainSliderPhi = document.getElementById('ggbSliderPhi');
      if (mainSliderPhi) mainSliderPhi.value = val;
      const mainValPhi = document.getElementById('ggbValPhi');
      if (mainValPhi) mainValPhi.textContent = `${val.toFixed(2)} rad`;
      if (valPhi) valPhi.textContent = `${val.toFixed(2)} rad`;
    });

    document.getElementById('modalChkCurveX')?.addEventListener('change', (e) => {
      modalGgbEngine.showX = e.target.checked;
      if (ggbEngine) ggbEngine.showX = e.target.checked;
      const chk = document.getElementById('chkCurveX');
      if (chk) chk.checked = e.target.checked;
    });

    document.getElementById('modalChkCurveV')?.addEventListener('change', (e) => {
      modalGgbEngine.showV = e.target.checked;
      if (ggbEngine) ggbEngine.showV = e.target.checked;
      const chk = document.getElementById('chkCurveV');
      if (chk) chk.checked = e.target.checked;
    });

    document.getElementById('modalChkCurveA')?.addEventListener('change', (e) => {
      modalGgbEngine.showA = e.target.checked;
      if (ggbEngine) ggbEngine.showA = e.target.checked;
      const chk = document.getElementById('chkCurveA');
      if (chk) chk.checked = e.target.checked;
    });

    const btnPalette = document.getElementById('modalGgbBtnPalette');
    const modalPalette = document.getElementById('modalGgbPaletteModal');
    btnPalette?.addEventListener('click', () => modalPalette?.classList.toggle('open'));
    document.getElementById('btnCloseModalPalette')?.addEventListener('click', () => modalPalette?.classList.remove('open'));

    document.querySelectorAll('.modal-color-swatch-x').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        document.querySelectorAll('.modal-color-swatch-x').forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        modalGgbEngine.styles.colorX = e.target.dataset.color;
      });
    });

    document.getElementById('modalGgbStrokeWidth')?.addEventListener('input', (e) => {
      modalGgbEngine.styles.lineWidth = parseFloat(e.target.value);
    });

    document.getElementById('modalGgbLineStyle')?.addEventListener('change', (e) => {
      const style = e.target.value;
      if (style === 'dashed') modalGgbEngine.styles.lineDash = [6, 4];
      else if (style === 'dotted') modalGgbEngine.styles.lineDash = [2, 3];
      else modalGgbEngine.styles.lineDash = [];
    });

    syncModalGgbSliders();
  }

  function syncModalGgbSliders() {
    if (!modalGgbEngine) return;
    const sA = document.getElementById('modalGgbSliderA');
    const vA = document.getElementById('modalGgbValA');
    if (sA) sA.value = modalGgbEngine.A;
    if (vA) vA.textContent = `${modalGgbEngine.A.toFixed(1)} m`;

    const sW = document.getElementById('modalGgbSliderW');
    const vW = document.getElementById('modalGgbValW');
    if (sW) sW.value = modalGgbEngine.omega;
    if (vW) vW.textContent = `${modalGgbEngine.omega.toFixed(1)} rad/s`;

    const sPhi = document.getElementById('modalGgbSliderPhi');
    const vPhi = document.getElementById('modalGgbValPhi');
    if (sPhi) sPhi.value = modalGgbEngine.phi;
    if (vPhi) vPhi.textContent = `${modalGgbEngine.phi.toFixed(2)} rad`;
  }

  function initModalSimControls() {
    modalMassSpringSim = new MassSpringSimulator('modalSimMassSpringCanvas');

    const btnPlay = document.getElementById('modalBtnSimPlay');
    btnPlay?.addEventListener('click', () => {
      if (!modalMassSpringSim) return;
      modalMassSpringSim.isPlaying = !modalMassSpringSim.isPlaying;
      btnPlay.innerHTML = modalMassSpringSim.isPlaying ? '<i class="fa-solid fa-pause"></i> Pausar' : '<i class="fa-solid fa-play"></i> Reanudar';
    });

    const btnReset = document.getElementById('modalBtnSimReset');
    btnReset?.addEventListener('click', () => {
      if (modalMassSpringSim) modalMassSpringSim.time = 0;
    });

    document.getElementById('modalSimSliderM')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (modalMassSpringSim) modalMassSpringSim.m = val;
      if (massSpringSim) massSpringSim.m = val;
      const lbl = document.getElementById('modalSimValM');
      if (lbl) lbl.textContent = `${val.toFixed(1)} kg`;
      const mainLbl = document.getElementById('simValM');
      if (mainLbl) mainLbl.textContent = `${val.toFixed(1)} kg`;
      const mainSlider = document.getElementById('simSliderM');
      if (mainSlider) mainSlider.value = val;
    });

    document.getElementById('modalSimSliderK')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (modalMassSpringSim) modalMassSpringSim.k = val;
      if (massSpringSim) massSpringSim.k = val;
      const lbl = document.getElementById('modalSimValK');
      if (lbl) lbl.textContent = `${val.toFixed(0)} N/m`;
      const mainLbl = document.getElementById('simValK');
      if (mainLbl) mainLbl.textContent = `${val.toFixed(0)} N/m`;
      const mainSlider = document.getElementById('simSliderK');
      if (mainSlider) mainSlider.value = val;
    });

    document.getElementById('modalSimSliderA')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (modalMassSpringSim) modalMassSpringSim.A = val;
      if (massSpringSim) massSpringSim.A = val;
      const lbl = document.getElementById('modalSimValA');
      if (lbl) lbl.textContent = `${val.toFixed(1)} m`;
      const mainLbl = document.getElementById('simValA');
      if (mainLbl) mainLbl.textContent = `${val.toFixed(1)} m`;
      const mainSlider = document.getElementById('simSliderA');
      if (mainSlider) mainSlider.value = val;
    });

    syncModalSimSliders();
  }

  function syncModalSimSliders() {
    if (!modalMassSpringSim) return;
    const sM = document.getElementById('modalSimSliderM');
    const vM = document.getElementById('modalSimValM');
    if (sM) sM.value = modalMassSpringSim.m;
    if (vM) vM.textContent = `${modalMassSpringSim.m.toFixed(1)} kg`;

    const sK = document.getElementById('modalSimSliderK');
    const vK = document.getElementById('modalSimValK');
    if (sK) sK.value = modalMassSpringSim.k;
    if (vK) vK.textContent = `${modalMassSpringSim.k.toFixed(0)} N/m`;

    const sA = document.getElementById('modalSimSliderA');
    const vA = document.getElementById('modalSimValA');
    if (sA) sA.value = modalMassSpringSim.A;
    if (vA) vA.textContent = `${modalMassSpringSim.A.toFixed(1)} m`;
  }

  // Disparadores para abrir la ventana modal desde las tarjetas interactivas
  document.getElementById('btnOpenGgbModal')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openGraphicModal('geogebra');
  });

  document.getElementById('btnOpenSimModal')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openGraphicModal('simulator');
  });

  document.getElementById('btnOpenPhasorModal')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openGraphicModal('phasor');
  });

  document.getElementById('btnOpenMindmapModal')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openGraphicModal('mindmap');
  });

  // Controles de la Ventana Modal (Colapsar, Cerrar, ESC)
  btnModalCollapse?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCollapseModal();
  });

  // Si está colapsado, hacer clic en la cabecera lo expande
  document.getElementById('modalHeader')?.addEventListener('click', (e) => {
    if (isModalCollapsed && !e.target.closest('.modal-close-btn')) {
      toggleCollapseModal();
    }
  });

  btnModalClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeGraphicModal();
  });

  btnModalCloseFooter?.addEventListener('click', () => {
    closeGraphicModal();
  });

  // Cerrar al hacer clic en el backdrop solo si no está colapsado
  graphicModal?.addEventListener('click', (e) => {
    if (e.target === graphicModal && !isModalCollapsed) {
      closeGraphicModal();
    }
  });

  // Navegación Global
  btnPrev?.addEventListener('click', prev);
  btnNext?.addEventListener('click', next);
  btnHome?.addEventListener('click', () => navigateToPage(1));

  document.getElementById('btnOpenBook')?.addEventListener('click', () => navigateToPage(2));
  document.getElementById('btnBackToCover')?.addEventListener('click', () => navigateToPage(1));

  document.getElementById('btnHeaderTOC')?.addEventListener('click', () => navigateToPage(2));
  document.getElementById('btnHeaderGeoGebra')?.addEventListener('click', () => navigateToPage(7));
  document.getElementById('btnHeaderSim')?.addEventListener('click', () => navigateToPage(8));

  // Botones de salto desde el índice
  document.querySelectorAll('.toc-jump-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = parseInt(e.currentTarget.dataset.page, 10);
      if (target) navigateToPage(target);
    });
  });

  // Atajos de teclado
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGraphicModal();
      return;
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
    else if (e.key === 'Home') navigateToPage(1);
    else if (e.key === 'End') navigateToPage(totalPages);
  });

  // Swipe táctil inteligente para móviles
  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.target.closest('input, textarea, select, button, canvas, svg, .mindmap-wrapper, .sim-card')) return;
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (e.target.closest('input, textarea, select, button, canvas, svg, .mindmap-wrapper, .sim-card')) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX < 0) next();
      else prev();
    }
  }, { passive: true });

  // Sonido y Pantalla Completa
  btnSound?.addEventListener('click', () => {
    const isEnabled = audio.toggle();
    btnSound.innerHTML = isEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
  });

  btnFullscreen?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      btnFullscreen.innerHTML = '<i class="fa-solid fa-compress"></i>';
    } else {
      document.exitFullscreen().catch(() => {});
      btnFullscreen.innerHTML = '<i class="fa-solid fa-expand"></i>';
    }
  });

  // Detección de cambio de tamaño y orientación de pantalla
  const handleViewportChange = () => {
    const shouldBeSpread = checkDefaultSpreadMode();
    if (shouldBeSpread !== isSpreadMode) {
      isSpreadMode = shouldBeSpread;
      if (btnToggleSpread) {
        btnToggleSpread.innerHTML = isSpreadMode ? 
          '<i class="fa-solid fa-book-open"></i> <span id="lblSpreadMode">Doble Página</span>' : 
          '<i class="fa-solid fa-file"></i> <span id="lblSpreadMode">Página Simple</span>';
      }
      populateDropdown();
      if (isSpreadMode) goToSpread(currentSpread);
      else goToPageSingle(currentSpread === 0 ? 1 : currentSpread * 2);
    }
    if (ggbEngine) ggbEngine.initDPI();
    if (massSpringSim) massSpringSim.initDPI();
    if (phasorSim) phasorSim.initDPI();
    if (modalGgbEngine) modalGgbEngine.initDPI();
    if (modalMassSpringSim) modalMassSpringSim.initDPI();
    if (modalPhasorSim) modalPhasorSim.initDPI();
  };

  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('orientationchange', () => {
    setTimeout(handleViewportChange, 120);
  });

  // Inicio
  populateDropdown();
  if (isSpreadMode) goToSpread(0);
  else goToPageSingle(1);
});
