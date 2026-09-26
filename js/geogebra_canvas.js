/**
 * Motor de Plano Cartesiano Interactivo Estilo "GeoGebra"
 * Cuaderno Digital de Física III - Movimiento Oscilatorio y M.A.S.
 * Autor: David Alejandro Ramirez Bolaños
 */

class GeoGebraPlane {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Configuración de visualización y escalas
    this.originX = 0; // Coordenadas en píxeles del origen (0,0)
    this.originY = 0;
    this.pixelsPerUnitX = options.pixelsPerUnitX || 60; // Escala eje X (píxeles por segundo)
    this.pixelsPerUnitY = options.pixelsPerUnitY || 70; // Escala eje Y (píxeles por metro)

    // Parámetros del M.A.S.
    this.A = options.A !== undefined ? options.A : 2.0;       // Amplitud [m]
    this.omega = options.omega !== undefined ? options.omega : 1.5; // Frecuencia angular [rad/s]
    this.phi = options.phi !== undefined ? options.phi : 0.0;     // Fase inicial [rad]

    // Modos de visualización de curvas
    this.showX = true; // x(t)
    this.showV = true; // v(t)
    this.showA = true; // a(t)
    this.showVectors = true; // Vectores tangentes / estado

    // Estilos gráficos configurables por el usuario (Paleta de Estilos)
    this.styles = {
      colorX: '#0284c7', // Azul cian
      colorV: '#10b981', // Verde esmeralda
      colorA: '#f59e0b', // Ámbar vibrante
      lineWidth: 2.5,
      lineDash: [], // [] sólida, [6, 4] discontinua, [2, 2] punteada
      gridMinor: true,
      gridMajor: true
    };

    // Estado de interacción
    this.activeTool = 'pan'; // 'pan', 'select', 'scale-x', 'scale-y'
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.hoverCoord = null;
    this.animationTime = 0;
    this.isPlaying = true;

