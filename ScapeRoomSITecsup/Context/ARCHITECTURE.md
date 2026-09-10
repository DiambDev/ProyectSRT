# Arquitectura

## 1. Visión general

T-ScapeRoom es un SPA (Single Page Application) construido con JavaScript vanilla y ES Modules, sin frameworks ni bundlers. La aplicación simula un escape room educativo sobre ciberseguridad donde el jugador avanza por 3 fases, tomando decisiones que afectan el resultado final.

La arquitectura se organiza en torno a un **Router centralizado** que gestiona **pantallas** como objetos con un ciclo de vida definido. El **estado global** vive en un store plano con suscripciones, y un conjunto de **managers singleton** proveen servicios transversales (audio, animación, VFX, UI).

```
index.html → main.js → App.init() → Router.show(INITIAL_LOADING)
```

El navegador carga `index.html`, que incluye `main.js` como módulo ES. `main.js` llama a `App.init()`, que inicializa los 4 managers, registra las 16 pantallas en el Router, y navega a la primera pantalla.

## 2. Capas principales

### Core (`src/core/`)

El núcleo de la aplicación. Contiene 4 módulos:

| Módulo | Responsabilidad |
|---|---|
| `app.js` | Bootstrap: inicializa managers, registra pantallas, inicia navegación |
| `router.js` | Navegación entre pantallas con transiciones fade |
| `state.js` | Store global plano con suscripciones por clave |
| `constants.js` | Enums: `SCREENS` (16 pantallas), `EVENTS` (12 eventos), `AUDIO_SFX` (14 SFX), `DEFAULT_TRANSITION` |

`app.js` es el único punto de orquestación. Solo importa módulos de `core/`, `screens/`, y los managers.

### Screens (`src/screens/`)

Cada carpeta de pantalla contiene un objeto que exporta `{ id, render(), enter(), exit() }`. Hay 6 grupos principales:

```
screens/
├── initialLoading/     # Pantalla de carga inicial
├── intro/              # Pantalla de bienvenida
├── phase1/             # Fase 1: loading, game, defeat-loading, defeat
├── phase2/             # Fase 2: loading, game, defeat-loading, defeat
├── phase3/             # Fase 3: loading, game, defeat-loading, defeat
└── achievement/        # Achievement: loading, screen
```

Las fases 1, 2 y 3 tienen subcarpetas con hasta 4 pantallas cada una (loading, game, defeat-loading, defeat). La Fase 3 además descompone su `game/` en módulos independientes por actividad.

### Audio (`src/audio/`)

- `audioManager.js` — Singleton con lógica de reproducción, síntesis WebAudio y probe de assets
- `audioConfig.js` — Configuración de rutas y volumen de cada SFX y pista de música

### Animation (`src/animation/`)

- `animationManager.js` — Utilidades de transición: `fadeIn`, `fadeOut`, `slideUp`, `slideDown`, `scaleIn`, `staggerElements`

### VFX (`src/vfx/`)

- `vfxManager.js` — Coordinator que despacha efectos a módulos especializados
- `glitch.js` — Efecto de distorsión visual
- `screenEffects.js` — Flash rojo, scanlines, shake de error, corrupción de píxeles

### UI (`src/ui/`)

- `uiManager.js` — Coordinator: delega creación de componentes, binding global de SFX en clicks
- `components/index.js` — `createButton`, `createPopup`, `createLoadingIndicator`, `createVolumeControl`
- `typewriter.js` — Efecto de escritura progresiva de texto

### Styles (`styles/`)

```
styles/
├── variables.css       # Tokens de diseño (colores, fuentes, transiciones)
├── global.css          # Reset, estructura base (#app, #screen-container, .screen)
├── animations.css      # Keyframes CSS
├── effects.css         # VFX CSS (glitch, scanlines, shake)
├── components.css      # Botones, popups, loaders
└── screens/            # CSS específico por pantalla
    ├── initial-loading.css
    ├── intro.css
    ├── phase1.css
    ├── phase2.css
    ├── phase3.css
    ├── defeat.css
    └── achievement.css
```

