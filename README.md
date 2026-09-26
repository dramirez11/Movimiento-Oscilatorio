# ⚛️ Cuaderno Digital Interactivo de Física III: Movimiento Oscilatorio y M.A.S.

[![Licencia](https://img.shields.io/badge/Licencia-Educativa%20UTP-blue.svg)](#-derechos-de-autor-y-propiedad-intelectual)
[![Institución](https://img.shields.io/badge/Instituci%C3%B3n-Universidad%20Tecnol%C3%B3gica%20de%20Pereira-gold.svg)](https://www.utp.edu.co/)
[![Asignatura](https://img.shields.io/badge/Asignatura-F%C3%ADsica%20III-red.svg)](#)
[![Multiplataforma](https://img.shields.io/badge/Plataformas-Android%20%7C%20iOS%20%7C%20Mac%20%7C%20Windows-green.svg)](#)
[![Tecnologías](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20ES6%2B-orange.svg)](#)

---

## 📖 Descripción del Proyecto

El **Cuaderno Digital Interactivo de Física III** es una plataforma científica, didáctica e interactiva orientada al estudio exhaustivo del **Movimiento Oscilatorio y el Movimiento Armónico Simple (M.A.S.)**. 

Diseñado bajo la metáfora visual y sensorial de un **libro físico de hojas abiertas**, combina rigor matemático, demostraciones teóricas, simulaciones físicas en tiempo real a 60 FPS, planos interactivos estilo GeoGebra y un solucionador pedagógico de problemas estructurado en cinco fases normativas.

Este proyecto fue desarrollado como entrega académica para la asignatura de **Física III (Ondas y Oscilaciones)** en la **Universidad Tecnológica de Pereira (UTP)**.

---

## 👥 Autores y Equipo de Desarrollo

Proyecto realizado por los estudiantes de la **Universidad Tecnológica de Pereira**:

* 👨‍💻 **David Alejandro Ramirez Bolaños**
* 👨‍💻 **Steven Vélez Garces**
* 👨‍💻 **Sergio Andrés Velásquez Arana**

---

## 🏛️ Contexto Académico e Institucional

* **Institución:** Universidad Tecnológica de Pereira (UTP)
* **Facultad / Departamento:** Departamento de Física / Ciencias Básicas
* **Asignatura:** Física III (Ondas y Oscilaciones)
* **Tema Principal:** Movimiento Oscilatorio, Dinámica del M.A.S., Energía Mecánica, Sistemas Canónicos y Fasores

---

## 🌟 Características Principales

### 1. 📚 Experiencia de Lectura Adaptativa (Doble Página & Móvil Vertical)
* **Modo Libro Abierto (Doble Página):** En pantallas panorámicas (computadoras de escritorio, laptops Mac/Windows y tablets en horizontal), despliega páginas par e impar simultáneamente con efecto de lomo central y animaciones 3D fluidas de paso de página.
* **Modo Página Simple Automático:** En smartphones (Android e iOS/iPhone) y dispositivos en orientación vertical (*portrait*), conmuta automáticamente a una página completa por vista para aprovechar el 100% del ancho de pantalla sin deformaciones.
* **Efectos Acústicos Inmersivos:** Síntesis sonora estéreo en tiempo real mediante la Web Audio API que emula el roce táctil de las hojas de un cuaderno físico.

### 2. 🗺️ Mapa Mental Conceptual Dinámico
* Taxonomía completa del M.A.S. (Cinemática, Dinámica, Conservación de la Energía, Sistemas Físicos y Unidades SI).
* Gráficos vectoriales SVG escalables con distribución espacial amplia, cero solapamiento de textos y curvas Bézier fluidas.
* Navegación táctil completa con arrastre (*pan*) y gesto de pellizco para zoom (*pinch-to-zoom*) en dispositivos táctiles.

### 3. 📈 Motor Gráfico de Plano Cartesiano Propio (Estilo GeoGebra)
* Lienzo HTML5 Canvas con soporte de alta densidad (Retina / High DPI).
* Visualización simultánea o selectiva de las curvas armónicas:
  * Elongación: $x(t) = A \cos(\omega t + \varphi)$
  * Velocidad: $v(t) = -A\omega \operatorname{sen}(\omega t + \varphi)$
  * Aceleración: $a(t) = -\omega^2 x(t)$
* Ajuste interactivo de parámetros en tiempo real: Amplitud ($A$), Frecuencia angular ($\omega$) y Fase inicial ($\varphi$).
* Reescalado independiente de ejes cartesianos (arrastre directo sobre el eje $X$ o eje $Y$).
* Cursor inteligente con lectura de coordenadas instantáneas $(t, f(t))$.

### 4. 🧪 Laboratorio Virtual de Oscilaciones y Fasores (60 FPS)
* **Simulador Masa-Resorte:** Animación en tiempo real con integración numérica, trazado dinámico de resortes elásticos, vectores de velocidad/aceleración y barras de balance de energía mecánica ($E_k + E_p = E_m$).
* **Fasor Rotatorio y Onda Sinusoidal:** Demostración visual de la correspondencia biunívoca entre el Movimiento Circular Uniforme (M.C.U.) y el Movimiento Armónico Simple proyectado.
* **Ventana Modal Expandible y Colapsable:** Permite ampliar cualquier gráfica a pantalla casi completa (92vw / 86vh) o minimizarla como widget flotante en la esquina para continuar la lectura del cuaderno sin interrumpir la simulación.

### 5. 📝 Taller de Problemas con Metodología Didáctica de 5 Fases
1. **Fase 1 (Azul):** Identificación rigurosa de Datos y Parámetros del SI.
2. **Fase 2 (Rojo):** Determinación explícita de Incógnitas.
3. **Fase 3 (Gris):** Selección del Modelo Teórico y Ecuaciones Físicas.
4. **Fase 4 (Naranja):** Despeje algebraico analítico y sustitución numérica paso a paso.
5. **Fase 5 (Verde):** Validación dimensional y análisis de coherencia física de los resultados.
* Incluye un **Generador y Validador Interactivo** de problemas personalizados.

### 6. 📐 Rigor Matemático KaTeX & Álgebra Simbólica
* Renderizado nítido de fórmulas matemáticas y ecuaciones diferenciales mediante KaTeX.
* Soporte para cálculo y verificación simbólica a través de Nerdamer.js.

### 7. 📱 Compatibilidad Móvil y Multiplataforma Total
* Optimizado para **Android, iOS (iPhone/iPad), macOS, Windows y Linux**.
* Soporte de áreas seguras (`viewport-fit=cover`, `env(safe-area-inset-bottom)` para Dynamic Island y Notch de iPhone).
* Altura dinámica con unidades `100dvh` para evitar saltos con las barras de navegación móviles.
* Manifiesto PWA (`manifest.json`) y Service Worker (`sw.js`) preparados para instalación como aplicación web de escritorio y móvil.

---

## 🗂️ Estructura del Repositorio

```text
├── css/
│   └── styles.css           # Sistema de diseño editorial, libro abierto y estilos responsivos
├── imagenes/
│   ├── portada.webp         # Portada oficial de alta definición (UTP)
│   ├── hoja_blanco2.png     # Textura optimizada de hoja de cuaderno digital
│   └── ...
├── js/
│   ├── app.js               # Orquestador central de la aplicación y navegación entre páginas
│   ├── audio.js             # Sintetizador Web Audio API para efectos acústicos de página
│   ├── exercises.js         # Motor didáctico del taller interactivo y validador de problemas
│   ├── geogebra_canvas.js   # Motor del plano cartesiano interactivo tipo GeoGebra en Canvas 2D
│   ├── mindmap.js           # Mapa mental conceptual interactivo en SVG con soporte táctil
│   └── simulators.js        # Laboratorio virtual (Masa-Resorte a 60 FPS y Fasores rotatorios)
├── index.html               # Estructura semántica completa de las 13 páginas del cuaderno
├── manifest.json            # Configuración Progressive Web App (PWA)
├── sw.js                    # Service Worker para almacenamiento en caché y uso offline
└── README.md                # Documentación oficial del proyecto
```

---

## 🚀 Puesta en Marcha / Cómo Ejecutarlo

El proyecto ha sido concebido bajo una arquitectura web estándar sin dependencias de compilación pesadas, por lo que **no requiere instalación previa de Node.js ni bundlers**.

### Opción 1: Abrir directamente en el navegador
1. Clona o descarga este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/cuaderno-fisica-3.git
   ```
2. Haz doble clic en el archivo [`index.html`](index.html) para abrirlo en tu navegador favorito (Chrome, Firefox, Safari, Edge).

### Opción 2: Servidor local ligero (Recomendado para Service Worker y PWA)
Puedes iniciar un servidor web local usando cualquiera de las siguientes herramientas:

* **Con Python:**
  ```bash
  python -m http.server 8080
  ```
  Luego abre en tu navegador: `http://localhost:8080/`

* **Con Node.js (npx serve):**
  ```bash
  npx serve .
  ```

* **Con la extensión Live Server de VS Code:**
  Haz clic derecho sobre `index.html` y selecciona *"Open with Live Server"*.

### Opción 3: Publicación en GitHub Pages
Para desplegar este cuaderno públicamente en internet con enlace propio:
1. Sube este repositorio a tu cuenta de GitHub.
2. Ve a la pestaña **Settings** > **Pages**.
3. En **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`.
4. Haz clic en **Save**. En unos minutos tu cuaderno estará disponible en `https://tu-usuario.github.io/nombre-del-repo/`.

---

## ⚖️ Derechos de Autor y Propiedad Intelectual

> [!IMPORTANT]
> **Aviso de Propiedad Intelectual y Fines Académicos:**
> 
> * **Titularidad de la Obra:** Este software, material didáctico, código fuente, ilustraciones y desarrollos interactivos fueron creados y diseñados por los autores:
>   * **David Alejandro Ramirez Bolaños**
>   * **Steven Vélez Garces**
>   * **Sergio Andrés Velásquez Arana**
> * **Propósito Educativo:** Este proyecto fue desarrollado exclusivamente con fines pedagógicos, formativos y académicos para la asignatura de **Física III** de la **Universidad Tecnológica de Pereira (UTP)**.
> * **Créditos Institucionales:** La identidad visual, logotipos y referencias institucionales pertenecen a la **Universidad Tecnológica de Pereira**.
> * **Uso y Distribución:** Se autoriza la consulta, estudio, visualización y uso no comercial de este cuaderno con fines educativos y de divulgación científica, siempre y cuando se otorgue el respectivo **reconocimiento de autoría** a los desarrolladores y a la institución académica correspondiente.
> * **Prohibición de Uso Comercial:** Queda expresamente prohibida la reproducción total o parcial con fines lucrativos o comerciales sin el consentimiento previo por escrito de los autores.

---

## 📚 Bibliografía de Referencia

1. **Serway, R. A., & Jewett, J. W.** (2018). *Física para ciencias e ingeniería* (10.ª ed., Vol. 1). Cengage Learning.
2. **Sears, F. W., Zemansky, M. W., Young, H. D., & Freedman, R. A.** (2018). *Física universitaria con física moderna* (14.ª ed., Vol. 1). Pearson Educación.
3. **Tipler, P. A., & Mosca, G.** (2010). *Física para la ciencia y la tecnología: Oscilaciones y ondas* (6.ª ed., Vol. 1). Editorial Reverté.
4. **French, A. P.** (2003). *Vibraciones y ondas* (Edición en español). Editorial Reverté.

---

<div align="center">
  <sub>Universidad Tecnológica de Pereira • Facultad de Ciencias Básicas • Física III</sub><br>
  <sub>Pereira, Risaralda, Colombia</sub>
</div>