    // Inicializar canvas y eventos
    this.initDPI();
    this.resetView();
    this.bindEvents();
    this.startLoop();
  }

  initDPI() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  resetView() {
    this.originX = 80; // Margen izquierdo para ver evolución en t >= 0
    this.originY = this.displayHeight / 2;
    this.pixelsPerUnitX = 60;
    this.pixelsPerUnitY = 60;
    this.render();
  }

  zoom(factor, centerX = this.displayWidth / 2, centerY = this.displayHeight / 2) {
    const prevXUnits = (centerX - this.originX) / this.pixelsPerUnitX;
    const prevYUnits = (this.originY - centerY) / this.pixelsPerUnitY;

    this.pixelsPerUnitX = Math.max(15, Math.min(600, this.pixelsPerUnitX * factor));
    this.pixelsPerUnitY = Math.max(15, Math.min(600, this.pixelsPerUnitY * factor));

    this.originX = centerX - prevXUnits * this.pixelsPerUnitX;
    this.originY = centerY + prevYUnits * this.pixelsPerUnitY;
    this.render();
  }

  // Conversión de coordenadas
  toPixelX(xMath) { return this.originX + xMath * this.pixelsPerUnitX; }
  toPixelY(yMath) { return this.originY - yMath * this.pixelsPerUnitY; }
  toMathX(pixelX) { return (pixelX - this.originX) / this.pixelsPerUnitX; }
  toMathY(pixelY) { return (this.originY - pixelY) / this.pixelsPerUnitY; }

  // Cálculo de intervalos óptimos de cuadrícula estilo GeoGebra (1, 2, 5 * 10^k)
  calculateNiceStep(pixelsPerUnit, targetPixelStep = 80) {
    const rawStep = targetPixelStep / pixelsPerUnit;
    const power = Math.floor(Math.log10(rawStep));
    const fraction = rawStep / Math.pow(10, power);
    let niceFraction;
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
    return niceFraction * Math.pow(10, power);
  }

  drawGrid() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    // Fondo blanco nítido
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const stepX = this.calculateNiceStep(this.pixelsPerUnitX, 75);
    const stepY = this.calculateNiceStep(this.pixelsPerUnitY, 75);

    // 1. Cuadrícula Menor (Milimetrada / Subdivisión de 5 partes)
    if (this.styles.gridMinor) {
      const minorStepX = stepX / 5;
      const minorStepY = stepY / 5;
      const startMathX = Math.floor(this.toMathX(0) / minorStepX) * minorStepX;
      const endMathX = Math.ceil(this.toMathX(w) / minorStepX) * minorStepX;

      ctx.save();
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = startMathX; x <= endMathX; x += minorStepX) {
        const px = this.toPixelX(x);
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
      }
      const startMathY = Math.floor(this.toMathY(h) / minorStepY) * minorStepY;
      const endMathY = Math.ceil(this.toMathY(0) / minorStepY) * minorStepY;
      for (let y = startMathY; y <= endMathY; y += minorStepY) {
        const py = this.toPixelY(y);
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2. Cuadrícula Mayor
    if (this.styles.gridMajor) {
      const startMathX = Math.floor(this.toMathX(0) / stepX) * stepX;
      const endMathX = Math.ceil(this.toMathX(w) / stepX) * stepX;
      const startMathY = Math.floor(this.toMathY(h) / stepY) * stepY;
      const endMathY = Math.ceil(this.toMathY(0) / stepY) * stepY;

      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = startMathX; x <= endMathX; x += stepX) {
        const px = this.toPixelX(x);
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
      }
      for (let y = startMathY; y <= endMathY; y += stepY) {
        const py = this.toPixelY(y);
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Marcas (Ticks) y Números sobre los ejes
      ctx.save();
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const axisYPos = Math.max(20, Math.min(h - 20, this.originY));
      for (let x = startMathX; x <= endMathX; x += stepX) {
        if (Math.abs(x) < 1e-6) continue;
        const px = this.toPixelX(x);
        // Tick sobre eje
        ctx.beginPath();
        ctx.moveTo(px, this.originY - 5);
        ctx.lineTo(px, this.originY + 5);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Número
        const label = parseFloat(x.toPrecision(6)).toString();
        ctx.fillText(label, px, axisYPos + 6);
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const axisXPos = Math.max(40, Math.min(w - 20, this.originX));
      for (let y = startMathY; y <= endMathY; y += stepY) {
        if (Math.abs(y) < 1e-6) continue;
        const py = this.toPixelY(y);
        ctx.beginPath();
        ctx.moveTo(this.originX - 5, py);
        ctx.lineTo(this.originX + 5, py);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        const label = parseFloat(y.toPrecision(6)).toString();
        ctx.fillText(label, axisXPos - 8, py);
      }
      ctx.restore();
    }

    // 4. Ejes Principales X e Y (estilo GeoGebra con flechas y etiquetas de variables)
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Eje X
    ctx.moveTo(0, this.originY);
    ctx.lineTo(w, this.originY);
    // Eje Y
    ctx.moveTo(this.originX, 0);
    ctx.lineTo(this.originX, h);
    ctx.stroke();

    // Flechas de dirección
    this.drawArrowhead(ctx, w - 10, this.originY, 0);
    this.drawArrowhead(ctx, this.originX, 10, -Math.PI / 2);

    // Etiquetas de los ejes
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'right';
    ctx.fillText('t (tiempo [s]) →', w - 16, this.originY - 10);

    ctx.textAlign = 'left';
    ctx.fillText('↑ x(t) [m], v(t) [m/s], a(t) [m/s²]', this.originX + 12, 20);

    // Origen (0,0)
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('0', this.originX - 6, this.originY + 6);
    ctx.restore();
  }

  drawArrowhead(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, -5);
    ctx.lineTo(-8, 5);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.restore();
  }

  // Dibujo de las funciones del M.A.S.
  drawMASCurves() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const startT = Math.max(0, this.toMathX(0));
    const endT = this.toMathX(w);
    const pixelStep = 2;

    const A = this.A;
    const w_ang = this.omega;
    const phi = this.phi;

    ctx.save();
    ctx.lineWidth = this.styles.lineWidth;
    if (this.styles.lineDash.length) {
      ctx.setLineDash(this.styles.lineDash);
    }

    // 1. Curva Elongación x(t) = A * cos(w*t + phi)
    if (this.showX) {
      ctx.strokeStyle = this.styles.colorX;
      ctx.beginPath();
      let first = true;
      for (let px = this.toPixelX(startT); px <= w; px += pixelStep) {
        const t = this.toMathX(px);
        const xVal = A * Math.cos(w_ang * t + phi);
        const py = this.toPixelY(xVal);
        if (first) { ctx.moveTo(px, py); first = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
    }

    // 2. Curva Velocidad v(t) = -A * w * sin(w*t + phi)
    if (this.showV) {
      ctx.strokeStyle = this.styles.colorV;
      ctx.beginPath();
      let first = true;
      for (let px = this.toPixelX(startT); px <= w; px += pixelStep) {
        const t = this.toMathX(px);
        const vVal = -A * w_ang * Math.sin(w_ang * t + phi);
        const py = this.toPixelY(vVal);
        if (first) { ctx.moveTo(px, py); first = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
    }

    // 3. Curva Aceleración a(t) = -A * w^2 * cos(w*t + phi)
    if (this.showA) {
      ctx.strokeStyle = this.styles.colorA;
      ctx.beginPath();
      let first = true;
      for (let px = this.toPixelX(startT); px <= w; px += pixelStep) {
        const t = this.toMathX(px);
        const aVal = -A * Math.pow(w_ang, 2) * Math.cos(w_ang * t + phi);
        const py = this.toPixelY(aVal);
        if (first) { ctx.moveTo(px, py); first = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
    }
    ctx.restore();

    // 4. Marcador en tiempo actual y vectores dinámicos
    if (this.showVectors) {
      const curT = this.animationTime;
      const curPx = this.toPixelX(curT);

      if (curPx >= 0 && curPx <= w) {
        const curX = A * Math.cos(w_ang * curT + phi);
        const curV = -A * w_ang * Math.sin(w_ang * curT + phi);
        const curA = -A * Math.pow(w_ang, 2) * Math.cos(w_ang * curT + phi);

        const pyX = this.toPixelY(curX);
        const pyV = this.toPixelY(curV);
        const pyA = this.toPixelY(curA);

        // Línea vertical indicadora de tiempo actual
        ctx.save();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(curPx, 0);
        ctx.lineTo(curPx, this.displayHeight);
        ctx.stroke();
        ctx.restore();

        // Puntos sobre las curvas
        if (this.showX) this.drawPoint(curPx, pyX, this.styles.colorX, `x=${curX.toFixed(2)} m`);
        if (this.showV) this.drawPoint(curPx, pyV, this.styles.colorV, `v=${curV.toFixed(2)} m/s`);
        if (this.showA) this.drawPoint(curPx, pyA, this.styles.colorA, `a=${curA.toFixed(2)} m/s²`);
      }
    }

    // 5. Inspector de Coordenadas Hover
    if (this.hoverCoord && this.activeTool === 'select') {
      const t = this.hoverCoord.t;
      const px = this.toPixelX(t);
      if (t >= 0 && px >= 0 && px <= w) {
        const xVal = A * Math.cos(w_ang * t + phi);
        const vVal = -A * w_ang * Math.sin(w_ang * t + phi);
        const aVal = -A * Math.pow(w_ang, 2) * Math.cos(w_ang * t + phi);

        ctx.save();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, this.displayHeight);
        ctx.stroke();

        // Tooltip elegante
        const ttText = `t: ${t.toFixed(2)}s | x: ${xVal.toFixed(2)}m | v: ${vVal.toFixed(2)}m/s | a: ${aVal.toFixed(2)}m/s²`;
        ctx.font = '11px "JetBrains Mono", monospace';
        const textWidth = ctx.measureText(ttText).width;
        const ttX = Math.min(w - textWidth - 20, Math.max(10, px - textWidth / 2));
        const ttY = 30;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.roundRect(ttX - 8, ttY - 18, textWidth + 16, 26, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(ttText, ttX, ttY);
        ctx.restore();
      }
    }
  }

  drawPoint(x, y, color, label) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (label) {
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 9, y - 6);
    }
    ctx.restore();
  }

  render() {
    this.drawGrid();
    this.drawMASCurves();
  }

  startLoop() {
    let lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (this.isPlaying) {
        this.animationTime += dt * 0.8;
        const maxT = this.toMathX(this.displayWidth - 40);
        if (this.animationTime > Math.max(12, maxT)) {
          this.animationTime = 0;
        }
      }
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Asignación de interactividad de ratón, gestos táctiles y reescalado de ejes estilo GeoGebra
  bindEvents() {
    const canvas = this.canvas;

    // Redimensionar automáticamente
    window.addEventListener('resize', () => {
      this.initDPI();
      this.render();
    });

    // Zoom con rueda del ratón
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      this.zoom(factor, mouseX, mouseY);
    }, { passive: false });

    // Inicio de Arrastre / Reescalado de Ejes
    const onPointerDown = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      this.isDragging = true;
      this.dragStartX = x;
      this.dragStartY = y;

      // Detección si el cursor está sobre el eje X o el eje Y (para reescalar independientemente)
      const nearAxisX = Math.abs(y - this.originY) < 15;
      const nearAxisY = Math.abs(x - this.originX) < 15;

      if (nearAxisX && !nearAxisY) {
        this.activeTool = 'scale-x';
        canvas.style.cursor = 'ew-resize';
      } else if (nearAxisY && !nearAxisX) {
        this.activeTool = 'scale-y';
        canvas.style.cursor = 'ns-resize';
      } else {
        if (this.activeTool !== 'select') {
          this.activeTool = 'pan';
          canvas.style.cursor = 'grabbing';
        }
      }
    };

    const onPointerMove = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Actualizar información hover
      this.hoverCoord = { t: this.toMathX(x), y: this.toMathY(y) };

      // Actualizar indicador de coordenadas en pantalla
      const coordsBadge = document.getElementById('ggbCoordsBadge');
      if (coordsBadge) {
        coordsBadge.textContent = `t: ${this.hoverCoord.t.toFixed(2)}s | f(t): ${this.hoverCoord.y.toFixed(2)}`;
      }

      if (!this.isDragging) {
        // Efecto de cursor según proximidad a ejes
        const nearAxisX = Math.abs(y - this.originY) < 15;
        const nearAxisY = Math.abs(x - this.originX) < 15;
        if (nearAxisX && !nearAxisY) canvas.style.cursor = 'ew-resize';
        else if (nearAxisY && !nearAxisX) canvas.style.cursor = 'ns-resize';
        else if (this.activeTool === 'select') canvas.style.cursor = 'crosshair';
        else canvas.style.cursor = 'grab';
        return;
      }

      const dx = x - this.dragStartX;
      const dy = y - this.dragStartY;

      if (this.activeTool === 'pan') {
        this.originX += dx;
        this.originY += dy;
        this.dragStartX = x;
        this.dragStartY = y;
        this.render();
      } else if (this.activeTool === 'scale-x') {
        // Reescalamiento manual dinámico del eje X con ratón/dedos
        const scaleFactor = 1 + dx * 0.008;
        this.pixelsPerUnitX = Math.max(15, Math.min(600, this.pixelsPerUnitX * scaleFactor));
        this.dragStartX = x;
        this.render();
      } else if (this.activeTool === 'scale-y') {
        // Reescalamiento manual dinámico del eje Y
        const scaleFactor = 1 - dy * 0.008;
        this.pixelsPerUnitY = Math.max(15, Math.min(600, this.pixelsPerUnitY * scaleFactor));
        this.dragStartY = y;
        this.render();
      }
    };

    const onPointerUp = () => {
      this.isDragging = false;
      if (this.activeTool === 'scale-x' || this.activeTool === 'scale-y') {
        this.activeTool = 'pan';
      }
      canvas.style.cursor = this.activeTool === 'select' ? 'crosshair' : 'grab';
    };

    // Eventos Mouse
    canvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onPointerUp);

    // Eventos Táctiles (Mobile / Tablet)
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchend', onPointerUp);
  }

  // Métodos de la barra de herramientas externa
  setTool(tool) {
    this.activeTool = tool;
    this.canvas.style.cursor = tool === 'select' ? 'crosshair' : 'grab';
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }
}

// Exportar clase globalmente
window.GeoGebraPlane = GeoGebraPlane;