Tres conjuntos de variables CSS coexisten:
- `--system-*` — Terminal hacker (fases 1-2): verde sobre negro
- `--p3-*` — Fase 3: azul TECSUP sobre fondo oscuro
- `--tecsup-*` — Pantalla final: identidad clara (blanco + azul)

### Data

Los datos no están en una capa separada sino integrados en cada pantalla:
- `src/screens/phase1/phase1Game/phase1Data.js` — Textos, opciones, secuencia de la Fase 1
- `src/screens/phase2/phase2Game/phase2Data.js` — Contactos, mensajes, opciones de la Fase 2
- `src/screens/phase3/phase3Game/phase3Data.js` — Puntajes, archivos, opciones, mensajes de la Fase 3
- `src/screens/phase3/phase3Game/phase3Files.js` — Generador de archivos (20 corruptos + 30 normales)

## 3. Flujo de la aplicación

### Inicialización

```
DOMContentLoaded → App.init()
  → AudioManager.init()     (probe de assets, listeners de eventos)
  → AnimationManager.init()  (vacío)
  → VFXManager.init()        (listener de VFX_TRIGGER)
  → UIManager.init()         (listener global de click → SFX)
  → Router.registerAll(16 pantallas)
  → Router.show(INITIAL_LOADING)
```

### Flujo del juego (camino ganador)

```
INITIAL_LOADING → INTRO
→ PHASE_1_LOADING → PHASE_1
  → PHASE_2_LOADING → PHASE_2
    → PHASE_3_LOADING → PHASE_3
      → ACHIEVEMENT_LOADING → ACHIEVEMENT
```

### Flujo de derrota (Fases 1 y 2)

```
PHASE_X → PHASE_X_DEFEAT_LOADING → PHASE_X_DEFEAT → reinicio → INITIAL_LOADING
```

La Fase 3 no tiene derrota: el jugador siempre completa las 3 actividades y avanza a `ACHIEVEMENT_LOADING`.

### Navegación

Cualquier módulo puede navegar ejecutando:

```js
Router.show(SCREENS.PHASE_2_LOADING);
```

El Router gestiona la transición: espera a que termine la transición actual (`transitioning`), fade out de la pantalla actual, destrucción del contenedor, creación de uno nuevo, render de la nueva pantalla, fade in.

## 4. Estado

### Store global

El estado vive en `src/core/state.js` como un objeto plano con un sistema de suscripciones:

```js
State.get('phase3State')        // retorna copia de la clave
State.set('phase3State', {...})  // reemplaza la clave y emite evento
State.subscribe('phase3State', callback)  // suscribirse a cambios
State.resetGame()                // reinicia juego, preserva volume/muted
```

Cada `set()` emite un `CustomEvent` en `window` con `{ key, prev, value }`. Los suscriptores se registran por clave o con `'*` para escuchar todos los cambios.

### Estructura del estado

```
state
├── currentScreen: string       # ID de la pantalla actual
├── currentPhase: number        # 0, 1, 2 o 3
├── volume: number              # 0-1 (se preserva entre reinicios)
├── muted: boolean              # se preserva entre reinicios
├── gameProgress
│   ├── phase1: 'pending' | 'complete' | 'failed'
│   ├── phase2: 'locked' | 'pending' | 'complete' | 'failed'
│   ├── phase3: 'locked' | 'pending' | 'complete'
│   └── achievement: boolean
├── phase1State: {}             # datos de la Fase 1
├── phase2State: {}             # datos de la Fase 2
├── phase3State: {}             # datos de la Fase 3 (ver detalle abajo)
└── achievementState: {}        # datos del logro
```

### phase3State (detalle)

