# T-ScapeRoom

Experiencia web educativa interactiva con estética de sistema de ciberseguridad comprometido.

## Stack

- HTML
- CSS
- JavaScript (ES Modules, sin dependencias externas)

## Estructura

```
/
├── index.html                 # Único punto de entrada (SPA)
├── src/
│   ├── main.js                # Bootstrap
│   ├── core/                  # Núcleo: app, estado, router, constantes
│   ├── audio/                 # Sistema de audio centralizado
│   ├── animation/             # Animaciones y transiciones
│   ├── vfx/                   # Efectos visuales (glitch, alertas, etc.)
│   ├── ui/                    # Componentes UI reutilizables
│   └── screens/               # Pantallas (una carpeta por pantalla)
│       ├── initialLoading/
│       ├── intro/
│       ├── phase1/            # loading, game, defeat-loading, defeat
│       ├── phase2/            # loading, game, defeat-loading, defeat
│       ├── phase3/            # loading, game, defeat
│       └── achievement/       # loading, screen
├── styles/
│   ├── variables.css          # Paleta y tokens (TECSUP #231F20)
│   ├── global.css
│   ├── animations.css
│   ├── effects.css            # VFX CSS
│   ├── components.css         # Botones, popups, loaders
│   └── screens/               # CSS por pantalla
└── assets/                    # imágenes, audio, fuentes, vfx (vacío por ahora)
```

## Flujo de pantallas

```
Loading inicial → Inicio → Loading Fase 1 → Fase 1 → Loading Fase 2 → Fase 2
→ Loading Fase 3 → Fase 3 → Loading logro → Logro desbloqueado

Derrota (cualquier fase): Fase X → Loading derrota → Derrota X → Reiniciar → Loading inicial
```

### Estado actual (carcasa + Fase 1 + Fase 2 + Fase 3)

- Inicio y Fase 1 están implementados por completo.
- Fase 2 está implementada por completo (ingeniería social): una
  terminal "RESTAURANDO CANAL DE COMUNICACIÓN" muestra el código de
  verificación que el jugador debe proteger (nunca compartir) mientras
  atiende 3 contactos:
  - 2 atacantes (soporte técnico y asistencia) → solicitan el código;
    el jugador puede verificar, escalar (segunda oportunidad) o compartirlo.
  - 1 contacto legítimo (soporte oficial) → se verifica con "Identidad
    verificada" un marcador seguro.
  - Compartir datos o el código compromete la fase: `PHASE_2_DEFEAT_LOADING`
    (inundación de mensajes + 50 alertas) → `PHASE_2_DEFEAT` (reinicio).
  - Al verificar a los 3 contactos: terminal final, clase `restored`,
    popup educativo "RECUERDA" y `CONTIUNAR → PHASE_3_LOADING`.
- Fase 3 está implementada por completo para el flujo ganador:
  `PHASE_3_LOADING` (recuperación de archivos) → `PHASE_3` (reporte,
  Actividad 1: archivos recuperados, Actividad 2: 50 archivos a verificar,
  Actividad 3: 5 archivos eliminados con temporizador) →
  `ACHIEVEMENT_LOADING` (generación de reporte) → `ACHIEVEMENT` (nota final
  sobre 20 + mensaje según nota + reinicio).
- La Fase 3 no tiene derrota: las respuestas solo afectan la puntuación.

## Cómo cambiar de pantalla

```js
import { Router } from './src/core/router.js';
import { SCREENS } from './src/core/constants.js';

Router.show(SCREENS.PHASE_2_LOADING);
```

## Cómo agregar una nueva pantalla

1. Crea carpeta en `src/screens/<nombre>/`.
2. Exporta un objeto `{ id, render(container), async enter(), async exit() }`.
3. Importa el módulo y regístralo en `src/core/app.js` dentro de `Router.registerAll([...])`.

Los listeners estáticos van en `render()` (se ejecuta una sola vez); la lógica por entrada/salida va en `enter()`/`exit()`.

## Sistemas centrales

| Sistema | Módulo | Uso |
| --- | --- | --- |
| Estado | `core/state.js` | `State.get()`, `State.set()`, `State.subscribe()` |
| Router | `core/router.js` | `Router.show(id)` |
| Audio | `audio/audioManager.js` | `AudioManager.playSFX()`, `playMusic()`, `stopMusic()` |
| Animación | `animation/animationManager.js` | fade, slide, scale |
| VFX | `vfx/vfxManager.js` | `VFXManager.trigger('glitch')`, `redFlash()`, etc. |
| UI | `ui/uiManager.js` | botones, popups, loaders |

## Puntos de integración para las fases

- `screens/phase1/` → Fase 1 implementada (intro de bloques, pregunta validada, secuencia de acciones).
- `screens/phase2/` → Fase 2 implementada (ingeniería social; datos y validador en
  `phase2Game/phase2Data.js` y `phase2Validator.js`).
- `screens/phase3/` → Fase 3 implementada (reporte, actividades, temporizador y resultado).
- `core/constants.js` `AUDIO_SFX` → mapeo de eventos de sonido.
- `audio/audioConfig.js` → rutas de archivos de audio (aún vacías; el
  `AudioManager` usa síntesis WebAudio como fallback cuando el asset falta,
  por lo que los SFX suenan incluso sin archivos).

## Estado actual

Carcasa inicial + Fases 1, 2 y 3 implementadas por completo. Fase 2 es el
bloque de ingeniería social (verificación de identidad vs. compartición de
código) y enlaza con la Fase 3. El detalle pedagógico y de puntuación de la
Fase 3 está en `screens/phase3/phase3Game/`. TECSUP se representa en el
resultado con un placeholder limpio (los assets de `assets/images/` aún no
existen).

## Pruebas (harness en memoria, sin dependencias)

- Fase 1: 22 checks (`harness.mjs`).
- Fase 2: 55 checks (`harness-phase2.mjs`): datos/validador, loading,
  terminal con código, chat por 3 contactos, victoria (popup RECUERDA +
  continua a Fase 3), escalada recuperable, derrota (inundación + alertas),
  reinicio limpio y volumen conservado.
- Fase 3: 87 checks (`harness-phase3.mjs`).
- `verify-imports.js`: 134 imports sin errores.