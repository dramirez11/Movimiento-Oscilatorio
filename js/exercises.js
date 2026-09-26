/**
 * Módulo Pedagógico de Ejercicios y Resolución Paso a Paso (5 Fases)
 * Cuaderno Digital de Física III - Movimiento Oscilatorio y M.A.S.
 * Autor: David Alejandro Ramirez Bolaños
 * 
 * Código cromático estricto:
 * 1) Datos en AZUL (#2563eb)
 * 2) Incógnitas en ROJO (#dc2626)
 * 3) Fórmulas necesarias
 * 4) Despeje y valores determinados en NARANJA (#ea580c)
 * 5) Validación de resultados y conclusiones
 */

class ExerciseEngine {
  constructor() {
    this.bindInteractiveCalculator();
  }

  // Calculadora interactiva que genera la resolución en 5 fases según los datos que ingrese el usuario
  bindInteractiveCalculator() {
    const btnSolve = document.getElementById('btnSolveCustom');
    if (!btnSolve) return;

    btnSolve.addEventListener('click', () => {
      this.solveCustomProblem();
    });
  }

  solveCustomProblem() {
    const mInput = parseFloat(document.getElementById('inputM')?.value || 0.8);
    const kInput = parseFloat(document.getElementById('inputK')?.value || 50);
    const aInput = parseFloat(document.getElementById('inputA')?.value || 0.15);
    const phiInput = parseFloat(document.getElementById('inputPhi')?.value || 0);

    const m = Math.max(0.01, mInput);
    const k = Math.max(0.1, kInput);
    const A = Math.max(0.001, aInput);
    const phi = phiInput;

    // 1. Cálculos Físicos
    const omega = Math.sqrt(k / m);
    const f = omega / (2 * Math.PI);
    const T = 1 / f;
    const vmax = omega * A;
    const amax = Math.pow(omega, 2) * A;
    const Em = 0.5 * k * Math.pow(A, 2);

    const resultContainer = document.getElementById('customSolutionContainer');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div class="exercise-card" style="border-left: 5px solid #2563eb;">
        <div class="exercise-title">
          <i class="fa-solid fa-graduation-cap" style="color:#2563eb;"></i>
          Resolución Generada Paso a Paso (Metodología Pedagógica Universitaria)
        </div>
        
        <div class="exercise-statement">
          <strong>Enunciado Personalizado:</strong> Se dispone de un sistema oscilador armónico formado por un cuerpo de masa 
          <span class="data-tag-blue">m = ${m.toFixed(2)} kg</span> unido a un resorte elástico horizontal de constante 
          <span class="data-tag-blue">k = ${k.toFixed(2)} N/m</span> que oscila sobre una superficie sin fricción. Si se le comunica una amplitud inicial de 
          <span class="data-tag-blue">A = ${A.toFixed(3)} m</span> con una fase inicial de 
          <span class="data-tag-blue">φ = ${phi.toFixed(2)} rad</span>, determine las propiedades cinemáticas y dinámicas del sistema.
        </div>

        <!-- FASE 1: DATOS (AZUL) -->
        <div class="phase-box phase-datos">
          <div class="phase-header-datos">
            <i class="fa-solid fa-circle-info"></i>
            1. Identificación de Datos Conocidos (Color Azul):
          </div>
          <div>
            • Masa del cuerpo: <span class="data-tag-blue">m = ${m.toFixed(2)} kg</span><br>
            • Constante elástica recuperadora: <span class="data-tag-blue">k = ${k.toFixed(2)} N/m</span><br>
            • Amplitud del movimiento: <span class="data-tag-blue">A = ${A.toFixed(3)} m</span><br>
            • Fase inicial de oscilación: <span class="data-tag-blue">φ = ${phi.toFixed(2)} rad</span>
          </div>
        </div>

        <!-- FASE 2: INCÓGNITAS (ROJO) -->
        <div class="phase-box phase-incognitas">
          <div class="phase-header-incognitas">
            <i class="fa-solid fa-circle-question"></i>
            2. Identificación de Incógnitas a Resolver (Color Rojo):
          </div>
          <div>
            • Frecuencia angular natural: <span class="unknown-tag-red">ω = ? [rad/s]</span><br>
            • Periodo de oscilación: <span class="unknown-tag-red">T = ? [s]</span><br>
            • Frecuencia de oscilación: <span class="unknown-tag-red">f = ? [Hz]</span><br>
            • Rapidez máxima alcanzada: <span class="unknown-tag-red">v_max = ? [m/s]</span><br>
            • Módulo de aceleración máxima: <span class="unknown-tag-red">a_max = ? [m/s²]</span><br>
            • Energía mecánica total del oscilador: <span class="unknown-tag-red">E_m = ? [J]</span>
          </div>
        </div>

        <!-- FASE 3: FÓRMULAS NECESARIAS -->
        <div class="phase-box phase-formulas">
          <div class="phase-header-formulas">
            <i class="fa-solid fa-square-root-variable"></i>
            3. Ecuaciones y Fórmulas Físicas Necesarias:
          </div>
          <div style="font-size: 0.95rem; line-height: 1.8;">
            (a) Frecuencia angular: $$ \\omega = \\sqrt{\\frac{k}{m}} $$
            (b) Periodo y frecuencia del M.A.S.: $$ T = \\frac{2\\pi}{\\omega} = 2\\pi \\sqrt{\\frac{m}{k}}, \\quad f = \\frac{1}{T} = \\frac{\\omega}{2\\pi} $$
            (c) Cinemática extrema: $$ v_{\\max} = \\omega A, \\quad a_{\\max} = \\omega^2 A $$
            (d) Energía mecánica total: $$ E_m = \\frac{1}{2} k A^2 = \\frac{1}{2} m v_{\\max}^2 $$
          </div>
        </div>

        <!-- FASE 4: SUSTITUCIÓN Y DESPEJE (NARANJA) -->
        <div class="phase-box phase-despeje">
          <div class="phase-header-despeje">
            <i class="fa-solid fa-calculator"></i>
            4. Sustitución de Datos, Conversión y Despeje (Valores Determinados en Naranja):
          </div>
          <div class="despeje-container" style="font-size: 0.92rem; line-height: 1.6;">
            <p style="margin: 4px 0 2px;"><strong>Paso 4.1: Cálculo de la frecuencia angular $\\omega$:</strong></p>
            <div class="despeje-row">
              $$ \\omega = \\sqrt{\\frac{${k.toFixed(2)} \\text{ N/m}}{${m.toFixed(2)} \\text{ kg}}} = \\sqrt{${(k/m).toFixed(3)}} \\implies $$
              <span class="solved-tag-orange">ω = ${omega.toFixed(4)} rad/s</span>
              <span class="despeje-note">(Ya no es incógnita)</span>
            </div>
            
            <p style="margin: 8px 0 2px;"><strong>Paso 4.2: Cálculo del periodo $T$ y la frecuencia $f$:</strong></p>
            <div class="despeje-row">
              $$ T = \\frac{2\\pi}{${omega.toFixed(4)} \\text{ rad/s}} \\implies $$
              <span class="solved-tag-orange">T = ${T.toFixed(4)} s</span>
              <span class="despeje-note">(Valor determinado)</span>
            </div>
            <div class="despeje-row">
              $$ f = \\frac{1}{${T.toFixed(4)} \\text{ s}} \\implies $$
              <span class="solved-tag-orange">f = ${f.toFixed(4)} Hz</span>
              <span class="despeje-note">(Valor determinado)</span>
            </div>

            <p style="margin: 8px 0 2px;"><strong>Paso 4.3: Rapidez máxima $v_{\\max}$ y Aceleración máxima $a_{\\max}$:</strong></p>
            <div class="despeje-row">
              $$ v_{\\max} = (${omega.toFixed(4)} \\text{ rad/s}) \\cdot (${A.toFixed(3)} \\text{ m}) \\implies $$
              <span class="solved-tag-orange">v_max = ${vmax.toFixed(4)} m/s</span>
            </div>
            <div class="despeje-row">
              $$ a_{\\max} = (${omega.toFixed(4)} \\text{ rad/s})^2 \\cdot (${A.toFixed(3)} \\text{ m}) \\implies $$
              <span class="solved-tag-orange">a_max = ${amax.toFixed(4)} m/s²</span>
            </div>

            <p style="margin: 8px 0 2px;"><strong>Paso 4.4: Energía mecánica total $E_m$:</strong></p>
            <div class="despeje-row">
              $$ E_m = \\frac{1}{2} (${k.toFixed(2)} \\text{ N/m}) \\cdot (${A.toFixed(3)} \\text{ m})^2 = \\frac{1}{2} (${k.toFixed(2)}) \\cdot (${Math.pow(A,2).toFixed(6)}) \\implies $$
              <span class="solved-tag-orange">E_m = ${Em.toFixed(5)} J (${(Em * 1000).toFixed(2)} mJ)</span>
            </div>
          </div>
        </div>

        <!-- FASE 5: VALIDACIÓN Y CONCLUSIONES -->
        <div class="phase-box phase-validation">
          <div class="phase-header-validation">
            <i class="fa-solid fa-square-check"></i>
            5. Validación Dimensional de Resultados y Conclusiones Físicas:
          </div>
          <div style="font-size: 0.92rem; line-height: 1.6; color:#14532d;">
            <strong>• Análisis Dimensional:</strong><br>
            $$ [\\omega] = \\sqrt{\\frac{\\text{N/m}}{\\text{kg}}} = \\sqrt{\\frac{\\text{kg}\\cdot\\text{m}/\\text{s}^2}{\\text{m}\\cdot\\text{kg}}} = \\sqrt{\\frac{1}{\\text{s}^2}} = \\text{s}^{-1} = \\text{rad/s} \\quad \\checkmark $$
            $$ [E_m] = [\\text{N}/\\text{m}] \\cdot [\\text{m}]^2 = \\text{N}\\cdot\\text{m} = \\text{Joule [J]} \\quad \\checkmark $$
            <strong>• Coherencia Dinámica:</strong> Al no existir rozamiento ($b = 0$), el sistema oscila de manera perpetua con intercambio continuo y perfecto entre energía cinética y elástica, manteniendo la energía total invariante en <span class="solved-tag-orange">${Em.toFixed(4)} J</span>.
          </div>
        </div>
      </div>
    `;

    // Renderizar fórmulas con KaTeX si está disponible
    if (window.renderMathInElement) {
      window.renderMathInElement(resultContainer, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  }
}

window.ExerciseEngine = ExerciseEngine;