```
phase3State
├── currentActivity: 'report' | 'activity1' | 'activity2' | 'activity3'
├── activity1Score, activity2Score, activity3Score, finalScore
├── files: []                   # 50 archivos generados
├── deletedByUser: []           # IDs eliminados por el jugador
├── correctDeletions, incorrectDeletions
├── activity3Decision: string | null
├── activity3TimeLeft: number   # segundos restantes
└── completed: boolean
```

### Comunicación entre sistemas

Los sistemas se comunican a través de 3 mecanismos:
1. **State** — Lee/escribe datos compartidos
2. **CustomEvent en window** — Eventos desacoplados (`SCREEN_CHANGE`, `VFX_TRIGGER`, `AUDIO_PLAY_SFX`, etc.)
3. **Imports directos** — Las pantallas importan managers y datos directamente

## 5. Pantallas

### Interfaz

Cada pantalla exporta un objeto con esta interfaz:

```js
{
  id: SCREENS.X,               // string único
  render(container) {},         // una vez: crear DOM, bind listeners estáticos
  async enter() {},            // cada vez que se navega aquí
  async exit() {}              // cada vez que se sale
}
```

### Ciclo de vida

1. **Router.show(id)** — El Router busca la pantalla en el Map
2. **_exitScreen** — Fade out (400ms), llama `exit()`, elimina clase `active`
3. **_enterScreen** — Destruye contenedor anterior, crea `<div class="screen">`, llama `render()`, agrega al DOM, fade in, llama `enter()`

### Patrón interno de las pantallas de fase

Las pantallas de fase (game) suelen seguir este patrón:

```
render()  → Crea el layout base (HTML estático, container)
enter()   → Inicializa estado, renderiza contenido dinámico, inicia timers
exit()    → Limpia timers, marca _alive = false
```

El flag `_alive` se usa para evitar actualizaciones de estado después de salir de la pantalla.

### Descomposición interna de Fase 3

`phase3Game.js` orquesta internamente 4 sub-pantallas:
- `report.js` — Renderiza el reporte inicial del incidente
- `activity1.js` — Pregunta MC de archivos recuperados
- `activity2.js` — Explorador de archivos modificados (el más complejo)
- `activity3.js` — Pregunta MC con temporizador de archivos eliminados

Cada sub-pantalla es una función `renderX(screen)` que recibe la pantalla padre y modifica su `rootEl`. No son pantallas Router — son componentes internos.

## 6. Managers y sistemas

### AudioManager (`src/audio/audioManager.js`)

**Responsabilidad:** Reproducir SFX y música.

- `playSFX(name)` — Busca asset → si no existe, usa síntesis WebAudio
- `playMusic(track)` — Reproduce pista de música (con loop opcional)
- `stopMusic()` — Pausa y resetea la música actual
- `setVolume(val)`, `mute()`, `unmute()` — Control de volumen

**Detalle de síntesis:** Cada SFX tiene un "patch" definido como combinación de osciladores (`tone()`) y ruido (`noiseBurst()`). Los patches están en `synthPatches` (objeto local del módulo).

**Inicialización:** `init()` hace probe de assets con `fetch HEAD` para cada SFX y música. Los resultados se cachean en `assetAvailable`. Si un asset no está disponible, se usa síntesis.

### AnimationManager (`src/animation/animationManager.js`)

**Responsabilidad:** Utilidades de transición CSS.

Métodos: `fadeIn`, `fadeOut`, `slideUp`, `slideDown`, `scaleIn`, `staggerElements`, `resetStyles`.

Todos retornan `Promise` que se resuelve al finalizar la transición. Se usan internamente en las pantallas, no son invocados por el Router.

### VFXManager (`src/vfx/vfxManager.js`)

**Responsabilidad:** Efectos visuales especiales.

Escucha el evento `VFX_TRIGGER` en `window`. Despacha a:
- `Glitch.run(el, duration)` — Distorsión visual
- `ScreenEffects.redFlash()` — Flash rojo de alerta
- `ScreenEffects.scanlines()` — Líneas de escaneo
- `ScreenEffects.errorShake()` — Temblor de error
- `ScreenEffects.pixelCorruption()` — Corrupción de píxeles

