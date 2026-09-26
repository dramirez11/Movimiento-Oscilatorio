/**
 * Orquestador Principal del Cuaderno Digital de Física III
 * Modo Doble Página (Libro Abierto: Izquierda y Derecha)
 * Autor: David Alejandro Ramirez Bolaños
 */

document.addEventListener('DOMContentLoaded', () => {
  const totalPages = 14;
  const totalSpreads = 8; // Spread 0 (Portada), Spread 1 (2-3), Spread 2 (4-5), Spread 3 (6-7), Spread 4 (8-9), Spread 5 (10-11), Spread 6 (12-13), Spread 7 (14)

  const pageShortTitles = [
    "Portada Oficial",
    "Índice General",
    "Mapa Mental",
    "Línea de Tiempo",
    "Conceptos y SI",
    "Demostraciones",
    "Plano GeoGebra",
    "Oscilador Masa-Resorte",
    "Fasor Rotatorio",
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
    { spread: 4, pages: [8, 9], label: "Págs. 8-9: Oscilador y Fasor" },
    { spread: 5, pages: [10, 11], label: "Págs. 10-11: Problemas y Taller Interactivo" },
    { spread: 6, pages: [12, 13], label: "Págs. 12-13: Glosario y Referencias APA 7" },
    { spread: 7, pages: [14], label: "Pág. 14: Contraportada" }
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

    const def = spreadDefinitions[spreadIdx];
    if (def && def.pages.length === 1) {
      // Portada o Contraportada (Página única centrada sin división/lomo central)
      wrapper?.classList.add('is-cover');
      const singlePageNum = def.pages[0];
      const singlePage = document.querySelector(`.notebook-page[data-page="${singlePageNum}"]`);
      if (singlePage) {
        singlePage.scrollTop = 0;
        singlePage.classList.add('active', isForward ? 'page-anim-single-forward' : 'page-anim-single-backward');
      }

      if (pageCounterText) {
        pageCounterText.textContent = (singlePageNum === 1) ? "Portada (Pág. 1)" : `Pág. ${singlePageNum}: Contraportada`;
      }
      onPageActivated(singlePageNum);
    } else {
      wrapper?.classList.remove('is-cover');
      const leftPageNum = def ? def.pages[0] : (spreadIdx * 2);
      const rightPageNum = def ? def.pages[1] : (spreadIdx * 2 + 1);

      const leftPage = document.querySelector(`.notebook-page[data-page="${leftPageNum}"]`);
      const rightPage = document.querySelector(`.notebook-page[data-page="${rightPageNum}"]`);

      if (leftPage) {
        leftPage.scrollTop = 0;
        leftPage.classList.add('active', 'page-left', animClass);
        onPageActivated(leftPageNum);
      }
      if (rightPage) {
        rightPage.scrollTop = 0;
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
      target.scrollTop = 0;
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

  // ========================================================================
  // Modal de Retratos e Invenciones Históricas (Página 4)
  // ========================================================================
  const historicalData = {
    galileo_retrato: {
      title: "Galileo Galilei (1564–1642) • Retrato Oficial",
      src: "imagenes/galileo_retrato.jpg",
      desc: "Astrónomo, matemático, filósofo e ingeniero italiano. Hacia 1581, en la Catedral de Pisa, cronometró las oscilaciones de una gran lámpara utilizando los latidos de su propio pulso, descubriendo el principio de isocronismo del péndulo: para pequeñas amplitudes, el periodo oscilatorio permanece invariante sin importar la masa o la amplitud."
    },
    galileo_invento: {
      title: "Péndulo Isócrono y Pulsilogio de Galileo Galilei",
      src: "imagenes/galileo_invento.jpg",
      desc: "Diseño mecánico del péndulo regulador y del pulsilogio ideado por Galileo. Al ajustar la longitud del hilo del péndulo hasta sincronizar sus oscilaciones con el ritmo del pulso cardíaco del paciente, los médicos podían leer en una escala graduada la frecuencia exacta del pulso, marcando el nacimiento de los instrumentos de diagnóstico basados en osciladores armónicos."
    },
    huygens_retrato: {
      title: "Christiaan Huygens (1629–1695) • Retrato Oficial",
      src: "imagenes/huygens_retrato.jpg",
      desc: "Científico cumbre del Siglo de Oro neerlandés. Físico, matemático y astrónomo, formalizó matemáticamente la dinámica de los osciladores armónicos en su influyente tratado 'Horologium Oscillatorium' (1673), derivando la fórmula universal del periodo del péndulo simple T = 2π√(L/g)."
    },
    huygens_invento: {
      title: "Horologium Oscillatorium (1656) • Primer Reloj de Péndulo",
      src: "imagenes/huygens_invento.jpg",
      desc: "Primer reloj regulado por péndulo mecánico en la historia, patentado en 1656 por Christiaan Huygens. Al colocar láminas curvas cicloidales en la suspensión del péndulo, Huygens logró que el periodo fuera exactamente independiente de la amplitud incluso en grandes oscilaciones, reduciendo el error diario de los relojes de 15 minutos a menos de 10 segundos."
    },
    hooke_retrato: {
      title: "Robert Hooke (1635–1703) • Retrato Histórico",
      src: "imagenes/hooke_retrato.jpg",
      desc: "Científico y experimentador inglés, curador de experimentos de la Real Sociedad de Londres. Formuló en 1678 la célebre Ley de Elasticidad 'Ut tensio, sic vis' (Como la tensión, así es la fuerza), estableciendo que la fuerza recuperadora de un resorte es proporcional a su deformación (F = -kx), el principio físico constitutivo del Movimiento Armónico Simple."
    },
    hooke_invento: {
      title: "Resorte Espiral y Balanza Elástica (1678) • Robert Hooke",
      src: "imagenes/hooke_invento.jpg",
      desc: "Lámina técnica histórica de la obra 'De Potentia Restitutiva' (1678). Hooke diseñó la balanza de resorte helicoidal y el resorte espiral regulador acoplado a la rueda de volante para relojes de bolsillo portátiles, independizando la medición del tiempo del péndulo gravitatorio."
    },
    newton_retrato: {
      title: "Sir Isaac Newton (1642–1727) • Retrato Oficial",
      src: "imagenes/newton_retrato.jpg",
      desc: "Físico, teólogo, inventor, alquimista y matemático inglés. En sus 'Philosophiae Naturalis Principia Mathematica' (1687) formuló las leyes de la mecánica clásica y la gravitación universal. Al aplicar su Segunda Ley (ΣF = ma) a sistemas restauradores, fundamentó la formulación matemática universal del oscilador armónico."
    },
    newton_invento: {
      title: "Telescopio Reflector (1668) y Péndulos Armónicos • Isaac Newton",
      src: "imagenes/newton_invento.jpg",
      desc: "Lámina original de los Principia que ilustra el telescopio reflector catadióptrico con espejo cóncavo inventado por Newton en 1668, junto con sus célebres experimentos de colisión y conservación de cantidad de movimiento mediante péndulos armónicos acoplados oscilantes."
    },
    euler_retrato: {
      title: "Leonhard Euler (1707–1783) • Retrato Oficial",
      src: "imagenes/euler_retrato.jpg",
      desc: "Matemático y físico suizo, considerado uno de los más grandes matemáticos de todos los tiempos. Resolvió analíticamente la ecuación diferencial del oscilador armónico lineal d²x/dt² + ω²x = 0, introdujo la función exponencial compleja y sentó las bases del análisis armónico y la física de ondas."
    },
    euler_invento: {
      title: "Disco Oscilante y Diagrama de Fasores Armónicos • Leonhard Euler",
      src: "imagenes/euler_invento.jpg",
      desc: "Grabado de la Academia Imperial de San Petersburgo con la investigación de Euler sobre oscilaciones rotacionales de discos y turbinas, acompañado de su diagrama del círculo armónico donde la fórmula exp(iθ) = cos(θ) + i·sin(θ) proyecta el movimiento circular uniforme sobre el eje real como una oscilación armónica pura."
    },
    hertz_retrato: {
      title: "Heinrich Rudolf Hertz (1857–1894) • Retrato Oficial",
      src: "imagenes/hertz_retrato.jpg",
      desc: "Eminente físico alemán. En 1887 comprobó experimentalmente la existencia de las ondas electromagnéticas teóricas formuladas por James Clerk Maxwell, demostrando que son oscilaciones periódicas que viajan a la velocidad de la luz y exhiben reflexión, refracción e interferencia. En su memoria, el Sistema Internacional adoptó el Hertz (Hz) como unidad universal de frecuencia."
    },
    hertz_invento: {
      title: "Oscilador Dipolar y Resonador de Hertz (1887)",
      src: "imagenes/hertz_invento.jpg",
      desc: "Aparato experimental construido por Heinrich Hertz en el Instituto de Karlsruhe. Constaba de un oscilador dipolar alimentado por una bobina de inducción de Ruhmkorff con esferas de chispa de 1 cm, y un bucle resonador receptor de alambre con un microentrehierro micrométrico. Al activarse la descarga, la onda oscilante inducía diminutas chispas en el resonador distante, demostrando la transmisión inalámbrica de energía oscilatoria."
    }
  };

  window.openHistoricalModal = function(key) {
    const data = historicalData[key];
    if (!data) return;
    const modal = document.getElementById('historicalImageModal');
    if (!modal) return;
    document.getElementById('histModalTitleText').textContent = data.title;
    const img = document.getElementById('histModalImg');
    img.src = data.src;
    img.alt = data.title;
    document.getElementById('histModalDesc').textContent = data.desc;
    modal.classList.add('open');
  };

  window.closeHistoricalModal = function() {
    const modal = document.getElementById('historicalImageModal');
    if (modal) modal.classList.remove('open');
  };

  const histModal = document.getElementById('historicalImageModal');
  if (histModal) {
    histModal.addEventListener('click', (e) => {
      if (e.target === histModal) closeHistoricalModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHistoricalModal();
  });

  // Inicio
  populateDropdown();
  if (isSpreadMode) goToSpread(0);
  else goToPageSingle(1);
});
