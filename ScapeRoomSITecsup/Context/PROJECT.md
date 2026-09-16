# PROJECT.md — Contexto del Proyecto T-ScapeRoom

## Qué es

Experiencia web educativa interactiva (escape room digital) sobre ciberseguridad, desarrollada para TECSUP. El jugador enfrenta un incidente de seguridad informático y debe tomar decisiones a lo largo de 3 fases para recuperar el control del sistema.

## Stack tecnológico

- **HTML** — SPA con un único `index.html`
- **CSS** — Variables CSS, sin preprocesadores
- **JavaScript** — ES Modules puros, sin framework, sin dependencias externas, sin bundler
- **Audio** — Síntesis WebAudio como fallback cuando no hay assets de audio
- **Imágenes** — Solo 2 logos PNG (`tecsuplogo1.png`, `tecsuplogo2.png`)

## Arquitectura

### Patrón de pantallas (Screen Pattern)

Cada pantalla es un objeto con interfaz `{ id, render(container), async enter(), async exit() }`. El `Router` las gestiona como un SPA con transiciones fade.

### Sistemas centrales

| Sistema | Ubicación | API principal |
|---|---|---|
| Estado | `src/core/state.js` | `State.get()`, `State.set()`, `State.subscribe()` |
| Router | `src/core/router.js` | `Router.show(SCREENS.ID)` |
| Audio | `src/audio/audioManager.js` | `AudioManager.playSFX()`, `playMusic()`, `stopMusic()` |
| Animación | `src/animation/animationManager.js` | fade, slide, scale |
| VFX | `src/vfx/vfxManager.js` | `VFXManager.trigger('glitch')`, `redFlash()` |
| UI | `src/ui/uiManager.js` | `createButton()`, `createPopup()`, `createLoadingIndicator()` |

### Estado global

`State` es un store plano con suscripciones. Mantiene:
- `currentScreen`, `currentPhase`, `volume`, `muted`
- `gameProgress` — bloqueo/desbloqueo de fases
- `phase1State`, `phase2State`, `phase3State` — datos de cada fase

`State.resetGame()` reinicia el juego pero preserva volumen/muted.

### Router

- `Router.registerAll([...screens])` registra todas las pantallas
- `Router.show(SCREENS.X)` navega entre pantallas con transición fade (400ms)
- `_enterScreen` destruye y recrea el contenedor cada vez (fix para bug de reinicio)
- `SCREENS` enum: 16 pantallas definidas en `constants.js`

## Flujo del juego

```
INITIAL_LOADING → INTRO
→ PHASE_1_LOADING → PHASE_1 (3 bloques + pregunta)
  → PHASE_2_LOADING → PHASE_2 (4 contactos + decisiones)
    → PHASE_3_LOADING → PHASE_3 (reporte → A1 → A2 → A3)
      → ACHIEVEMENT_LOADING → ACHIEVEMENT (puntaje final)
```

Derrota en cualquier fase:
```
PHASE_X → PHASE_X_DEFEAT_LOADING → PHASE_X_DEFEAT → reinicio → INITIAL_LOADING
```

## Las 3 fases del juego

### Fase 1 — Recuperación de archivos

- Pantalla de carga con bloques de progreso (el bloque 3 falla intentionalmente)
- Pregunta de opción múltiple sobre integridad de archivos
- **Puntaje: 4 puntos** (correctIndex=0)
- Sin derrota propia (solo avanza al siguiente paso)

### Fase 2 — Ingeniería social (interacción con contactos)

- Terminal con código de verificación (`847291`) que el jugador debe proteger
- 4 contactos con situaciones de phishing:
  - **Escenario 1 (Identidad):** Soporte técnico pide datos → verificar identidad
  - **Escenario 2 (Credenciales):** Asistencia pide contraseña → rechazar
  - **Escenario 3 (Enlace):** Soporte oficial envía enlace → verificar legitimidad
  - **Escenario 4 (Presión):** Gestor de seguridad presiona → confirmar por canal oficial
- Cada contacto tiene 4 opciones (A, B, C, D) con 1 segura, 1 riesgo, 1 crítica
- Opciones se muestran en orden aleatorio (shuffle visual)
- Compartir datos o código → derrota (inundación de mensajes + 50 alertas)
- Las opciones de riesgo son recuperables (segunda oportunidad)
- **Sin puntaje numérico** — solo decide victoria/derrota

### Fase 3 — Análisis y recuperación

Dividida en 3 actividades:

**Reporte inicial:** Muestra estadísticas del incidente (50 recuperados, 20 modificados, 5 eliminados, 75 total).