Las pantallas pueden invocarlo directamente: `VFXManager.trigger('glitch')` o `VFXManager.redFlash()`.

### UIManager (`src/ui/uiManager.js`)

**Responsabilidad:** Componentes UI reutilizables y binding global de audio.

- `createButton()`, `createPopup()`, `createLoadingIndicator()`, `createVolumeControl()` — Delega a `components/index.js`
- `_bindGlobalEvents()` — Listener global de `click` en `document`: si el target es `.btn`, reproduce `CLICK` SFX automáticamente
- `bindButtonSFX(btn)` — Agrega SFX `HOVER` al `mouseenter` de un botón específico

### AudioManager + UIManager: Audio global en botones

El `UIManager` hace que **todos** los botones con clase `.btn` reproduzcan `CLICK` al hacer click, sin necesidad de agregar listeners individualmente. Excepción: los botones de volumen (`data-vol`) se excluyen para evitar doble sonido.

## 7. Fases del Escape Room

### Fase 1 — Recuperación de archivos

**Archivos:** `src/screens/phase1/phase1Game/`

**Pantallas:** loading → game (sin defeat)

**Game:** Muestra 3 bloques de progreso (el bloque 3 falla intencionalmente), luego una pregunta MC sobre integridad de archivos. El jugador debe responder correctamente para avanzar.

**Estado:** `phase1State` almacena la respuesta del jugador.

**Puntaje:** 4 puntos (correctIndex=0).

### Fase 2 — Ingeniería social

**Archivos:** `src/screens/phase2/phase2Game/`

**Pantallas:** loading → game (con defeat-loading y defeat)

**Game:** Terminal de verificación + chat con 4 contactos. Cada contacto presenta una situación de phishing con 4 opciones (aleatorizadas). El jugador debe identificar la opción segura. Compartir datos o código derrota la fase.

**Componentes internos:**
- `phase2Data.js` — Contactos, mensajes, opciones, códigos de carga
- `phase2Validator.js` — Lógica de validación (safe/risk/critical por contenido, no por posición)
- `phase2Game.js` — Layout de 3 paneles (contactos, chat, terminal)

**Estado:** `phase2State` almacena contacto actual, turnos, contactos verificados, decisiones.

**Puntaje:** Sin puntaje numérico — victoria o derrota.

### Fase 3 — Análisis y recuperación

**Archivos:** `src/screens/phase3/phase3Game/`

**Pantallas:** loading → game (con defeat-loading y defeat, pero sin uso real)

**Game:** Orquestado por `phase3Game.js`, descompone en 4 etapas:

1. **Reporte** (`report.js`) — Estadísticas del incidente
2. **Actividad 1** (`activity1.js`) — MC sobre archivos recuperados (4 puntos)
3. **Actividad 2** (`activity2.js`) — Explorador de archivos, eliminar corruptos (14 puntos)
4. **Actividad 3** (`activity3.js`) — MC con temporizador sobre métodos de recuperación (2 puntos)

**Datos:** `phase3Data.js` contiene toda la configuración (puntajes, archivos, opciones, mensajes de feedback). `phase3Files.js` genera los 50 archivos dinámicamente.

**Estado:** `phase3State` almacena puntajes por actividad, archivos, decisiones, temporizador.

**Puntaje:** 20 puntos totales (4 + 14 + 2). No hay derrota.

### Relación entre fases

Las fases son **independientes en estado** — cada una tiene su propio objeto en el store global. No comparten datos directamente. El único acoplamiento es:
- `gameProgress` controla el desbloqueo secuencial
- Los puntajes finales se leen en la pantalla de achievement
- `State.resetGame()` reinicia todas las fases simultáneamente

## 8. Dependencias entre sistemas

```
App
├── Router          ← core/router.js
├── State           ← core/state.js
├── AudioManager    ← audio/audioManager.js
├── AnimationManager← animation/animationManager.js
├── VFXManager      ← vfx/vfxManager.js
└── UIManager       ← ui/uiManager.js
```

