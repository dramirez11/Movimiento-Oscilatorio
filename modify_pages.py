import re
import os

filepath = r'c:\Users\davia\OneDrive\Documentos\FIsica III\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update TOC data-page references
# Páginas 9 to 12 become 10 to 13
html = html.replace('data-page="12"', 'data-page="13"')
html = html.replace('data-page="11"', 'data-page="12"')
html = html.replace('data-page="10"', 'data-page="11"')
html = html.replace('data-page="9"', 'data-page="10"')

# Update the visible PÁG. numbers in TOC
html = html.replace('PÁG. 12', 'PÁG. 13')
html = html.replace('PÁG. 11', 'PÁG. 12')
html = html.replace('PÁG. 10', 'PÁG. 11')
html = html.replace('PÁG. 9', 'PÁG. 10')

# Insert the new TOC entry for PÁG 9 right before PÁG 10
toc_9_template = """        <div class="toc-jump-btn" data-page="9" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px 10px; cursor:pointer; transition:var(--transition); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:0.7rem; color:#0284c7; font-weight:700;">PÁG. 9</span>
            <h4 style="font-size:0.84rem; color:#0f172a;"><i class="fa-solid fa-circle-notch" style="color:#6366f1;"></i> Fasor Rotatorio</h4>
          </div>
          <i class="fa-solid fa-chevron-right" style="color:#94a3b8; font-size:0.75rem;"></i>
        </div>

"""
# Find the start of the TOC item for PÁG 10
idx_10 = html.find('<div class="toc-jump-btn" data-page="10"')
if idx_10 != -1:
    html = html[:idx_10] + toc_9_template + html[idx_10:]

# 2. Increment section data-pages (from 9 to 13)
# We look for <section class="notebook-page" data-page="X">
html = html.replace('<section class="notebook-page" data-page="12">', '<section class="notebook-page" data-page="13">')
html = html.replace('Página 12', 'Página 13')

html = html.replace('<section class="notebook-page" data-page="11">', '<section class="notebook-page" data-page="12">')
html = html.replace('Página 11', 'Página 12')

html = html.replace('<section class="notebook-page" data-page="10">', '<section class="notebook-page" data-page="11">')
html = html.replace('Página 10', 'Página 11')

html = html.replace('<section class="notebook-page" data-page="9">', '<section class="notebook-page" data-page="10">')
html = html.replace('Página 9', 'Página 10')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(html)
