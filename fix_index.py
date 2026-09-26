import os
import re

filepath = r'c:\Users\davia\OneDrive\Documentos\FIsica III\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# TOC Replacements
# We will insert TOC entry 9 and shift 9-12 to 10-13.
toc_item_pattern = re.compile(r'(<div class="toc-jump-btn" data-page=")(\d+)(")')
def toc_repl(m):
    num = int(m.group(2))
    if num >= 9:
        return f'{m.group(1)}{num+1}{m.group(3)}'
    return m.group(0)

html = toc_item_pattern.sub(toc_repl, html)

# Also update the text inside the TOC: <span ...>PÁG. X</span>
pag_text_pattern = re.compile(r'PÁG\. (\d+)')
def pag_repl(m):
    num = int(m.group(1))
    if num >= 9:
        return f'PÁG. {num+1}'
    return m.group(0)
    
# We should only apply pag_repl inside the toc-grid to avoid messing up other text
toc_start = html.find('<div class="toc-grid">')
toc_end = html.find('</div>', toc_start + 2000) # approximate
if toc_start != -1:
    toc_grid = html[toc_start:toc_end]
    toc_grid = pag_text_pattern.sub(pag_repl, toc_grid)
    html = html[:toc_start] + toc_grid + html[toc_end:]

# Now insert the new TOC button for page 9
toc_9_template = """        <div class="toc-jump-btn" data-page="9" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px 10px; cursor:pointer; transition:var(--transition); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:0.7rem; color:#0284c7; font-weight:700;">PÁG. 9</span>
            <h4 style="font-size:0.84rem; color:#0f172a;"><i class="fa-solid fa-circle-notch" style="color:#6366f1;"></i> Fasor Rotatorio</h4>
          </div>
          <i class="fa-solid fa-chevron-right" style="color:#94a3b8; font-size:0.75rem;"></i>
        </div>
"""
# Find data-page="10" which was originally 9
idx_10 = html.find('<div class="toc-jump-btn" data-page="10"')
if idx_10 != -1:
    html = html[:idx_10] + toc_9_template + "\n" + html[idx_10:]

# Now update the sections
# Shift section data-pages and "Página X" tag
section_pattern = re.compile(r'<section class="notebook-page" data-page="(\d+)">\s*<div class="page-header">\s*<span class="page-header-topic">(.*?)</span>\s*<span class="page-number-tag">Página (\d+)</span>')

def sec_repl(m):
    num = int(m.group(1))
    topic = m.group(2)
    p_num = int(m.group(3))
    if num >= 9:
        return f'<section class="notebook-page" data-page="{num+1}">\n      <div class="page-header">\n        <span class="page-header-topic">{topic}</span>\n        <span class="page-number-tag">Página {p_num+1}</span>'
    return m.group(0)

html = section_pattern.sub(sec_repl, html)

# Now extract section 8 and split it
idx8 = html.find('<section class="notebook-page" data-page="8">')
idx10 = html.find('<section class="notebook-page" data-page="10">')

idx8_comment = html.rfind('<!-- ====================================================================', 0, idx8)
idx10_comment = html.rfind('<!-- ====================================================================', idx8, idx10)

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
  <div class="sim-card" style="flex:1; display:flex; flex-direction:column; height: 85%;">
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
    <div class="sim-canvas-container" style="flex:1; min-height:450px;">
      <canvas id="simMassSpringCanvas" class="sim-canvas" style="width: 100%; height: 100%;"></canvas>
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
  <div class="sim-card" style="flex:1; display:flex; flex-direction:column; height: 85%;">
    <div class="sim-card-header">
      <h3><i class="fa-solid fa-circle-notch" style="color:#6366f1;"></i> M.C.U. ↔ M.A.S.</h3>
      <div style="display:flex; gap:6px; align-items:center;">
        <button id="btnOpenPhasorModal" class="btn-open-modal-card" title="Ampliar Fasor en Ventana Modal Grande">
          <i class="fa-solid fa-up-right-and-down-left-from-center"></i> <span>Ampliar</span>
        </button>
      </div>
    </div>
    <div class="sim-canvas-container" style="flex:1; min-height:480px;">
      <canvas id="simPhasorCanvas" class="sim-canvas" style="width: 100%; height: 100%;"></canvas>
    </div>
  </div>

  <footer class="notebook-footer" style="margin-top:auto;">
    <span>Física III</span>
    <span class="footer-author-text"><i class="fa-solid fa-feather"></i> Cuaderno creado por: David Alejandro Ramirez Bolaños</span>
  </footer>
</section>

"""

if idx8_comment != -1 and idx10_comment != -1:
    html = html[:idx8_comment] + new_pages + html[idx10_comment:]
    # Also update the comment blocks numbering for 10-13
    html = re.sub(r'PÁGINA 9: PROBLEMAS', 'PÁGINA 10: PROBLEMAS', html)
    html = re.sub(r'PÁGINA 10: TALLER', 'PÁGINA 11: TALLER', html)
    html = re.sub(r'PÁGINA 11: GLOSARIO', 'PÁGINA 12: GLOSARIO', html)
    html = re.sub(r'PÁGINA 12: REFERENCIAS', 'PÁGINA 13: REFERENCIAS', html)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Successfully processed index.html")
else:
    print("Could not find section 8 or 10")