**Actividad 1 — Análisis de eventos (4 puntos):**
- Visor de Eventos del Sistema con 3 preguntas de opción múltiple
- El jugador analiza logs de Windows (Event ID, niveles, orígenes)
- Busca actividades sospechosas: IPs externas, accesos fallidos, descargas de `.exe`
- correctIndex=1 para la pregunta principal
- correctIndex=1 para la pregunta de evidencia

**Actividad 2 — Verificación de integridad (14 puntos):**
- Explorador de archivos con 25 archivos (10 modificados por SHA-256 + 15 válidos)
- Temporizador de 10:00 minutos
- El jugador selecciona archivos sospechosos y verifica hashes SHA-256
- Popup de resumen al finalizar con puntuación: `(correctos) - (0.5 * falsos positivos)`, clamp [0, 14]
- Timeout = 0 puntos

**Actividad 3 — Recuperación de archivos (2 puntos):**
- Sin temporizador
- Situación: recuperar 5 archivos borrados de 3 fuentes de respaldo (C:, D:, USB)
- 5 opciones de método de recuperación
- correctIndex=2: "Utilizar la copia de seguridad de las 12:00 a.m. de anoche"

**Puntaje total: 20 puntos** (4 + 14 + 2)
- ≥14 Excelente, ≥11 Muy Bueno, ≥8 Bueno, ≥5 Aprobado, <5 Completada
- No hay derrota en Fase 3 — las decisiones solo afectan la puntuación

## Pantalla final (Achievement)

- Fondo claro TECSUP (`#f0f4f8`), tarjeta blanca
- Logo TECSUP (`tecsuplogo2.png`), kicker, título "REPORTE FINAL"
- Score grande: `X / 20`
- Tabla con puntajes por actividad
- Mensaje según score
- Recomendación de Actividad 3
- Botón "REINICIAR SIMULACIÓN"

** responsive:** `overflow-y: auto` en el contenedor, `margin: 0 auto` en la tarjeta. Sin flex centering vertical (causaba desbordamiento).

## Identidad visual

- **Fases 1-2:** Estética oscura de terminal hacker (verde sobre negro, `--system-*`)
- **Fase 3:** Azul TECSUP (`#00aeef`) sobre fondo oscuro (`--p3-*`)
- **Pantalla final:** Identidad clara TECSUP (blanco + azul, `--tecsup-*`)
- **Logos:** `tecsuplogo1.png` (loading screens), `tecsuplogo2.png` (victory screen)
- **Fuentes:** `Courier New` (mono, terminal), `Segoe UI` (sans, UI)

## Audio

- `AudioManager` usa síntesis WebAudio como fallback (no necesita archivos de audio)
- SFX disponibles: click, hover, transition, loading, error, success, glitch, alert, interaction, typing, popup, warning, delete, tick
- Música: `achievement` (victory), `tension` (defeat)
- Control de volumen visible en la UI
- Estado de audio preservado entre reinicios

## Testing

- **Harness fase 1:** `harness.mjs` — 55 checks
- **Harness fase 2:** `harness-phase2.mjs` — 92 checks
- **Harness fase 3:** `harness-phase3.mjs` — 98 checks
- **Verificación de imports:** `verify-imports.js` — 137 imports
- Tests en memoria con Puppeteer, sin dependencias externas
- Verificar que los harnesses pasen antes de hacer cambios

## Restricciones importantes

1. **NO usar frameworks** — todo es JS vanilla con ES Modules
2. **NO depender de npm/bundler** — se ejecuta directamente en el navegador
3. **NO romper la lógica existente** — las fases 1-2-3 ya funcionan correctamente
4. **NO modificar archivos fuera de su alcance** — cada fase es independiente
5. **Assets de audio** — `audioConfig.js` tiene rutas vacías; el AudioManager usa síntesis como fallback
6. **Imágenes** — Solo 2 logos disponibles; no hay imágenes placeholder para las fases
7. **Responsive** — La pantalla final debe ser 100% visible a zoom 100%; las demás fases usan layout fijo de terminal

## Archivos clave para nuevos agentes

| Archivo | Propósito |
|---|---|
| `src/core/constants.js` | IDs de pantallas, eventos, SFX |
| `src/core/state.js` | Store global y estructura de estado |
| `src/core/router.js` | Navegación entre pantallas |
| `src/core/app.js` | Bootstrap y registro de pantallas |
| `src/screens/phase3/phase3Game/phase3Data.js` | Datos, scoring y mensajes de Fase 3 |
| `src/screens/phase2/phase2Game/phase2Data.js` | Contactos y opciones de Fase 2 |
| `styles/variables.css` | Tokens de diseño (colores, fuentes, etc.) |
| `README.md` | Documentación completa del proyecto |
## Documentación relacionada

- [[DECISIONS]]