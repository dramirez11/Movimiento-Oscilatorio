/**
 * Laboratorio de Simulaciones Físicas del M.A.S. (Nivel Premium)
 * Cuaderno Digital de Física III
 * Autor: David Alejandro Ramirez Bolaños
 */

class MassSpringSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Parámetros físicos
    this.m = 1.0;     // Masa [kg]
    this.k = 25.0;    // Constante elástica del resorte [N/m]
    this.A = 1.8;     // Amplitud [m]
    this.phi = 0.0;   // Fase inicial [rad]
    this.b = 0.0;     // Amortiguamiento (0 = M.A.S. puro conservativo)

    // Estado de simulación
    this.time = 0;
    this.isPlaying = true;
    this.scale = 45;  // Píxeles por metro en la animación física

    this.initDPI();
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

  get omega() { return Math.sqrt(this.k / this.m); }
  get T() { return (2 * Math.PI) / this.omega; }
  get f() { return 1 / this.T; }

  getX(t) { return this.A * Math.cos(this.omega * t + this.phi); }
  getV(t) { return -this.A * this.omega * Math.sin(this.omega * t + this.phi); }
  getA(t) { return -this.A * Math.pow(this.omega, 2) * Math.cos(this.omega * t + this.phi); }

  // Dibujo del resorte helicoidal realista
  drawSpring(startX, startY, endX, endY, coils = 14, radius = 14) {
    const ctx = this.ctx;
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);

    const leadLength = 20; // Tramo recto inicial
    ctx.lineTo(leadLength, 0);

    const activeLength = dist - leadLength * 2;
    const coilStep = activeLength / coils;

    for (let i = 0; i < coils; i++) {
      const x1 = leadLength + i * coilStep + coilStep * 0.25;
      const y1 = -radius;
      const x2 = leadLength + i * coilStep + coilStep * 0.75;
      const y2 = radius;
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }

    ctx.lineTo(dist - leadLength, 0);
    ctx.lineTo(dist, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Dibujar vector físico con punta de flecha
  drawVector(startX, startY, length, color, label) {
    if (Math.abs(length) < 2) return;
    const ctx = this.ctx;
    const endX = startX + length;
    const endY = startY;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Flecha
    const arrowSize = 7;
    const dir = length > 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - arrowSize * dir, endY - arrowSize * 0.6);
    ctx.lineTo(endX - arrowSize * dir, endY + arrowSize * 0.6);
    ctx.closePath();
    ctx.fill();

    // Etiqueta
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, endX, endY - 8);
    ctx.restore();
  }

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    ctx.clearRect(0, 0, w, h);

    // Fondo blanco elegante con cuadrícula suave
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const wallX = 60;
    const trackY = h * 0.58;
    const eqX = w * 0.52; // Posición de equilibrio x = 0

    // 1. Pared de fijación rígida con rayado
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(wallX - 16, trackY - 70, 16, 120);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wallX, trackY - 70);
    ctx.lineTo(wallX, trackY + 50);
    ctx.stroke();

    // Rayado de la pared
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    for (let y = trackY - 60; y <= trackY + 40; y += 12) {
      ctx.beginPath();
      ctx.moveTo(wallX - 14, y + 8);
      ctx.lineTo(wallX, y);
      ctx.stroke();
    }

    // 2. Superficie horizontal (suelo)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wallX, trackY + 30);
    ctx.lineTo(w - 20, trackY + 30);
    ctx.stroke();

    // 3. Regla graduada en el suelo
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    for (let m = -3; m <= 3; m += 0.5) {
      const markX = eqX + m * this.scale;
      if (markX > wallX + 20 && markX < w - 20) {
        ctx.beginPath();
        ctx.moveTo(markX, trackY + 30);
        ctx.lineTo(markX, trackY + (m % 1 === 0 ? 40 : 35));
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();
        if (m % 1 === 0) {
          ctx.fillText(`${m}m`, markX, trackY + 52);
        }
      }
    }

    // Línea de equilibrio x = 0
    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(eqX, trackY - 70);
    ctx.lineTo(eqX, trackY + 30);
    ctx.stroke();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('x = 0 (Equilibrio)', eqX, trackY - 76);
    ctx.restore();

    // Límites de amplitud +A y -A
    const posXMax = eqX + this.A * this.scale;
    const negXMax = eqX - this.A * this.scale;
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(posXMax, trackY - 40);
    ctx.lineTo(posXMax, trackY + 30);
    ctx.moveTo(negXMax, trackY - 40);
    ctx.lineTo(negXMax, trackY + 30);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(`+A (${this.A.toFixed(1)}m)`, posXMax, trackY + 22);
    ctx.fillText(`-A (-${this.A.toFixed(1)}m)`, negXMax, trackY + 22);
    ctx.restore();

    // 4. Dinámica actual
    const x = this.getX(this.time);
    const v = this.getV(this.time);
    const a = this.getA(this.time);

    const massX = eqX + x * this.scale;
    const massWidth = 60;
    const massHeight = 50;
    const massCenterY = trackY + 30 - massHeight / 2;

    // 5. Dibujar resorte desde la pared hasta la masa
    this.drawSpring(wallX, massCenterY, massX - massWidth / 2, massCenterY, 12, 14);

    // 6. Masa (Bloque) con efecto 3D metálico
    ctx.save();
    const grad = ctx.createLinearGradient(massX - massWidth / 2, massCenterY - massHeight / 2, massX + massWidth / 2, massCenterY + massHeight / 2);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    ctx.roundRect(massX - massWidth / 2, massCenterY - massHeight / 2, massWidth, massHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Etiqueta de la masa
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.m.toFixed(1)} kg`, massX, massCenterY);
    ctx.restore();

    // 7. Vectores en tiempo real sobre la masa
    // Vector Velocidad (verde)
    this.drawVector(massX, massCenterY - 35, v * 12, '#10b981', `v = ${v.toFixed(2)} m/s`);
    // Vector Aceleración (rojo)
    this.drawVector(massX, massCenterY + 35, a * 6, '#ef4444', `a = ${a.toFixed(2)} m/s²`);

    // 8. Indicadores Energéticos en Vivo
    const Ek = 0.5 * this.m * Math.pow(v, 2);
    const Ep = 0.5 * this.k * Math.pow(x, 2);
    const Em = Ek + Ep;

    ctx.save();
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(`t: ${this.time.toFixed(2)} s`, 20, 26);
    ctx.fillText(`x(t): ${x.toFixed(2)} m`, 20, 42);
    ctx.fillText(`v(t): ${v.toFixed(2)} m/s`, 20, 58);
    ctx.fillText(`a(t): ${a.toFixed(2)} m/s²`, 20, 74);

    // Barra de conservación de energía
    const barX = w - 210;
    const barY = 22;
    const barW = 180;
    const barH = 14;

    ctx.fillStyle = '#e2e8f0';
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fill();

    const ekRatio = Em > 0 ? Ek / Em : 0;
    const ekW = barW * ekRatio;

    // Cinética (verde)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(barX, barY, ekW, barH, [4, 0, 0, 4]);
    ctx.fill();

    // Potencial (azul)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(barX + ekW, barY, barW - ekW, barH, [0, 4, 4, 0]);
    ctx.fill();

    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'right';
    ctx.fillText(`Em = ${Em.toFixed(1)} J (Constante)`, w - 30, barY + 30);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`Ek: ${Ek.toFixed(1)}J`, barX, barY + 30);
    ctx.fillStyle = '#2563eb';
    ctx.fillText(`Ep: ${Ep.toFixed(1)}J`, barX + 80, barY + 30);
    ctx.restore();
  }

  startLoop() {
    let lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      if (this.isPlaying) {
        this.time += dt;
      }
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initDPI();
      this.render();
    });
  }
}

// Simulador 2: Fasor Rotatorio y Onda Proyectada
class PhasorSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.A = 2.0;       // Amplitud [m]
    this.omega = 1.8;   // Frecuencia angular [rad/s]
    this.phi = 0.0;     // Fase inicial
    this.time = 0;
    this.isPlaying = true;

    this.initDPI();
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

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const circleCenterX = Math.min(130, w * 0.28);
    const centerY = h * 0.5;
    const radius = Math.min(75, h * 0.38);

    // 1. Círculo de referencia M.C.U.
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(circleCenterX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Ejes del círculo
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(circleCenterX - radius - 15, centerY);
    ctx.lineTo(circleCenterX + radius + 15, centerY);
    ctx.moveTo(circleCenterX, centerY - radius - 15);
    ctx.lineTo(circleCenterX, centerY + radius + 15);
    ctx.stroke();
    ctx.restore();

    // 2. Vector Fasor rotando a velocidad angular omega
    const angle = -(this.omega * this.time + this.phi); // Negativo para rotación horaria/trigonométrica estándar
    const tipX = circleCenterX + radius * Math.cos(angle);
    const tipY = centerY + radius * Math.sin(angle);

    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.fillStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(circleCenterX, centerY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Punta del fasor
    ctx.beginPath();
    ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Arco de ángulo omega * t
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(circleCenterX, centerY, 24, 0, angle, true);
    ctx.stroke();
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.fillText('ωt', circleCenterX + 16, centerY - 14);
    ctx.restore();

    // 3. Proyección horizontal hacia la onda senoidal
    const waveStartX = circleCenterX + radius + 35;
    const waveWidth = w - waveStartX - 20;

    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(waveStartX, tipY);
    ctx.stroke();
    ctx.restore();

    // 4. Eje de tiempo para la onda
    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(waveStartX, centerY);
    ctx.lineTo(waveStartX + waveWidth, centerY);
    ctx.stroke();

    // Dibujar la onda que viaja
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const wavelength = 140; // píxeles por periodo
    const k = (2 * Math.PI) / wavelength;

    for (let x = 0; x <= waveWidth; x += 2) {
      const curAngle = angle - x * (this.omega / 60);
      const y = centerY + radius * Math.sin(curAngle);
      if (x === 0) ctx.moveTo(waveStartX, y);
      else ctx.lineTo(waveStartX + x, y);
    }
    ctx.stroke();

    // Punto oscilador en la entrada de la onda
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(waveStartX, tipY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('x(t) = A·cos(ωt + φ)', waveStartX + 10, centerY - radius - 10);
    ctx.restore();
  }

  startLoop() {
    let lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      if (this.isPlaying) this.time += dt;
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Exportar globalmente
window.MassSpringSimulator = MassSpringSimulator;
window.PhasorSimulator = PhasorSimulator;