### Dependencias confirmadas por importación

| Módulo | Depende de |
|---|---|
| `app.js` | Router, State, AudioManager, AnimationManager, VFXManager, UIManager, todas las pantallas |
| `router.js` | State (set currentScreen) |
| `state.js` | constants (EVENTS) |
| `audioManager.js` | audioConfig, constants (EVENTS, AUDIO_SFX), State |
| `vfxManager.js` | constants (EVENTS), glitch.js, screenEffects.js |
| `uiManager.js` | components/index.js, AudioManager, constants (AUDIO_SFX) |
| `animationManager.js` | *(ninguna dependencia externa)* |
| Cada pantalla | Router, State, AudioManager,常有的 UI/Animation/VFX |

### Flujo de eventos (CustomEvent)

```
SCREEN_CHANGE ← Router emite, AudioManager escucha (playSFX TRANSITION)
STATE_CHANGE  ← State emite, suscriptores escuchan
VFX_TRIGGER   ← Pantallas emiten, VFXManager escucha
AUDIO_PLAY_SFX ← Cualquiera emite, AudioManager escucha
```

## 9. Puntos sensibles

### Router (`src/core/router.js`)

**Riesgo:** El ciclo `transitioning` controla la navegación. Si una pantalla `enter()` nunca resuelve, la aplicación se bloquea.

**Cuidado:** No agregar `await` indefinidos en `enter()`. El flag `_alive` en las pantallas debe verificarse antes de actualizar estado.

### State (`src/core/state.js`)

**Riesgo:** `State.get()` retorna copias浅 (shallow copy). Objetos anidados (como `phase3State.files`) se comparten por referencia. Modificar un archivo directamente muta el estado sin emitir evento.

**Cuidado:** Para modificar objetos anidados, usar `State.set()` con el objeto completo, o `State.update()` con un merge profundo deliberado.

### AudioManager (`src/audio/audioManager.js`)

**Riesgo:** El AudioContext del navegador requiere interacción del usuario para activarse. El `init()` registra un listener de `pointerdown` para hacer `resume()`.

**Cuidado:** No llamar `playSFX` o `playMusic` antes de la primera interacción del usuario. El `probeAssets()` es async y puede no haber terminado cuando se llama `playSFX()` por primera vez.

### Fase 3 game/ (`phase3Game.js`)

**Riesgo:** Gestiona timers internos (`_timers`, `_intervalId`) que deben limpiarse en `exit()`. Si no se limpian, causan errores después de navegar away.

**Cuidado:** Verificar que `_alive` sea `true` antes de ejecutar cualquier lógica async. Los timers se almacenan en `this._timers` (Set) y se limpian en `exit()`.

### Actividad 2 (`activity2.js`)

**Riesgo:** Es la pantalla más compleja del proyecto. Tiene estado propio, interacción con archivos, scoring con clamp, y popup de resumen.

**Cuidado:** El scoring usa `clampActivity2(raw)` que limita a [0, 14]. No modificar los valores de `perCorrect` (1), `perWrong` (0.5) o `maxScore` (14) sin recalcular el impacto.

### Pantalla final (`achievementScreen.js`)

**Riesgo:** El layout responsive fue corregido recientemente. El flex centering vertical causaba desbordamiento.

**Cuidado:** No restaurar `display: flex; align-items: center` en `.screen--achievement`. Usar `overflow-y: auto` + `margin: 0 auto`.

### CSS: scopes duplicados

**Riesgo:** `phase3.css` y `achievement.css` tenían reglas duplicadas para `.result-*`. Las de `phase3.css` fueron eliminadas pero podrían reappearcer si se agregan estilos sin scope.

**Cuidado:** Los estilos de la pantalla final deben estar siempre scoped bajo `.screen--achievement`.

## Documentación relacionada

- [[PROJECT]]
- [[DECISIONS]]
