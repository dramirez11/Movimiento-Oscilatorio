import os

filepath = r'c:\Users\davia\OneDrive\Documentos\FIsica III\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Let's find the start of section 8 and the start of section 10
idx8 = html.find('<section class="notebook-page" data-page="8">')
idx10 = html.find('<section class="notebook-page" data-page="10">')

if idx8 != -1 and idx10 != -1:
    # Find the comment right before idx8
    idx8_comment = html.rfind('<!-- ====================================================================', 0, idx8)
    idx10_comment = html.rfind('<!-- ====================================================================', idx8, idx10)
    
    old_page_8 = html[idx8_comment:idx10_comment]
    
    new_pages = """<!-- ====================================================================
         PÁGINA 8: LABORATORIO VIRTUAL DE SIMULACIONES FÍSICAS (Página Izquierda)
         ==================================================================== -->
    <section class="notebook-page" data-page="8">
      <div class="page-header">
        <span class="page-header-topic">Simulaciones Físicas • Nivel Premium</span>
        <span class="page-number-tag">Página 8</span>
      </div>

      <h2 class="page-title">Oscilador Masa-Resorte</h2>
      <p class="page-lead">Modelación interactiva a 60 FPS con vectores en tiempo real y conservación de energía mecánica.</p>

      <!-- Simulación 1: Masa-Resorte -->
      <div class="sim-card" style="flex:1; display:flex; flex-direction:column;">
        <div class="sim-card-header">
          <h3><i class="fa-solid fa-arrows-left-right" style="color:#0284c7;"></i> Oscilador Masa-Resorte</h3>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="btnSimPlay" class="ggb-btn" style="width:auto; padding:0 8px; font-size:0.78rem;"><i class="fa-solid fa-pause"></i></button>
            <button id="btnSimReset" class="ggb-btn" title="Reiniciar"><i class="fa-solid fa-rotate-left"></i></button>
            <button id="btnOpenSimModal" class="btn-open-modal-card" title="Ampliar Simulador en Ventana Modal Grande">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i> <span>Ampliar</span>
            </button>
          </div>
        </div>
        <div class="sim-canvas-container" style="flex:1; min-height:400px; max-height:500px;">
          <canvas id="simMassSpringCanvas" class="sim-canvas"></canvas>
        </div>
        <div class="sim-sliders-grid" style="margin-top:15px;">
          <div class="slider-group">
            <div class="slider-header"><small>Masa (m):</small><span id="simValM" class="slider-value">1.0 kg</span></div>
            <input type="range" id="simSliderM" min="0.2" max="4.0" step="0.1" value="1.0" class="input-slider">
          </div>
          <div class="slider-group">
            <div class="slider-header"><small>Constante (k):</small><span id="simValK" class="slider-value">25 N/m</span></div>
            <input type="range" id="simSliderK" min="5" max="80" step="1" value="25" class="input-slider">
          </div>
          <div class="slider-group">
            <div class="slider-header"><small>Amplitud (A):</small><span id="simValA" class="slider-value">1.8 m</span></div>
            <input type="range" id="simSliderA" min="0.4" max="2.5" step="0.1" value="1.8" class="input-slider">
          </div>
        </div>
      </div>

      <footer class="notebook-footer" style="margin-top:auto;">
        <span>Física III</span>
        <span class="footer-author-text"><i class="fa-solid fa-feather"></i> Cuaderno creado por: David Alejandro Ramirez Bolaños</span>
      </footer>
    </section>

    """ + """<!-- ====================================================================
         PÁGINA 9: FASOR ROTATORIO Y ONDA (Página Derecha)
         ==================================================================== -->
    <section class="notebook-page" data-page="9">
      <div class="page-header">
        <span class="page-header-topic">Fasores y Ondas • Nivel Premium</span>
        <span class="page-number-tag">Página 9</span>
      </div>

      <h2 class="page-title">Fasor Rotatorio y Onda Proyectada</h2>
      <p class="page-lead">Visualización interactiva del movimiento circular uniforme y su proyección M.A.S.</p>

      <!-- Simulación 2: Fasor Rotatorio -->
      <div class="sim-card" style="flex:1; display:flex; flex-direction:column;">
        <div class="sim-card-header">
          <h3><i class="fa-solid fa-circle-notch" style="color:#6366f1;"></i> M.C.U. ↔ M.A.S.</h3>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="btnOpenPhasorModal" class="btn-open-modal-card" title="Ampliar Fasor en Ventana Modal Grande">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i> <span>Ampliar</span>
            </button>
          </div>
        </div>
        <div class="sim-canvas-container" style="flex:1; min-height:500px;">
          <canvas id="simPhasorCanvas" class="sim-canvas"></canvas>
        </div>
      </div>

      <footer class="notebook-footer" style="margin-top:auto;">
        <span>Física III</span>
        <span class="footer-author-text"><i class="fa-solid fa-feather"></i> Cuaderno creado por: David Alejandro Ramirez Bolaños</span>
      </footer>
    </section>

    """
    
    html = html[:idx8_comment] + new_pages + html[idx10_comment:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Replaced page 8 successfully!")
else:
    print(f"Could not find pages: idx8={idx8}, idx10={idx10}")
